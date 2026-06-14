"""
telegram_notify.py — Sends email digest messages to Telegram via @Akshu23bot.

Features:
  - Auto-splits messages > 4096 chars into multiple Telegram messages
  - Supports Markdown formatting
  - Uses existing TELEGRAM_TOKEN and TELEGRAM_CHAT_ID from .env.local
"""

from __future__ import annotations

import requests
from config import TELEGRAM_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_MAX_CHARS


# ─── Core ────────────────────────────────────────────────────────────────────

def _send_single(text: str, parse_mode: str = "Markdown") -> bool:
    """Send a single Telegram message (must be <= 4096 chars)."""
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        print("  ❌ Telegram credentials missing. Check .env.local for TELEGRAM_TOKEN and TELEGRAM_CHAT_ID")
        return False

    url  = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    data = {
        "chat_id":    TELEGRAM_CHAT_ID,
        "text":       text,
        "parse_mode": parse_mode,
    }

    try:
        resp = requests.post(url, data=data, timeout=15)
        if resp.status_code == 200:
            return True
        else:
            # Retry without markdown if parse error
            if resp.status_code == 400 and parse_mode == "Markdown":
                return _send_single(text, parse_mode="")
            print(f"  ❌ Telegram error {resp.status_code}: {resp.text[:200]}")
            return False
    except requests.exceptions.RequestException as exc:
        print(f"  ❌ Telegram request failed: {exc}")
        return False


def send_digest(full_message: str, dry_run: bool = False) -> None:
    """
    Send the full email digest to Telegram.
    Splits into chunks if > TELEGRAM_MAX_CHARS.

    Args:
        full_message: The complete digest text
        dry_run:      If True, prints instead of sending
    """
    if dry_run:
        print("\n" + "═" * 60)
        print("📲 [DRY-RUN] Message that would be sent to Telegram:")
        print("═" * 60)
        print(full_message)
        print("═" * 60 + "\n")
        return

    # Split into chunks of TELEGRAM_MAX_CHARS
    chunks = []
    remaining = full_message
    while remaining:
        if len(remaining) <= TELEGRAM_MAX_CHARS:
            chunks.append(remaining)
            break
        # Find last newline within limit
        split_at = remaining.rfind("\n", 0, TELEGRAM_MAX_CHARS)
        if split_at == -1:
            split_at = TELEGRAM_MAX_CHARS
        chunks.append(remaining[:split_at])
        remaining = remaining[split_at:].lstrip("\n")

    total = len(chunks)
    for i, chunk in enumerate(chunks, 1):
        prefix = f"📧 *Email Digest ({i}/{total})*\n\n" if total > 1 else ""
        success = _send_single(prefix + chunk)
        if success:
            print(f"  ✅ Telegram message {i}/{total} sent")
        else:
            print(f"  ❌ Failed to send chunk {i}/{total}")
