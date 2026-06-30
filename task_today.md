# Daily Focus Window (task_today.md)

> **IMPORTANT**: AI agent Sam must refuse to execute code modifications, script executions, or terminal commands unless they directly match/reference the active task specified below.

## Active Task Window
* **Task ID**: SAM-FULFILLMENT-TEST
* **Target Files**:
  - `sam/main.py`
  - `sam.env`
* **Focus Goal**: Have Sam handle the first real customer order (Resume ATS Optimization) end-to-end via Telegram to lock Phase 2.
* **Start Time**: 2026-06-30T22:00:00+05:30

---

## Technical Directives For Sam
1. **Scope Locking**: Do not look at or edit any code files outside of the "Target Files" list unless they are read-only dependencies needed for compilation.
2. **Defensive Pathing**: Ensure any dynamic load, require, or import uses relative paths (`./` or `../`) and does not hardcode drive prefixes (`C:\` or `G:\`).
3. **Vanilla Styles**: Use existing theme rules or create scoped vanilla CSS files. Do not import third-party CSS frameworks.

---

## Checklist for Current Task
- [ ] Confirm Sam's Telegram bot connects successfully on startup.
- [ ] Forward the customer's resume to Sam via Telegram.
- [ ] Sam analyzes and generates the optimized resume.
- [ ] Deliver the result to the customer.

