"""
gmail_reader.py — Fetches unread emails from a Gmail account via the Gmail API.

Flow:
  1. Load saved OAuth2 token (token_accountN.json)
  2. Auto-refresh if expired
  3. Query Gmail for messages in the last HOURS_LOOKBACK hours
  4. Parse subject, sender, date, and body snippet
"""

from __future__ import annotations

import base64
import datetime
import email as email_lib
import os
import re
from pathlib import Path
from typing import Any

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from config import CREDENTIALS_FILE, SCOPES, HOURS_LOOKBACK, MAX_EMAILS_SHOWN


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _decode_body(part: dict) -> str:
    """Decode a base64url-encoded email body part to plain text."""
    data = part.get("body", {}).get("data", "")
    if not data:
        return ""
    try:
        decoded = base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="replace")
        # Strip HTML tags if present
        decoded = re.sub(r"<[^>]+>", " ", decoded)
        decoded = re.sub(r"\s+", " ", decoded).strip()
        return decoded[:2000]  # Cap at 2000 chars per email body
    except Exception:
        return ""


def _extract_body(payload: dict) -> str:
    """Recursively extract readable text from email payload."""
    mime_type = payload.get("mimeType", "")
    parts     = payload.get("parts", [])

    if mime_type == "text/plain":
        return _decode_body(payload)

    if mime_type == "text/html" and not parts:
        return _decode_body(payload)

    for part in parts:
        text = _extract_body(part)
        if text:
            return text

    return _decode_body(payload)  # fallback


def _header(headers: list[dict], name: str) -> str:
    """Extract a single header value by name."""
    for h in headers:
        if h.get("name", "").lower() == name.lower():
            return h.get("value", "")
    return ""


# ─── Core ────────────────────────────────────────────────────────────────────

def load_credentials(token_path: str) -> Credentials | None:
    """Load and auto-refresh OAuth2 credentials from a saved token file."""
    if not os.path.exists(token_path):
        return None

    creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            # Persist refreshed token
            Path(token_path).parent.mkdir(parents=True, exist_ok=True)
            with open(token_path, "w") as f:
                f.write(creds.to_json())
        except Exception as exc:
            print(f"  ⚠  Token refresh failed for {token_path}: {exc}")
            return None

    return creds if creds and creds.valid else None


def fetch_emails(account: dict) -> list[dict[str, Any]]:
    """
    Fetch unread emails from the last HOURS_LOOKBACK hours for one Gmail account.

    Returns a list of dicts:
        { subject, sender, date, snippet, body }
    """
    label   = account["label"]
    email   = account["email"]
    token   = account["token"]

    print(f"\n📬 Fetching emails for {label} <{email}>")

    creds = load_credentials(token)
    if not creds:
        print(f"  ❌ No valid token found at {token}")
        print(f"     → Run:  python credentials_setup.py")
        return []

    try:
        service = build("gmail", "v1", credentials=creds, cache_discovery=False)

        # Build a time-filtered query
        since_dt = datetime.datetime.utcnow() - datetime.timedelta(hours=HOURS_LOOKBACK)
        since_ts = int(since_dt.timestamp())
        query    = f"is:unread after:{since_ts}"

        # List matching messages
        response = (
            service.users()
            .messages()
            .list(userId="me", q=query, maxResults=MAX_EMAILS_SHOWN)
            .execute()
        )

        messages = response.get("messages", [])
        print(f"  ✅ Found {len(messages)} unread email(s) in the last {HOURS_LOOKBACK}h")

        if not messages:
            return []

        results = []
        for msg_ref in messages:
            msg = (
                service.users()
                .messages()
                .get(userId="me", id=msg_ref["id"], format="full")
                .execute()
            )

            headers = msg.get("payload", {}).get("headers", [])
            body    = _extract_body(msg.get("payload", {}))
            snippet = msg.get("snippet", "")

            results.append(
                {
                    "subject": _header(headers, "Subject") or "(No Subject)",
                    "sender":  _header(headers, "From")    or "Unknown",
                    "date":    _header(headers, "Date")    or "Unknown",
                    "snippet": snippet[:300],
                    "body":    body or snippet,
                }
            )

        return results

    except HttpError as err:
        print(f"  ❌ Gmail API error: {err}")
        return []
    except Exception as exc:
        print(f"  ❌ Unexpected error: {exc}")
        return []
