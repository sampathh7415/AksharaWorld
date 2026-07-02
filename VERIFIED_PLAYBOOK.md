# AksharaWorld — Verified Playbook

*This file records ONLY confirmed-working steps. No errors, no dead ends, no trial-and-error — just the clean path that actually worked, so it can be repeated or referenced without re-deriving it.*

*Companion to STATUS_REPORT.md (current state) and ROADMAP.md (the plan). This file is "how we did the things that worked."*

---

## How this file is maintained going forward

Every time a task is completed and verified working, one short entry gets added here. Format:

```
### [Task name] — verified [date]
What: one line
How: the exact working command/steps
Result: what confirmed it worked
```

Failed attempts, debugging, and back-and-forth are NOT recorded here — only the final working method. This keeps the file short and genuinely useful as a blueprint, not a transcript.

---

## Verified Playbook Entries

### Cloudflare Pages deployment — verified June 13
What: Deploy Next.js site to Cloudflare Pages on Windows
How:
```powershell
cd <staging-dir-on-local-SSD-not-Google-Drive>
npx vercel build --yes --standalone
npx wrangler pages deploy .vercel/output/static --project-name=aksharaworld-main --branch=main
```
Key fact: must build on local SSD, not Google Drive — Drive latency causes build failures. Windows symlink restrictions also require a monkeypatch for `@cloudflare/next-on-pages`.
Result: aksharaworld.in returns 200 OK

---

### Razorpay webhook — correct working route — verified June 13
What: Which of multiple webhook routes is the real one
How: `/api/webhooks/razorpay` (plural) is correct — verifies HMAC, sends Telegram, logs to Sheets
Result: Confirmed 200 OK on payment.captured and payment.authorized events in Razorpay dashboard logs

---

### Telegram bot — getting a fresh token after hack — verified June 13
What: Recover when a Telegram bot is hacked/deleted
How: Open BotFather → `/revoke` on old bot if recoverable, or create a brand new bot with `/newbot` → copy new token → update `.env.local` → update Cloudflare secret:
```powershell
npx wrangler pages secret put TELEGRAM_BOT_TOKEN --project-name=aksharaworld-main
```
Get chat ID via: `curl.exe "https://api.telegram.org/bot<TOKEN>/getUpdates"` after sending `/start` to the bot.
Result: New bot `@Akshu23bot` confirmed sending/receiving messages

---

### Removing secrets from git tracking permanently — verified June 13
What: Stop `.env.local` / `sam.env` from being tracked without losing local copies
How:
```powershell
git rm --cached .env.local sam.env
# add both filenames to .gitignore
git add .gitignore
git commit -m "Remove env files from git tracking"
git push origin main
```
Result: Confirmed via `git ls-files | findstr env` returning nothing

---

### Razorpay key rotation via Antigravity browser automation — verified June 13
What: Rotate a live Razorpay API key without manual dashboard work
How: Antigravity browser automation on the already-authenticated Razorpay dashboard session → Settings → API Keys → Regenerate Live Key → capture new Key ID/Secret → update `.env.local` and Cloudflare secret → verify with:
```powershell
curl -u <NEW_KEY_ID>:<NEW_KEY_SECRET> https://api.razorpay.com/v1/payments?count=1
```
Result: 200 OK confirms new key works; old key auto-expires in 24h grace window

---

### Free Claude Code installation (replaces paid AI credits for routine tasks) — verified June 16
What: Install a free local proxy that routes AI requests to Gemini/Ollama instead of paid APIs
How:
```powershell
irm "https://github.com/Alishahryar1/free-claude-code/blob/main/scripts/install.ps1?raw=1" | iex
fcc-server
```
Then configure at `http://127.0.0.1:8082/admin`:
- Providers tab → add Gemini API key (already had one from `.env.local`)
- Model Config tab → Default Model: `gemini/models/gemini-2.0-flash`, Opus Override: `ollama/qwen3.6:latest`, Sonnet Override: `ollama/qwen2.5-coder:14b`, Haiku Override: `ollama/llama3:latest`
- Messaging tab → Platform: telegram, paste bot token + allowed user ID + allowed directory
Result: `curl.exe -H "Authorization: Bearer freecc" http://127.0.0.1:8082/v1/models` returns full model list including Gemini + all 4 Ollama models

---

### Fixing "ModuleNotFoundError: No module named 'sam'" — verified June 16
What: Sam's daemon fails to start when run from certain terminal contexts
How: The issue is `PYTHONPATH` not including the repo root. Permanent fix:
```powershell
[Environment]::SetEnvironmentVariable("PYTHONPATH", "G:\My Drive\Antigravity", "User")
```
This persists across all future terminal sessions (not just the current one).
Result: `python sam/main.py` runs clean from any new PowerShell window after this is set

---

### Sam auto-start on every Windows login — verified June 16
What: Make Sam's daemon start automatically without manual `python sam/main.py` every time
How:
```powershell
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-WindowStyle Minimized -Command `"`$env:PYTHONPATH='G:\My Drive\Antigravity'; cd 'G:\My Drive\Antigravity'; python sam/main.py`""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
Register-ScheduledTask -TaskName "AksharaWorld-SamDaemon" -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest -Force
```
Result: `Get-ScheduledTask -TaskName "AksharaWorld-SamDaemon"` shows State: Ready; Sam dashboard reachable at `http://localhost:8765` after next login

---

### Sam's real health/status endpoints (not /health) — verified June 16
What: Find Sam's actual API routes since `/health` returns 404
How: Sam's FastAPI auto-generates `/openapi.json` — fetch that to get the real route list. Correct routes are `/api/health` and `/api/status`, not `/health`.
```powershell
curl.exe http://localhost:8765/api/health
curl.exe http://localhost:8765/api/status
```
Result: `/api/health` returns `{"status":"healthy","ollama":{"ok":true},"sqlite":{"ok":true},...}` once Ollama is also running

---

### Starting Ollama natively on Windows (not via Docker) — verified June 16
What: Get Ollama running when Docker Desktop is not running
How: Ollama can run as a native Windows process independent of Docker:
```powershell
ollama serve
```
Keep this terminal window open (it's a blocking foreground process). Confirm with a separate terminal:
```powershell
curl.exe http://localhost:11434/api/tags
```
Result: Returns all 4 installed models (qwen2.5-coder:14b, llama3:latest, gemma4:latest, qwen3.6:latest) — confirmed Docker Desktop is NOT required for Ollama on this machine

---

### Getting Meta Page Access Token + Instagram Account ID — verified June 14
What: Retrieve Facebook Page ID and linked Instagram Business Account ID via API (not dashboard clicking)
How: Run as a Python script (not inline `-c` due to quoting issues — use a `.py` file):
```python
import requests
BASE = "https://graph.facebook.com/v19.0"
r = requests.get(f"{BASE}/me/accounts", params={"access_token": USER_TOKEN})
page_id = r.json()["data"][0]["id"]
page_token = r.json()["data"][0]["access_token"]
r2 = requests.get(f"{BASE}/{page_id}", params={"fields": "instagram_business_account", "access_token": page_token})
ig_id = r2.json()["instagram_business_account"]["id"]
```
Critical precondition: the Facebook Page must be owned by the SAME Facebook account that's logged into the Meta Developer portal generating the token — otherwise `me/accounts` returns empty `{"data":[]}` with no error explanation.
Result: Successfully retrieved Page ID and confirmed via API test call

---

### Writing multi-line Python scripts in PowerShell without syntax errors — verified June 14
What: Avoid `SyntaxError: unterminated string literal` when writing Python heredocs in PowerShell
How: PowerShell's `<<` heredoc syntax does not work like bash. Use `Set-Content` with a PowerShell here-string instead:
```powershell
Set-Content -Path "script.py" -Encoding utf8 -Value @'
# python code here, use double quotes not single for any
# string that contains an apostrophe or needs escaping
'@
python script.py
```
Avoid f-strings with escaped quotes inside PowerShell here-strings — use string concatenation (`"text " + variable`) instead.
Result: Scripts run clean on first try

---

### Identifying which webhook is dead/duplicate via Razorpay API — verified June 13
What: Find phantom/duplicate Razorpay webhooks without manual dashboard cross-checking
How: List all webhooks via API, then check if the corresponding code route actually exists:
```powershell
# list webhooks via Razorpay API (returns IDs, URLs, active status)
# then for each URL, check if the file exists in the codebase
# AND do a live probe:
curl.exe -X POST https://aksharaworld.in/<webhook-path>
```
A route returning 404 on live probe + no matching file in `src/app/api/` = confirmed phantom, safe to delete from Razorpay dashboard.
Result: Identified and flagged 3 dead webhooks for manual deletion, kept the 1 real one

---

*(New entries get appended below this line as more steps are verified working)*
