"""
sam/voice/wake.py — Wake word detection using Porcupine.

Runs continuously in a background thread listening for "Hey Sam".
When triggered, records audio until silence and passes to STT.

Setup:
  1. Get a free access key: https://picovoice.ai/console/
  2. Set PICOVOICE_ACCESS_KEY in sam.env
  3. Optionally set SAM_WAKE_WORD to a built-in keyword or
     path to a custom .ppn file.

Built-in keywords: 'alexa', 'hey google', 'hey siri', 'jarvis',
                   'ok google', 'picovoice', 'porcupine', 'bumblebee'
(or train a custom "hey sam" at picovoice.ai/console)

Usage:
    from sam.voice.wake import WakeWordDetector
    detector = WakeWordDetector(on_wake_callback=my_async_fn)
    await detector.start()
    # my_async_fn() is called when wake word detected
    await detector.stop()
"""

from __future__ import annotations

import asyncio
import logging
import os
from typing import Callable, Optional

logger = logging.getLogger(__name__)

PICOVOICE_KEY = os.getenv("PICOVOICE_ACCESS_KEY", "")
WAKE_WORD = os.getenv("SAM_WAKE_WORD", "porcupine")  # closest built-in to "hey sam"
VOICE_ENABLED = os.getenv("SAM_VOICE_ENABLED", "false").lower() == "true"

# Post-wake recording: seconds of silence before stopping STT
SILENCE_THRESHOLD = 500   # RMS amplitude below this = silence
SILENCE_DURATION_S = 1.5  # seconds of silence to end recording
MAX_RECORDING_S = 15       # hard cap on recording length


class WakeWordDetector:
    """
    Porcupine-based wake word detector.

    When "Hey Sam" (or configured keyword) is detected:
      1. Plays a brief beep to signal listening.
      2. Records microphone until silence or MAX_RECORDING_S.
      3. Calls `on_wake_callback(audio_bytes: bytes)`.

    Falls back gracefully if pvporcupine is not installed.
    """

    def __init__(self, on_wake_callback: Optional[Callable] = None):
        self._callback = on_wake_callback
        self._running = False
        self._thread_task: Optional[asyncio.Task] = None
        self._loop: Optional[asyncio.AbstractEventLoop] = None
        self._available = self._check_available()

    def _check_available(self) -> bool:
        if not VOICE_ENABLED:
            return False
        if not PICOVOICE_KEY:
            logger.warning(
                "[WakeWord] PICOVOICE_ACCESS_KEY not set. "
                "Get a free key at https://picovoice.ai/console/"
            )
            return False
        try:
            import pvporcupine  # type: ignore
            return True
        except ImportError:
            logger.warning(
                "[WakeWord] pvporcupine not installed. "
                "Run: pip install pvporcupine"
            )
            return False

    @property
    def is_available(self) -> bool:
        return self._available

    async def start(self) -> None:
        """Start the wake word detection loop in a background thread."""
        if not self._available:
            logger.info("[WakeWord] Wake word detection not available — skipping.")
            return

        self._running = True
        self._loop = asyncio.get_event_loop()
        self._thread_task = asyncio.create_task(
            asyncio.to_thread(self._detection_loop)
        )
        logger.info(f"[WakeWord] Listening for wake word: '{WAKE_WORD}'")

    async def stop(self) -> None:
        self._running = False
        if self._thread_task:
            self._thread_task.cancel()
            try:
                await self._thread_task
            except (asyncio.CancelledError, Exception):
                pass

    def _detection_loop(self) -> None:
        """Blocking detection loop — runs in a thread."""
        try:
            import pvporcupine  # type: ignore
            import pyaudio      # type: ignore
            import struct
        except ImportError as exc:
            logger.error(f"[WakeWord] Import error: {exc}")
            return

        porcupine = None
        pa = None
        stream = None

        try:
            # Initialize Porcupine
            porcupine = pvporcupine.create(
                access_key=PICOVOICE_KEY,
                keywords=[WAKE_WORD],
                sensitivities=[0.7],
            )

            pa = pyaudio.PyAudio()
            stream = pa.open(
                rate=porcupine.sample_rate,
                channels=1,
                format=pyaudio.paInt16,
                input=True,
                frames_per_buffer=porcupine.frame_length,
            )

            logger.info(
                f"[WakeWord] Detection active. "
                f"Sample rate: {porcupine.sample_rate}Hz, "
                f"Frame: {porcupine.frame_length} samples"
            )

            while self._running:
                pcm = stream.read(porcupine.frame_length, exception_on_overflow=False)
                pcm_unpacked = struct.unpack_from(
                    "h" * porcupine.frame_length, pcm
                )
                keyword_index = porcupine.process(pcm_unpacked)

                if keyword_index >= 0:
                    logger.info(f"[WakeWord] Wake word detected! Index: {keyword_index}")
                    # Record audio in same thread
                    audio_bytes = self._record_until_silence(stream, pa, porcupine.sample_rate)
                    # Schedule callback on event loop
                    if self._callback and self._loop:
                        asyncio.run_coroutine_threadsafe(
                            self._callback(audio_bytes), self._loop
                        )

        except Exception as exc:
            logger.error(f"[WakeWord] Detection error: {exc}", exc_info=True)
        finally:
            if stream:
                stream.stop_stream()
                stream.close()
            if pa:
                pa.terminate()
            if porcupine:
                porcupine.delete()
            logger.info("[WakeWord] Detection loop stopped.")

    def _record_until_silence(
        self,
        stream,
        pa,
        sample_rate: int,
    ) -> bytes:
        """
        Record audio from `stream` until silence is detected.
        Returns raw WAV bytes.
        """
        import struct
        import wave
        import io

        frames = []
        silence_frames = 0
        frame_size = 512
        silence_limit = int(sample_rate / frame_size * SILENCE_DURATION_S)
        max_frames = int(sample_rate / frame_size * MAX_RECORDING_S)

        # Play a short beep to signal "I'm listening"
        self._play_beep()

        logger.info("[WakeWord] Recording…")
        while len(frames) < max_frames:
            data = stream.read(frame_size, exception_on_overflow=False)
            frames.append(data)
            # Calculate RMS to detect silence
            amplitude = self._rms(data)
            if amplitude < SILENCE_THRESHOLD:
                silence_frames += 1
                if silence_frames >= silence_limit:
                    break
            else:
                silence_frames = 0

        logger.info(f"[WakeWord] Recorded {len(frames)} frames")

        # Encode as WAV
        buf = io.BytesIO()
        with wave.open(buf, "wb") as wf:
            import pyaudio
            wf.setnchannels(1)
            wf.setsampwidth(pa.get_sample_size(pyaudio.paInt16))
            wf.setframerate(sample_rate)
            wf.writeframes(b"".join(frames))
        return buf.getvalue()

    @staticmethod
    def _rms(data: bytes) -> float:
        """Calculate root-mean-square amplitude of PCM16 audio bytes."""
        import struct
        import math
        count = len(data) // 2
        if count == 0:
            return 0.0
        shorts = struct.unpack(f"{count}h", data)
        sum_sq = sum(s * s for s in shorts)
        return math.sqrt(sum_sq / count)

    @staticmethod
    def _play_beep() -> None:
        """Play a short 440Hz beep to indicate listening started."""
        try:
            import numpy as np
            import sounddevice as sd
            t = np.linspace(0, 0.2, int(22050 * 0.2), False)
            tone = (np.sin(440 * 2 * np.pi * t) * 0.3 * 32767).astype(np.int16)
            sd.play(tone, samplerate=22050, blocking=False)
        except Exception:
            pass  # beep is optional, don't fail if sounddevice unavailable
