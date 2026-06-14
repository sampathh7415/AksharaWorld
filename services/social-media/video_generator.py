"""
AksharaWorld — Video Generator
Uses FFmpeg to create 1080x1920 Instagram Reel videos from images.
Applies Ken Burns zoom effect. Adds audio track.
Author: Sam | 2026-06-14
"""

import os
import subprocess
import struct
import wave
import math
from pathlib import Path
from datetime import datetime
from typing import Optional


# ── Paths ────────────────────────────────────────────────────────────────────

REPO_ROOT   = Path(__file__).resolve().parents[2]
IMAGES_DIR  = REPO_ROOT / "assets" / "images"
AUDIO_DIR   = REPO_ROOT / "assets" / "audio"
VIDEOS_DIR  = REPO_ROOT / "assets" / "videos"

# FFmpeg binary (installed via winget)
_FFMPEG_CANDIDATES = [
    r"C:\Users\Lenovo\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe",
    "ffmpeg",  # if on PATH after shell restart
]


def _find_ffmpeg() -> str:
    for candidate in _FFMPEG_CANDIDATES:
        if Path(candidate).exists():
            return candidate
    # Try PATH
    import shutil
    found = shutil.which("ffmpeg")
    if found:
        return found
    raise FileNotFoundError(
        "FFmpeg not found. Install via: winget install Gyan.FFmpeg\n"
        "Then add to PATH or update _FFMPEG_CANDIDATES in video_generator.py"
    )


# ── Audio Generator ───────────────────────────────────────────────────────────

def generate_devotional_tone(output_path: Path, duration_secs: int = 26,
                              frequency: float = 432.0) -> Path:
    """
    Generate a soft 432Hz devotional tone (meditative/peaceful quality).
    Fade in 3s, hold, fade out 3s. Stereo WAV.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    sample_rate = 44100
    num_frames = sample_rate * duration_secs

    with wave.open(str(output_path), "w") as f:
        f.setnchannels(2)       # stereo
        f.setsampwidth(2)       # 16-bit
        f.setframerate(sample_rate)
        for i in range(num_frames):
            t = i / sample_rate
            # Envelope: fade in 3s, fade out 3s
            if t < 3:
                vol = (t / 3) * 0.08
            elif t > duration_secs - 3:
                vol = ((duration_secs - t) / 3) * 0.08
            else:
                vol = 0.08
            # 432Hz + harmonics for warmth
            val = vol * (
                math.sin(2 * math.pi * frequency * t)
                + 0.3 * math.sin(2 * math.pi * frequency * 2 * t)
                + 0.15 * math.sin(2 * math.pi * frequency * 3 * t)
            )
            packed = struct.pack("<h", int(val * 32767))
            f.writeframesraw(packed + packed)  # stereo (L + R identical)

    print(f"[VideoGen] 🎵 Audio generated: {output_path.name} ({duration_secs}s, {frequency}Hz)")
    return output_path


# ── Video Renderer ────────────────────────────────────────────────────────────

def generate_reel(
    image_path: str,
    output_name: str,
    audio_path: Optional[str] = None,
    duration_secs: int = 25,
    zoom_speed: float = 0.0015,
) -> str:
    """
    Generate a 1080x1920 Instagram Reel video from a static image.

    Args:
        image_path:   Path to source image (any size/aspect ratio)
        output_name:  Output filename (without extension)
        audio_path:   Path to audio file (WAV/MP3). If None, generates 432Hz tone.
        duration_secs: Video duration in seconds (default 25)
        zoom_speed:   Ken Burns zoom speed per frame (default 0.0015 = gentle)

    Returns:
        Absolute path to the output MP4 file.
    """
    ffmpeg = _find_ffmpeg()
    image_path = Path(image_path)
    VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
    output_path = VIDEOS_DIR / f"{output_name}.mp4"

    if not image_path.exists():
        raise FileNotFoundError(f"Source image not found: {image_path}")

    # Generate audio if not provided
    if not audio_path:
        auto_audio = AUDIO_DIR / f"auto_tone_{output_name}.wav"
        if not auto_audio.exists():
            generate_devotional_tone(auto_audio, duration_secs + 1)
        audio_path = str(auto_audio)
    audio_path = Path(audio_path)
    if not audio_path.exists():
        raise FileNotFoundError(f"Audio not found: {audio_path}")

    print(f"[VideoGen] 🎬 Rendering {output_name}.mp4 ({duration_secs}s)...")

    # ── FFmpeg command ────────────────────────────────────────────────────
    # Filter chain:
    #   scale → pad to 1080x1920 (black bars) → convert to yuv420p → Ken Burns zoom → fps lock
    # Color: yuv420p(tv, bt709) — Instagram-compatible (NOT yuvj420p)
    d = duration_secs * 25  # total frames (25fps)

    filter_complex = (
        f"[0:v]"
        f"scale=1080:1920:force_original_aspect_ratio=decrease,"
        f"pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black,"
        f"format=yuv420p,"
        f"zoompan=z='min(zoom+{zoom_speed},1.3)':d={d}:"
        f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920,"
        f"fps=25"
        f"[v]"
    )

    cmd = [
        ffmpeg, "-y",
        "-loop", "1", "-t", str(duration_secs),
        "-i", str(image_path),
        "-i", str(audio_path),
        "-filter_complex", filter_complex,
        "-map", "[v]",
        "-map", "1:a",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        "-color_range", "1",      # TV/limited range
        "-colorspace", "1",       # BT.709
        "-color_primaries", "1",  # BT.709
        "-color_trc", "1",        # BT.709
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-shortest",
        str(output_path),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"[VideoGen] ❌ FFmpeg error:\n{result.stderr[-1000:]}")
        raise RuntimeError(f"FFmpeg failed with code {result.returncode}")

    size_mb = output_path.stat().st_size / 1024 / 1024
    print(f"[VideoGen] ✅ Rendered: {output_path.name} ({size_mb:.1f} MB)")
    return str(output_path)


# ── Batch Generator ───────────────────────────────────────────────────────────

def generate_campaign_reel(day: int, topic: str,
                            image_path: Optional[str] = None) -> str:
    """
    Generate a campaign Reel for a specific day.
    Auto-selects or generates image if not provided.
    """
    if not image_path:
        # Use day-specific image if exists, else fall back to Ganesha
        day_image = IMAGES_DIR / f"day{day}_{topic.lower().replace(' ', '_')}.png"
        fallback = IMAGES_DIR / "ganesh_day0.png"
        image_path = str(day_image) if day_image.exists() else str(fallback)

    output_name = f"campaign_day{day}_{topic.lower().replace(' ', '_').replace('/', '_')}"
    audio = AUDIO_DIR / "ganesh_audio.wav"
    audio_path = str(audio) if audio.exists() else None

    return generate_reel(
        image_path=image_path,
        output_name=output_name,
        audio_path=audio_path,
        duration_secs=20,
    )


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python video_generator.py <image_path> <output_name> [duration_secs]")
        print("Example: python video_generator.py assets/images/ganesh_day0.png test_reel 25")
        sys.exit(1)

    out = generate_reel(
        image_path=sys.argv[1],
        output_name=sys.argv[2],
        duration_secs=int(sys.argv[3]) if len(sys.argv) > 3 else 25,
    )
    print(f"Output: {out}")
