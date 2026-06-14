"""
summarizer.py — Summarizes fetched emails using Gemini API (primary)
                with Ollama as fallback, and rule-based as last resort.

Primary:  Google Gemini 2.0 Flash — free tier (1500 req/day), instant response
Fallback: Ollama local model (if Gemini key missing)
Last:     Rule-based list (always works offline)
"""

from __future__ import annotations

import os
import requests
from typing import Any
from pathlib import Path
from dotenv import load_dotenv

# Load env
_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_ROOT / ".env.local")
load_dotenv(_ROOT / ".env", override=False)

from config import OLLAMA_BASE_URL, OLLAMA_MODEL, HOURS_LOOKBACK

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL   = "gemini-2.0-flash"


# ─── Prompt Builder ──────────────────────────────────────────────────────────

def _build_prompt(account_label: str, emails: list[dict[str, Any]]) -> str:
    email_blocks = []
    for i, em in enumerate(emails, 1):
        block = (
            f"Email #{i}\n"
            f"  From: {em['sender']}\n"
            f"  Subject: {em['subject']}\n"
            f"  Date: {em['date']}\n"
            f"  Preview: {em['snippet']}\n"
        )
        email_blocks.append(block)

    email_text = "\n".join(email_blocks)

    return f"""You are a personal email assistant.
Summarize the following {len(emails)} unread email(s) from Gmail account "{account_label}" received in the last {HOURS_LOOKBACK} hours.

{email_text}

Write a concise Telegram-ready digest:
- Start with a 1-line overview (e.g. "3 emails — 1 urgent, 2 informational")
- List each as: [From] — [Subject] — [1-sentence summary]
- Flag urgent/action-needed emails with WARNING
- Keep total under 800 characters.
Reply ONLY with the digest text."""


# ─── Gemini API ──────────────────────────────────────────────────────────────

def _call_gemini(prompt: str) -> str | None:
    """Call Gemini 2.0 Flash via REST API — free tier, instant response."""
    if not GEMINI_API_KEY:
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 400,
        },
    }
    try:
        resp = requests.post(url, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as exc:
        print(f"  ⚠  Gemini error: {exc} — trying Ollama fallback")
        return None


# ─── Ollama Fallback ─────────────────────────────────────────────────────────

def _call_ollama(prompt: str) -> str | None:
    """Call local Ollama model as secondary fallback."""
    url = f"{OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model":  OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.3, "num_predict": 300},
    }
    try:
        resp = requests.post(url, json=payload, timeout=180)
        resp.raise_for_status()
        return resp.json().get("response", "").strip()
    except requests.exceptions.ConnectionError:
        print(f"  ⚠  Ollama not reachable — using rule-based fallback")
        return None
    except Exception as exc:
        print(f"  ⚠  Ollama error: {exc} — using rule-based fallback")
        return None


# ─── Rule-Based Fallback ─────────────────────────────────────────────────────

def _fallback_summary(account_label: str, emails: list[dict[str, Any]]) -> str:
    lines = [f"*{account_label}* — {len(emails)} unread email(s)\n"]
    for em in emails:
        sender  = em["sender"].split("<")[0].strip()[:30]
        subject = em["subject"][:60]
        lines.append(f"- {sender} — {subject}")
    return "\n".join(lines)


# ─── Public API ──────────────────────────────────────────────────────────────

def summarize_account(account_label: str, emails: list[dict[str, Any]]) -> str:
    if not emails:
        return f"*{account_label}* — No unread emails in the last {HOURS_LOOKBACK}h."

    prompt = _build_prompt(account_label, emails)

    # Try Gemini first (fastest, free)
    if GEMINI_API_KEY:
        print(f"  🤖 Summarizing via Gemini 2.0 Flash...")
        summary = _call_gemini(prompt)
        if summary:
            return f"*{account_label}*\n{summary}"

    # Try Ollama second
    print(f"  🤖 Trying Ollama ({OLLAMA_MODEL})...")
    summary = _call_ollama(prompt)
    if summary:
        return f"*{account_label}*\n{summary}"

    # Rule-based last resort
    print(f"  📋 Using rule-based summary")
    return f"*{account_label}*\n{_fallback_summary(account_label, emails)}"
