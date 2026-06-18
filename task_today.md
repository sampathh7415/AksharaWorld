# Daily Focus Window (task_today.md)

> **IMPORTANT**: AI agent Sam must refuse to execute code modifications, script executions, or terminal commands unless they directly match/reference the active task specified below.

## Active Task Window
* **Task ID**: META-CREDENTIALS-SETUP
* **Target Files**:
  - `task_today.md`
  - `.env.local`
  - `docs/META_SETUP_GUIDE.md`
  - `services/social-media/video_generator.py`
* **Focus Goal**: Get Meta API credentials (Page Access Token, Page ID, Instagram Business Account ID) and save to .env.local, and fix FFmpeg absolute path violation.
* **Start Time**: 2026-06-14T19:25:00+05:30

---

## Technical Directives For Sam
1. **Scope Locking**: Do not look at or edit any code files outside of the "Target Files" list unless they are read-only dependencies needed for compilation.
2. **Defensive Pathing**: Ensure any dynamic load, require, or import uses relative paths (`./` or `../`) and does not hardcode drive prefixes (`C:\` or `G:\`).
3. **Vanilla Styles**: Use existing theme rules or create scoped vanilla CSS files. Do not import third-party CSS frameworks.

---

## Checklist for Current Task
- [x] Task Setup: Read necessary context and retrieve short-lived tokens from browser.
- [x] Task Execution: Fetch Instagram Account ID and generate long-lived token, update `.env.local`.
- [x] Task Verification: Verify credentials using test scripts.
- [x] Task Audit: Execute `audit.md` checks.

