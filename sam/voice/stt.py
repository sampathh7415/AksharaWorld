"""
sam/voice/stt.py — Speech-to-Text using Whisper.cpp.

Two modes:
  BINARY MODE (default):
    Calls `whisper-cli` binary directly as subprocess.
    Each request spawns a new process (slower, but simpler).

  SERVER MODE (recommended):
    Calls whisper.cpp in server mode (persistent process).
    Sends audio via HTTP to localhost:8178.
    Set SAM_WHISPER_SERVER=true to enable.

Setup:
    # Download whisper.cpp binary from GitHub releases:
    # https://github.com/ggerganov/whisper.cpp/releases
    # OR compile from source:
    #   git clone https://github.com/ggerganov/whisper.cpp
    #   cd whisper.cpp && make -j4
    #   bash ./models/download-ggml-model.sh base.en
    #
    # Set env vars:
    #   WHISPER_BINARY=./sam-data/voice/whisper-cli
    #   WHISPER_MODEL=./sam-data/voice/ggml-base.en.bin

Usage:
    stt = WhisperSTT()
    text = await stt.transcribe("/path/to/audio.wav")
    # OR from mic:
    text = await stt.transcribe_mic(duration_seconds=5)
"""

from __future__ import annotations

import asyncio
import logging
import os
import tempfile
import wave
from typing import Optional

logger = logging.getLogger(__name__)

WHISPER_BINARY = os.getenv("WHISPER_BINARY", "./sam-data/voice/whisper-cli")
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "./sam-data/voice/ggml-base.en.bin")
WHISPER_SERVER_URL = os.getenv("WHISPER_SERVER_URL", "http://localhost:8178")
USE_WHISPER_SERVER = os.getenv("SAM_WHISPER_SERVER", "false").lower() == "true"
SAMPLE_RATE = 16000


class WhisperSTT:
    """
    Whisper.cpp speech-to-text wrapper.

    Supports both binary subprocess mode and HTTP server mode.
    Falls back gracefully if whisper is not installed.
    """

    def __init__(self):
        self._available = self._check_available()
        if self._available:
            mode = "server" if USE_WHISPER_SERVER else "binary"
            logger.info(f"[STT] Whisper.cpp ready ({mode} mode)")
        else:
            logger.warning(
                "[STT] Whisper.cpp not found. "
                f"Set WHISPER_BINARY={WHISPER_BINARY} and download the model."
            )

    def _check_available(self) -> bool:
        if USE_WHISPER_SERVER:
            return True  # server availability checked at call time
        return os.path.isfile(WHISPER_BINARY)

    @property
    def is_available(self) -> bool:
        return self._available

    # ── Transcription ─────────────────────────────────────────────────────────

    async def transcribe(self, audio_path: str, language: str = "en") -> str:
        """
        Transcribe a WAV file to text.

        Args:
            audio_path: Path to 16kHz mono WAV file.
            language:   Language code (default "en").

        Returns:
            Transcribed text string.
        """
        if not self._available:
            return "[STT unavailable — Whisper not installed]"

        if USE_WHISPER_SERVER:
            return await self._transcribe_server(audio_path)
        return await self._transcribe_binary(audio_path, language)

    async def _transcribe_binary(self, audio_path: str, language: str = "en") -> str:
        """Transcribe using whisper-cli binary subprocess."""
        if not os.path.isfile(WHISPER_MODEL):
            return "[STT Error] Whisper model not found. Download from https://huggingface.co/ggerganov/whisper.cpp"

        cmd = [
            WHISPER_BINARY,
            "-m", WHISPER_MODEL,
            "-f", audio_path,
            "-l", language,
            "--output-txt",
            "--no-timestamps",
            "-t", str(max(1, os.cpu_count() // 2 or 2)),  # use half CPUs
        ]

        try:
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=30)
            text = stdout.decode("utf-8", errors="replace").strip()
            # whisper-cli sometimes outputs to .txt file alongside audio
            if not text:
                txt_path = audio_path + ".txt"
                if os.path.exists(txt_path):
                    with open(txt_path) as f:
                        text = f.read().strip()
                    os.remove(txt_path)
            return text or ""
        except asyncio.TimeoutError:
            return "[STT Error] Transcription timed out (>30s)"
        except FileNotFoundError:
            return "[STT Error] whisper-cli binary not found"
        except Exception as exc:
            return f"[STT Error] {exc}"

    async def _transcribe_server(self, audio_path: str) -> str:
        """Transcribe using whisper.cpp HTTP server mode."""
        try:
            import httpx
            with open(audio_path, "rb") as f:
                audio_bytes = f.read()
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    f"{WHISPER_SERVER_URL}/inference",
                    files={"file": ("audio.wav", audio_bytes, "audio/wav")},
                    data={"temperature": "0", "response_format": "json"},
                )
                data = resp.json()
                return data.get("text", "").strip()
        except Exception as exc:
            return f"[STT Server Error] {exc}"

    # ── Microphone capture ────────────────────────────────────────────────────

    async def transcribe_mic(
        self,
        duration_seconds: int = 5,
        sample_rate: int = SAMPLE_RATE,
    ) -> str:
        """
        Capture audio from the microphone and transcribe it.

        Args:
            duration_seconds: How long to record (default 5s).
            sample_rate:      Audio sample rate (16kHz for Whisper).

        Returns:
            Transcribed text.
        """
        try:
            import pyaudio  # type: ignore
        except ImportError:
            return "[STT Error] pyaudio not installed. Run: pip install pyaudio"

        logger.info(f"[STT] Recording {duration_seconds}s from microphone…")

        # Record in thread (pyaudio is blocking)
        def _record():
            pa = pyaudio.PyAudio()
            stream = pa.open(
                format=pyaudio.paInt16,
                channels=1,
                rate=sample_rate,
                input=True,
                frames_per_buffer=1024,
            )
            frames = []
            for _ in range(int(sample_rate / 1024 * duration_seconds)):
                frames.append(stream.read(1024, exception_on_overflow=False))
            stream.stop_stream()
            stream.close()
            pa.terminate()
            return frames

        frames = await asyncio.to_thread(_record)

        # Save to temp WAV file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name

        def _write_wav():
            with wave.open(tmp_path, "wb") as wf:
                import pyaudio
                wf.setnchannels(1)
                wf.setsampwidth(pyaudio.PyAudio().get_sample_size(pyaudio.paInt16))
                wf.setframerate(sample_rate)
                wf.writeframes(b"".join(frames))

        await asyncio.to_thread(_write_wav)

        try:
            text = await self.transcribe(tmp_path)
        finally:
            try:
                os.remove(tmp_path)
            except Exception:
                pass

        logger.info(f"[STT] Transcribed: {text[:80]}")
        return text

    async def transcribe_bytes(self, audio_bytes: bytes) -> str:
        """
        Transcribe raw audio bytes (16kHz mono PCM16 or WAV).
        Used by the WebSocket voice streaming endpoint.
        """
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        try:
            return await self.transcribe(tmp_path)
        finally:
            try:
                os.remove(tmp_path)
            except Exception:
                pass
