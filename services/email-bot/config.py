"""
config.py — Central configuration for Gmail Email Summary Bot
Reads credentials from the project root .env.local
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load from parent project's .env.local
_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_ROOT / ".env.local")
load_dotenv(_ROOT / ".env", override=False)

# ─── Telegram ────────────────────────────────────────────────
TELEGRAM_TOKEN   = os.getenv("TELEGRAM_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

# ─── Ollama ──────────────────────────────────────────────────
OLLAMA_BASE_URL  = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL     = os.getenv("OLLAMA_MODEL_FAST", "llama3:latest")   # fast, lightweight

# ─── Gmail Accounts ──────────────────────────────────────────
GMAIL_ACCOUNTS = [
    {
        "label":   "Primary (sampathh7415)",
        "email":   "sampathh7415@gmail.com",
        "token":   str(Path(__file__).parent / "tokens" / "token_account1.json"),
    },
    {
        "label":   "Account 2 (sampathh002)",
        "email":   "sampathh002@gmail.com",
        "token":   str(Path(__file__).parent / "tokens" / "token_account2.json"),
    },
    {
        "label":   "Account 3 (sampathh001)",
        "email":   "sampathh001@gmail.com",
        "token":   str(Path(__file__).parent / "tokens" / "token_account3.json"),
    },
]

# ─── Bot Settings ────────────────────────────────────────────
CREDENTIALS_FILE  = str(Path(__file__).parent / "credentials.json")
SCOPES            = ["https://www.googleapis.com/auth/gmail.readonly"]
HOURS_LOOKBACK    = 24          # how many hours back to check for emails
MAX_EMAILS_SHOWN  = 10          # max emails summarised per account
TELEGRAM_MAX_CHARS = 4096       # Telegram message character limit
