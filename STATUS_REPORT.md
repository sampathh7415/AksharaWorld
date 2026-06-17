# AksharaWorld — Live Status Report

*Last updated: June 17, 2026. This file is the single source of truth for "where are we, what's done, what's stuck." If chat history is ever lost, read this file first, then ROADMAP.md.*

---

## How to use this file

This is updated every time something locks, breaks, or changes significantly. It complements ROADMAP.md (which defines the plan) by recording the actual current state against that plan.

---

## Phase Status Summary

| Phase | Status |
|---|---|
| 0 — Foundation | 🔒 LOCKED |
| 1 — Revenue Engine | 🟡 IN PROGRESS — not locked |
| 2 — Sam's Brain | 🟡 IN PROGRESS — partially built |
| 3 — Real Dashboard | ⬜ Not started |
| 4 — Traffic Engine | ⬜ Not started |
| 5 — Full Autonomy | ⬜ Not started |

---

## Phase 0 — Foundation: LOCKED ✅

Confirmed and unchanged. aksharaworld.in live on Cloudflare Pages, all 5 Razorpay payment links correct, GA4 verified, Telegram/Sheets/Ollama/FastAPI all verified live.

---

## Phase 1 — Revenue Engine: NOT LOCKED

**Lock condition:** at least one real paid order from a real customer, legal pages live, fully logged in Sheets, delivered.

### Done
- Legal pages (Privacy, Terms, Refund) live and linked in footer
- Webhook pipeline verified working — payment.captured and payment.authorized both return 200 OK (confirmed via Razorpay dashboard logs, June 13)
- Telegram bot migrated after security incident: old bot `@Akshara23bot` was hacked and deleted, new bot `@Akshu23bot` is live and working (token: see `.env.local` → `TELEGRAM_BOT_TOKEN`, chat ID `7125107324`)
- Old/duplicate Razorpay webhooks identified for cleanup: `SkZayAQpjOHQuX` (ngrok, dead), `SuUjs7tWpRWZy9` (404 phantom route), `SpbEQJsHfb0wh3` (old singular route, already disabled) — owner needs to manually delete these 3 in Razorpay dashboard, only `SuRxWUGQ6niobO` should remain
- CreatorFlow Instagram automation configured and shows status "Live" — DM Response automation watches for keyword BLUEPRINT, free tier (500 DMs/month)
- Day 0 Ganesh launch Reel video created: `assets/videos/ganesh_day0_reel_v2.mp4` (7.12MB, 1080x1920, correct yuv420p/bt709 color space for Instagram — first version was broken/washed out, v2 is fixed and ready)
- Full Week 1 Instagram content calendar written: `docs/INSTAGRAM_CONTENT_WEEK1.md` (Day 0 Ganesh post + 7 days of BLUEPRINT campaign content)
- Product pipeline documented: `docs/PRODUCT_PIPELINE.md`

### STUCK / Blocking
- **Meta API credentials broken.** Original Meta Developer App (ID `2240471386782281`, named "AksharaWorld") was deleted/disabled — all tokens generated under it are invalid ("Application has been deleted" error). A second app **"AksharaWorld2"** was reportedly created by Antigravity in a later session but credentials were never retrieved/confirmed — this needs to be checked first.
- Root cause of repeated Meta failures: the Facebook Page found (`Aksharaworld`, page ID `61586978896930`, 0 followers, "Home decor" category) is **not owned by the same Facebook account** that's logged into the Meta Developer portal (Sampath Hombalimath, user ID `27136279929400380`). `me/accounts` API call returns empty `{"data":[]}` because of this mismatch.
- **Zero real paid orders.** The only successful payment so far is a ₹11 self-test (`pay_T19PwVSS3QOaP7`) — this does not count toward the lock condition.
- Day 0 Ganesh Reel has NOT been posted yet — video is ready but blocked on Meta credentials (or needs manual posting via phone as a workaround)
- Soft-launch to WhatsApp/personal network has not yet happened

### Immediate next steps (in priority order)
1. Check whether "AksharaWorld2" Meta app actually exists and get its App ID/Secret
2. If AksharaWorld2 doesn't resolve cleanly, the fastest path is: **post Day 0 Ganesh Reel manually via phone today** (transfer video from Google Drive app → Instagram), don't wait for full API automation
3. Soft-launch the ₹999 Resume ATS service directly to WhatsApp contacts — this needs no Meta API at all and is the fastest realistic path to the first real paid order
4. Once first order lands: log fully in Sheets, deliver manually using Ollama (qwen3.6/gemma4), Phase 1 locks

---

## Phase 2 — Sam's Brain: PARTIALLY BUILT

**Lock condition:** heartbeat runs continuously from boot with zero manual start; Sam completes one full order start-to-finish triggered only by a Telegram message; first 10 Sam-handled orders require owner approval.

### Done — confirmed working live
- Sam's FastAPI daemon (`sam/main.py`) runs successfully on port 8765 when `PYTHONPATH` is set to repo root
- Full real web dashboard at `http://localhost:8765` — dark HUD-style UI with live chat (WebSocket), task queue panel, audit log panel, voice input button (Web Speech API), emergency kill switch, approval modal for high-risk actions
- Scheduler is alive and has been firing real scheduled tasks automatically: `get_system_info`, `daily_audit`, `prune_memories` — confirmed multiple successful runs across sessions
- SQLite memory database working (`./sam-data/sam.db`)
- Audit logging working
- `/api/health` returns healthy: Ollama connected, SQLite ok, queue processing
- Windows Scheduled Task `AksharaWorld-SamDaemon` registered to auto-start Sam at every Windows login (uses `-AtLogOn` trigger, sets PYTHONPATH correctly inside the task action)
- `PYTHONPATH` permanently set at Windows User environment level (fixes the recurring `ModuleNotFoundError: No module named 'sam'` issue for good)
- Ollama confirmed running natively on Windows (not just Docker) with all 4 models: `qwen2.5-coder:14b` (9GB), `llama3:latest` (4.6GB), `gemma4:latest` (9.6GB), `qwen3.6:latest` (23GB, used as Sam's primary LLM)
- Sam successfully responded to a live chat test question through its dashboard once Ollama was confirmed running

### STUCK / Gaps
- **Telegram disabled inside Sam itself** — startup log shows "No Telegram token — bot disabled." Sam's own `.env` needs the same `@Akshu23bot` token wired in (separate from the social-media poster's use of the same bot)
- No voice output (Piper TTS) yet
- No speech-to-text (Whisper) wired in yet — dashboard has Web Speech API as a browser-side fallback only
- No webcam face recognition
- No original Akshara mascot generated yet (only Sam's abstract icon exists)
- Sam has not yet completed one full real order — this is the actual lock condition and depends on Phase 1's first order existing
- Docker Desktop was found not running at one point (`docker ps` failed) — turned out not to matter since Ollama runs natively, but worth knowing this dependency is currently unused/optional

### Immediate next steps
1. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to Sam's own environment (likely `sam.env` or wherever `sam/main.py` reads from) so Sam's internal Telegram bot activates
2. Once Phase 1 produces a real order, have Sam handle the next one end-to-end as a test (with owner approval, per the lock condition)

---

## Workflow / Tooling Notes (important context, not phase-specific)

- **Antigravity IDE credits are a recurring problem.** Multiple sessions have hit "Insufficient AI Credits" mid-task. Current mitigation: Antigravity is now used as file editor + terminal only — actual AI work should route through:
  - **Free Claude Code proxy** — installed and running (`fcc-server` on port 8082), configured with Gemini 2.0 Flash as default model (unlimited free tier) and all 4 Ollama models as overrides (Opus→qwen3.6, Sonnet→qwen2.5-coder:14b, Haiku→llama3). Telegram messaging also configured in its Admin UI (`http://127.0.0.1:8082/admin`) using the same `@Akshu23bot` token and chat ID `7125107324`, allowed directory `G:\My Drive\Antigravity`.
  - **Direct Ollama API calls** via PowerShell/Python when simpler than going through the proxy
- **Browser automation reliability issue (unresolved):** Antigravity's browser subagent has repeatedly opened new Chrome sessions instead of reusing the logged-in one, causing repeated re-login friction and burning Razorpay/Meta browser-automation credits. A fix was drafted (CDP connection via `--remote-debugging-port=9222`, a dedicated `Chrome-AksharaWorld` desktop shortcut, an auto-permission script for trusted sites) but **was never confirmed actually applied/working** — worth revisiting if browser automation is needed again.
- **Security incident (resolved):** original Telegram bot `@Akshara23bot` was hacked and deleted by an attacker. Root cause: `.env.local` and `sam.env` had been committed to the public GitHub repo since the very first commit, exposing Razorpay keys, Telegram token, Clerk secret, and likely more. Remediation done: Razorpay keys rotated, Clerk secret rotated, Telegram migrated to new bot, both env files removed from git tracking and added to `.gitignore`. **Still outstanding:** `GEMINI_API_KEY` was also exposed in git history and has NOT been rotated yet (owner's explicit decision, deferred until business has revenue) — owner also plans to eventually make the GitHub repo private.
- **Large media files were accidentally committed to git** (mp4/wav in `assets/videos`, `assets/audio`) before being added to `.gitignore` — a cleanup commit was made to stop future tracking, but the already-committed files still bloat repo history. Low priority, not blocking anything.
- **Owner's hardware:** Windows 11 Lenovo laptop, Intel UHD 620 integrated GPU (not used by Ollama — CPU-only inference, `OLLAMA_NUM_GPU=0`), 15.8 GiB RAM. This is the only machine running Sam/Ollama — Phase 5's "laptop dependency tripwire" (moving time-sensitive checks to a free cloud VM) becomes relevant once revenue exists.

---

## The Single Most Important Next Action

Everything else is infrastructure in service of one fact: **AksharaWorld has not yet earned one real rupee from a real customer.** Every other metric — Sam's dashboard, the social media pipeline, the content calendar — is preparation for that one event. The fastest realistic path to it does not require Meta API, CreatorFlow, or any of the broken automation:

**Post the Ganesh Reel manually via phone today. Soft-launch the ₹999 Resume ATS service directly to WhatsApp contacts. Get one real order. Log it in Sheets. Deliver it using Ollama. Phase 1 locks.**

Everything automated can be rebuilt around a business that has already proven it can make one sale the manual way.
