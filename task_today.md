# Daily Focus Window (task_today.md)

> **IMPORTANT**: AI agent Sam must refuse to execute code modifications, script executions, or terminal commands unless they directly match/reference the active task specified below.

## Active Task Window
* **Task ID**: PHASE-0-CLOUDFLARE-BUILD-FIX
* **Target Files**:
  - `task_today.md`
  - `wrangler.json`
  - `implementation_plan.md`
  - `src/app/api/google/ai-jobs/route.ts`
  - `src/app/api/google/cron-loop/route.ts`
  - `src/app/api/v1/production-agent/webhook/route.ts`
* **Focus Goal**: Fix Cloudflare Pages deployment by rebuilding using next-on-pages and deploying .vercel/output/static.
* **Start Time**: 2026-06-11T07:35:00+05:30

---

## Technical Directives For Sam
1. **Scope Locking**: Do not look at or edit any code files outside of the "Target Files" list unless they are read-only dependencies needed for compilation.
2. **Defensive Pathing**: Ensure any dynamic load, require, or import uses relative paths (`./` or `../`) and does not hardcode drive prefixes (`C:\` or `G:\`).
3. **Vanilla Styles**: Use existing theme rules or create scoped vanilla CSS files. Do not import third-party CSS frameworks.

---

## Checklist for Current Task
- [x] Task Setup: Read necessary context without modifying anything.
- [x] Task Execution: Perform changes on target files.
- [x] Task Verification: Run local tests/sanity checks.
- [x] Task Audit: Execute `audit.md` checks.
