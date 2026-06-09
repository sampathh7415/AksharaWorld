# Daily Focus Window (task_today.md)

> **IMPORTANT**: AI agent Sam must refuse to execute code modifications, script executions, or terminal commands unless they directly match/reference the active task specified below.

## Active Task Window
* **Task ID**: [e.g. TASK-001]
* **Target Files**:
  - `[File 1 Path]`
  - `[File 2 Path]`
* **Focus Goal**: [Description of the single 2-hour focus goal]
* **Start Time**: [Timestamp]

---

## Technical Directives For Sam
1. **Scope Locking**: Do not look at or edit any code files outside of the "Target Files" list unless they are read-only dependencies needed for compilation.
2. **Defensive Pathing**: Ensure any dynamic load, require, or import uses relative paths (`./` or `../`) and does not hardcode drive prefixes (`C:\` or `G:\`).
3. **Vanilla Styles**: Use existing theme rules or create scoped vanilla CSS files. Do not import third-party CSS frameworks.

---

## Checklist for Current Task
- [ ] Task Setup: Read necessary context without modifying anything.
- [ ] Task Execution: Perform changes on target files.
- [ ] Task Verification: Run local tests/sanity checks.
- [ ] Task Audit: Execute `audit.md` checks.
