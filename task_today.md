# Daily Focus Window (task_today.md)

> **IMPORTANT**: AI agent Sam must refuse to execute code modifications, script executions, or terminal commands unless they directly match/reference the active task specified below.

## Active Task Window
* **Task ID**: PHASE-0-FINAL-CLEANUP
* **Target Files**:
  - `task_today.md`
  - `docs/SYSTEM_STATUS.md`
  - `docs/DASHBOARD_PROGRESS.md`
  - `src/lib/sam/pipeline.config.ts`
  - `docs/SOCIAL_MEDIA_STATUS.md`
  - `implementation_plan.md`
* **Focus Goal**: Complete Phase 0 remaining tasks: GA4 audit, status documentation updates, Sam verifiedTools config, and social media status checklist.
* **Start Time**: 2026-06-11T06:45:00+05:30

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
