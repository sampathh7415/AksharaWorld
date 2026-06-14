"""
main.py — Gmail Multi-Account Email Summary Bot
Entry point: Fetch -> Summarize -> Notify via Telegram

Usage:
  python main.py                  # Check all accounts, send to Telegram
  python main.py --dry-run        # Print digest to console, don't send
  python main.py --accounts 1 3   # Only check accounts 1 and 3
  python main.py --hours 48       # Look back 48 hours instead of 24
"""

from __future__ import annotations

import argparse
import datetime
import io
import sys

# Force UTF-8 stdout on Windows to handle emoji / box-drawing characters
if hasattr(sys.stdout, "buffer") and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from config import GMAIL_ACCOUNTS, HOURS_LOOKBACK
from gmail_reader import fetch_emails
from summarizer import summarize_account
from telegram_notify import send_digest


# ─── Banner ──────────────────────────────────────────────────────────────────

BANNER = """
========================================================
  Gmail Email Summary Bot -> Telegram @Akshu23bot
  AksharaWorld / Sam JARVIS | Zero Cost
========================================================
"""


# ─── Main ────────────────────────────────────────────────────────────────────

def run(accounts_idx: list[int], dry_run: bool, hours: int) -> None:
    print(BANNER)
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"⏰ Run time : {now_str}")
    print(f"📅 Lookback : last {hours} hours")
    print(f"📤 Mode     : {'DRY-RUN (no Telegram)' if dry_run else 'LIVE (sending to Telegram)'}")
    print(f"📬 Accounts : {len(accounts_idx)} selected\n")

    selected = [GMAIL_ACCOUNTS[i] for i in accounts_idx]
    all_summaries: list[str] = []

    for account in selected:
        emails   = fetch_emails(account)
        summary  = summarize_account(account["label"], emails)
        all_summaries.append(summary)

    # ─── Compose full digest ──────────────────────────────────────────────
    header = (
        f"🤖 *Gmail Digest — {now_str}*\n"
        f"📅 Last {hours}h | {len(selected)} account(s)\n"
        f"{'─' * 40}"
    )
    full_message = header + "\n\n" + "\n\n─────────────\n\n".join(all_summaries)

    # ─── Send ─────────────────────────────────────────────────────────────
    print("\n📲 Sending digest to Telegram @Akshu23bot...")
    send_digest(full_message, dry_run=dry_run)

    print("\n✅ Done!")


def main():
    parser = argparse.ArgumentParser(
        description="Gmail Email Summary Bot — fetch, summarize, and notify via Telegram"
    )
    parser.add_argument(
        "--accounts",
        nargs="+",
        type=int,
        choices=[1, 2, 3],
        default=[1, 2, 3],
        metavar="N",
        help="Account numbers to check (1=sampathh7415, 2=sampathh002, 3=sampathh001). Default: all.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print digest to console instead of sending to Telegram.",
    )
    parser.add_argument(
        "--hours",
        type=int,
        default=HOURS_LOOKBACK,
        help=f"How many hours back to look for emails. Default: {HOURS_LOOKBACK}.",
    )
    args = parser.parse_args()

    # Convert 1-indexed CLI args to 0-indexed list
    accounts_idx = [n - 1 for n in args.accounts]

    try:
        run(accounts_idx, dry_run=args.dry_run, hours=args.hours)
    except KeyboardInterrupt:
        print("\n⛔ Interrupted by user.")
        sys.exit(0)


if __name__ == "__main__":
    main()
