# Daily Focus Window (task_today.md)

> **IMPORTANT**: AI agent Sam must refuse to execute code modifications, script executions, or terminal commands unless they directly match/reference the active task specified below.

## Active Task Window
* **Task ID**: PHASE-0-PAYMENT-LINKS
* **Target Files**:
  - `src/app/public/products/ai-blueprint/page.tsx`
  - `src/app/public/products/launch-pilot/page.tsx`
  - `src/app/public/page.tsx`
* **Focus Goal**: Update Razorpay payment link description via API, fix redirects/CTAs in frontend pages, and commit to main.
* **Start Time**: 2026-06-09T22:50:00+05:30

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
