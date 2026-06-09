# Daily Focus Window (task_today.md)

> **IMPORTANT**: AI agent Sam must refuse to execute code modifications, script executions, or terminal commands unless they directly match/reference the active task specified below.

## Active Task Window
* **Task ID**: PATH-RESOLVE-001
* **Target Files**:
  - `src/builtin_mcp.py`
  - `src/lib/BackupService.ts`
  - `services/antigravity/agent.ts`
  - `core/platform_compat.py`
  - `.vscode/settings.json`
* **Focus Goal**: Resolve all absolute path violations and package manager/lockfile conflicts permanently.
* **Start Time**: 2026-06-09T22:18:00+05:30

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
