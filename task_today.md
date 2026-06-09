# Daily Focus Window (task_today.md)

> **IMPORTANT**: AI agent Sam must refuse to execute code modifications, script executions, or terminal commands unless they directly match/reference the active task specified below.

## Active Task Window
* **Task ID**: PHASE-0-CLEANUP
* **Target Files**:
  - `package.json`
  - `NEW_PLAN.md`
  - `src/app/page.tsx`
* **Focus Goal**: Phase 0 package.json fix, NEW_PLAN.md creation, search Razorpay links, close PRs.
* **Start Time**: 2026-06-09T22:35:00+05:30

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
