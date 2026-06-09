"""
sam/voice/tts.py — Text-to-Speech using Piper TTS.

Piper is a fast, local neural TTS engine.
Download from: https://github.com/rhasspy/piper/releases

Voice model download:
    # Example: en_US-lessac-medium
    wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx
    wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json

Setup:
    PIPER_BINARY=./sam-data/voice/piper
    PIPER_VOICE_MODEL=./sam-data/voice/en_US-lessac-medium.onnx
    SAM_VOICE_ENABLED=true

Falls back to system espeak if Piper binary not found.
"""

from __future__ import annotations

import asyncio
import io
import logging
import os
import tempfile
from typing import Optional

logger = logging.getLogger(__name__)

PIPER_BINARY = os.getenv("PIPER_BINARY", "./sam-data/voice/piper")
PIPER_VOICE = os.getenv("PIPER_VOICE_MODEL", "./sam-data/voice/en_US-lessac-medium.onnx")
VOICE_ENABLED = os.getenv("SAM_VOICE_ENABLED", "false").lower() == "true"


class PiperTTS:
    """
    Piper TTS wrapper.

    Generates speech via piper binary and plays it through speakers.
    Can also return raw WAV bytes for streaming to WebSocket clients.

    Falls back to espeak-ng if Piper is not installed.
    """

    def __init__(self):
        self._piper_ok = os.path.isfile(PIPER_BINARY)
        self._model_ok = os.path.isfile(PIPER_VOICE)
        self._espeak_ok = False

        if self._piper_ok and self._model_ok:
            logger.info(f"[TTS] Piper ready: {PIPER_VOICE}")
        elif self._piper_ok and not self._model_ok:
            logger.warning(
                f"[TTS] Piper binary found but voice model missing: {PIPER_VOICE}\n"
                "Download from: https://huggingface.co/rhasspy/piper-voices"
            )
        else:
            logger.warning(
                f"[TTS] Piper binary not found at: {PIPER_BINARY}\n"
                "Download from: https://github.com/rhasspy/piper/releases"
            )
            # Check for espeak fallback
            try:
                import subprocess
                result = subprocess.run(["espeak", "--version"], capture_output=True, timeout=3)
                self._espeak_ok = result.returncode == 0
                if self._espeak_ok:
                    logger.info("[TTS] espeak fallback available.")
            except (FileNotFoundError, Exception):
                pass

    @property
    def is_available(self) -> bool:
        return (self._piper_ok and self._model_ok) or self._espeak_ok

    # ── Speak ─────────────────────────────────────────────────────────────────

    async def speak(self, text: str) -> bool:
        """
        Convert text to speech and play through speakers.

        Args:
            text: Text to speak (will be cleaned of markdown).

        Returns:
            True if speech was played, False if TTS unavailable.
        """
        if not VOICE_ENABLED:
            logger.debug("[TTS] Voice disabled (SAM_VOICE_ENABLED=false)")
            return False

        clean_text = _clean_markdown(text)

        if self._piper_ok and self._model_ok:
            return await self._speak_piper(clean_text)
        elif self._espeak_ok:
            return await self._speak_espeak(clean_text)
        else:
            logger.warning("[TTS] No TTS engine available.")
            return False

    async def synthesize_bytes(self, text: str) -> Optional[bytes]:
        """
        Synthesize speech and return raw WAV bytes.
        Used for streaming to WebSocket/Electron.

        Returns WAV bytes or None if TTS unavailable.
        """
        if not (self._piper_ok and self._model_ok):
            return None

        clean_text = _clean_markdown(text)
        return await self._piper_to_bytes(clean_text)

    # ── Piper ─────────────────────────────────────────────────────────────────

    async def _speak_piper(self, text: str) -> bool:
        """Generate speech with Piper and play via sounddevice."""
        wav_bytes = await self._piper_to_bytes(text)
        if wav_bytes is None:
            return False

        try:
            import sounddevice as sd  # type: ignore
            import numpy as np
            import wave

            with wave.open(io.BytesIO(wav_bytes)) as wf:
                sample_rate = wf.getframerate()
                n_channels = wf.getnchannels()
                frames = wf.readframes(wf.getnframes())

            audio = np.frombuffer(frames, dtype=np.int16)
            if n_channels > 1:
                audio = audio.reshape(-1, n_channels)

            await asyncio.to_thread(
                lambda: sd.play(audio, samplerate=sample_rate, blocking=True)
            )
            return True
        except ImportError:
            logger.warning("[TTS] sounddevice not installed — playing via aplay/ffplay")
            return await self._play_wav_file_from_bytes(wav_bytes)
        except Exception as exc:
            logger.error(f"[TTS] Playback error: {exc}")
            return False

    async def _piper_to_bytes(self, text: str) -> Optional[bytes]:
        """Run piper binary and capture WAV output as bytes."""
        try:
            proc = await asyncio.create_subprocess_exec(
                PIPER_BINARY,
                "--model", PIPER_VOICE,
                "--output-raw",          # raw PCM to stdout
                "--length-scale", "0.9", # slightly faster speech
                "--sentence-silence", "0.2",
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await asyncio.wait_for(
                proc.communicate(input=text.encode("utf-8")),
                timeout=30,
            )
            if proc.returncode != 0:
                logger.warning(f"[TTS] Piper error: {stderr.decode()[:200]}")
                return None
            # Convert raw PCM to WAV
            return _raw_pcm_to_wav(stdout, sample_rate=22050, channels=1)
        except asyncio.TimeoutError:
            logger.warning("[TTS] Piper synthesis timed out")
            return None
        except Exception as exc:
            logger.error(f"[TTS] Piper error: {exc}")
            return None

    async def _play_wav_file_from_bytes(self, wav_bytes: bytes) -> bool:
        """Play WAV using system aplay (Linux) or ffplay as fallback."""
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(wav_bytes)
            tmp_path = tmp.name

        try:
            # Try aplay first (Linux)
            for player in ["aplay", "ffplay -nodisp -autoexit", "paplay"]:
                try:
                    cmd_parts = player.split() + [tmp_path]
                    proc = await asyncio.create_subprocess_exec(
                        *cmd_parts,
                        stdout=asyncio.subprocess.DEVNULL,
                        stderr=asyncio.subprocess.DEVNULL,
                    )
                    await asyncio.wait_for(proc.wait(), timeout=30)
                    return True
                except FileNotFoundError:
                    continue
            return False
        finally:
            try:
                os.remove(tmp_path)
            except Exception:
                pass

    # ── espeak fallback ───────────────────────────────────────────────────────

    async def _speak_espeak(self, text: str) -> bool:
        """Speak via espeak (lower quality fallback)."""
        try:
            proc = await asyncio.create_subprocess_exec(
                "espeak",
                "-v", "en",
                "-s", "150",  # speed
                "-a", "80",   # amplitude
                text[:500],
                stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.DEVNULL,
            )
            await asyncio.wait_for(proc.wait(), timeout=15)
            return True
        except Exception as exc:
            logger.error(f"[TTS] espeak error: {exc}")
            return False


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _clean_markdown(text: str) -> str:
    """Remove markdown formatting so it's not read aloud."""
    import re
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)  # bold
    text = re.sub(r"\*(.+?)\*",     r"\1", text)  # italic
    text = re.sub(r"`(.+?)`",       r"\1", text)  # code
    text = re.sub(r"#{1,6}\s+",     "",    text)   # headings
    text = re.sub(r"\[(.+?)\]\(.+?\)", r"\1", text)  # links
    text = re.sub(r"[-*+] ",        "",    text)   # bullets
    return text.strip()


def _raw_pcm_to_wav(
    pcm_bytes: bytes,
    sample_rate: int = 22050,
    channels: int = 1,
    sample_width: int = 2,  # 16-bit
) -> bytes:
    """Wrap raw PCM bytes in a WAV header."""
    import struct
    data_size = len(pcm_bytes)
    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",
        36 + data_size,
        b"WAVE",
        b"fmt ",
        16,           # chunk size
        1,            # PCM
        channels,
        sample_rate,
        sample_rate * channels * sample_width,  # byte rate
        channels * sample_width,                # block align
        sample_width * 8,                       # bits per sample
        b"data",
        data_size,
    )
    return header + pcm_bytes
