# Gmail Email Summary Bot — Setup Guide

> **Zero-cost email digest bot** — reads 3 Gmail accounts, summarizes with local Ollama, sends to Telegram `@Akshu23bot`

---

## 📁 Folder Structure

```
email-bot/
├── main.py                  ← Entry point (run this)
├── credentials_setup.py     ← One-time OAuth2 setup per account
├── gmail_reader.py          ← Gmail API integration
├── summarizer.py            ← Ollama summarization
├── telegram_notify.py       ← Telegram delivery
├── config.py                ← All settings (reads from ../.env.local)
├── requirements.txt         ← Python dependencies
├── credentials.json         ← ⬇ YOU MUST DOWNLOAD THIS (see Step 1)
└── tokens/
    ├── token_account1.json  ← Auto-created after credentials_setup.py
    ├── token_account2.json
    └── token_account3.json
```

---

## 🔧 Step 1 — Google Cloud Setup (One-Time, 5 Minutes)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **Select a project** → **New Project** → Name: `akshara-email-bot` → **Create**
3. In the search bar, search **"Gmail API"** → Click **Enable**
4. Go to **APIs & Services** → **Credentials** → **+ Create Credentials** → **OAuth client ID**
5. If prompted, configure **OAuth consent screen**:
   - User Type: **External** → Fill App name: `Email Bot`
   - Add your 3 Gmail emails as **Test users**
6. Back at Create OAuth Client ID:
   - Application type: **Desktop app**
   - Name: `email-bot`
   - Click **Create**
7. Download the JSON file → **Rename it to `credentials.json`**
8. Place `credentials.json` in this `email-bot/` folder

---

## 🐍 Step 2 — Install Dependencies

```powershell
cd "g:\My Drive\Antigravity\email-bot"
pip install -r requirements.txt
```

---

## 🔐 Step 3 — Authorize Gmail Accounts (One-Time)

Run the setup script to authorize all 3 accounts:

```powershell
python credentials_setup.py
```

- A browser window will open for each account
- Log into each Gmail account when prompted
- Tokens are saved to `tokens/` and auto-refresh forever

**Single account only:**
```powershell
python credentials_setup.py --account 1   # sampathh7415@gmail.com
python credentials_setup.py --account 2   # sampathh002@gmail.com
python credentials_setup.py --account 3   # sampathh001@gmail.com
```

---

## 🚀 Step 4 — Run the Bot

```powershell
# Full run — all 3 accounts → Telegram
python main.py

# Dry run — print to console only (no Telegram)
python main.py --dry-run

# Check last 48 hours instead of 24
python main.py --hours 48

# Check only accounts 1 and 3
python main.py --accounts 1 3
```

---

## ⏰ Step 5 — Schedule Daily Runs (Optional)

### Windows Task Scheduler

```powershell
# Run every day at 8:00 AM
$action  = New-ScheduledTaskAction -Execute "python" -Argument '"g:\My Drive\Antigravity\email-bot\main.py"'
$trigger = New-ScheduledTaskTrigger -Daily -At 8:00AM
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "GmailEmailBot" -RunLevel Highest
```

---

## 🤖 Model Used

| Task | Model | Reason |
|------|-------|--------|
| Email Summarization | `llama3:latest` | Fast, lightweight, free |
| Fallback (offline) | Rule-based | Works without Ollama |

Change model in `.env.local`:
```env
OLLAMA_MODEL_FAST=llama3:latest
```

---

## 💬 Sample Telegram Output

```
🤖 Gmail Digest — 2026-06-13 22:00:00
📅 Last 24h | 3 accounts
────────────────────────────

📬 Primary (sampathh7415)
3 unread emails — 1 urgent, 2 informational
📧 Google — Security Alert — New sign-in detected ⚠️
📧 Razorpay — Payment received ₹499 — Order confirmed
📧 GitHub — PR review requested — Akshara-World/main

─────────────

📭 Account 2 (sampathh002) — No unread emails in the last 24h.

─────────────

📬 Account 3 (sampathh001)
1 unread email
📧 YouTube — New subscriber milestone — 100 subscribers reached 🎉
```

---

## 🛡️ Privacy & Security

- Tokens are stored **locally only** (`tokens/` folder) — never sent anywhere
- Read-only Gmail scope (`gmail.readonly`) — bot cannot send or delete emails
- `.gitignore` already excludes `tokens/` and `credentials.json`

---

## ❓ Troubleshooting

| Issue | Fix |
|-------|-----|
| `credentials.json not found` | Download from Google Cloud Console (Step 1) |
| `Token refresh failed` | Re-run `python credentials_setup.py --account N` |
| `Ollama not reachable` | Start Ollama: `ollama serve` — or bot uses fallback |
| `Telegram error 400` | Check `TELEGRAM_TOKEN` and `TELEGRAM_CHAT_ID` in `.env.local` |
| `No emails found` | Check `--hours` value; verify account is authorized |
