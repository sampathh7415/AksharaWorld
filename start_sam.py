#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
start_sam.py -- One-command Sam launcher.

Usage:
    python start_sam.py           # start daemon
    python start_sam.py --test    # run test suite
    python start_sam.py --check   # check dependencies
    python start_sam.py --voice   # enable voice (requires voice binaries)
"""
import os, sys
# Fix Windows cp1252 encoding issues
os.environ.setdefault('PYTHONIOENCODING', 'utf-8')
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8', 'utf8'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

import argparse
import subprocess


def load_env():
    """Load sam.env file into environment."""
    env_file = "sam.env"
    if not os.path.exists(env_file):
        env_file = "sam.env.example"
        print(f"[WARN] sam.env not found - using {env_file}")
        print("   Copy sam.env.example -> sam.env and fill in your values.\n")

    if os.path.exists(env_file):
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, val = line.partition("=")
                    val_clean = val.partition("#")[0].strip()
                    os.environ.setdefault(key.strip(), val_clean)


def check_deps():
    """Check that required dependencies are installed."""
    print("[CHECK] Checking dependencies...\n")

    required = [
        ("fastapi",        "fastapi"),
        ("uvicorn",        "uvicorn"),
        ("aiosqlite",      "aiosqlite"),
        ("langchain",      "langchain"),
        ("langgraph",      "langgraph"),
        ("langchain_ollama", "langchain-ollama"),
        ("numpy",          "numpy"),
        ("psutil",         "psutil"),
        ("aiofiles",       "aiofiles"),
        ("croniter",       "croniter"),
    ]
    optional = [
        ("fastembed",       "fastembed",        "Vector similarity search"),
        ("telegram",        "python-telegram-bot", "Telegram bot"),
        ("playwright",      "playwright",        "Web browsing tool"),
        ("pvporcupine",     "pvporcupine",       "Wake word detection"),
        ("pyaudio",         "pyaudio",           "Microphone capture"),
        ("sounddevice",     "sounddevice",       "Audio playback"),
    ]

    all_ok = True
    for module, pkg, *_ in required:
        try:
            __import__(module)
            print(f"  [OK] {pkg}")
        except ImportError:
            print(f"  [MISSING] {pkg}  ->  pip install {pkg}")
            all_ok = False

    print("\n[OPTIONAL] Optional dependencies:")
    for module, pkg, desc in optional:
        try:
            __import__(module)
            print(f"  [OK] {pkg}  ({desc})")
        except ImportError:
            print(f"  [SKIP] {pkg}  ({desc}) - not installed")

    # Check Ollama
    print("\n[AI] Checking Ollama...")
    ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    try:
        import urllib.request, json
        with urllib.request.urlopen(f"{ollama_url}/api/tags", timeout=3) as r:
            data = json.loads(r.read())
            models = [m["name"] for m in data.get("models", [])]
            print(f"  [OK] Ollama running @ {ollama_url}")
            if models:
                print(f"     Available models: {', '.join(models[:5])}")
            else:
                print(f"  [WARN] No models found. Run: ollama pull qwen3.6")
    except Exception as exc:
        print(f"  [FAIL] Ollama not reachable @ {ollama_url}: {exc}")
        print("     Start with: ollama serve  (or Docker)")
        all_ok = False

    print()
    return all_ok


def run_tests():
    """Run the Sam test suite."""
    print("🧪 Running Sam test suite…\n")
    result = subprocess.run(
        [sys.executable, "-m", "pytest", "tests/sam/", "-v", "--tb=short"],
        cwd=os.getcwd(),
    )
    return result.returncode


def start_daemon():
    """Start the Sam daemon."""
    print("[LAUNCH] Starting Sam Agent...")
    print(f"   Model: {os.getenv('SAM_MODEL', 'qwen3.6')}")
    print(f"   Port:  {os.getenv('SAM_PORT', '8765')}")
    print(f"   Dashboard: http://localhost:{os.getenv('SAM_PORT', '8765')}/\n")

    # Windows pathing fixes for HuggingFace symlinks
    os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS", "1")
    os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

    subprocess.run([sys.executable, "-m", "sam.main"])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sam Agent Launcher")
    parser.add_argument("--test",  action="store_true", help="Run test suite")
    parser.add_argument("--check", action="store_true", help="Check dependencies")
    parser.add_argument("--voice", action="store_true", help="Enable voice")
    args = parser.parse_args()

    load_env()

    if args.voice:
        os.environ["SAM_VOICE_ENABLED"] = "true"

    if args.test:
        sys.exit(run_tests())
    elif args.check:
        ok = check_deps()
        sys.exit(0 if ok else 1)
    else:
        check_deps()
        start_daemon()
