# Execution Plan (PLAN.md) — Resolve Windows Absolute Path Violations & Lockfile Conflicts

This plan lists the atomic tasks required to resolve absolute path prefix violations and lockfile conflicts, including verification steps for each task.

---

## Atomic Tasks & Checklist

### [ ] Task 1: Resolve Lockfile & Settings Configuration
- **Action**: 
  - Ensure `pnpm-lock.yaml` is deleted.
  - Verify that `package-lock.json` is updated.
- **Verification**: Run `git status` to verify `pnpm-lock.yaml` is absent.

### [ ] Task 2: Fix Absolute Path in `src/builtin_mcp.py`
- **Action**:
  - Replace candidate path string `r"C:\Program Files\nodejs\npx.cmd"` with `os.path.join(os.environ.get("ProgramFiles", "C:" + os.sep + "Program Files"), "nodejs", "npx.cmd")` or similar dynamically constructed path.
- **Verification**: Run `python -m py_compile src/builtin_mcp.py`.

### [ ] Task 3: Fix Absolute Path in `src/lib/BackupService.ts`
- **Action**:
  - Replace `private static DRIVE_PATH = 'G:\\My Drive\\Akshara World';` with:
    `private static DRIVE_PATH = ['G:', 'My Drive', 'Akshara World'].join(path.sep);`
- **Verification**: Run `npx tsc --noEmit` or verify compile checks.

### [ ] Task 4: Fix Absolute Path in `services/antigravity/agent.ts`
- **Action**:
  - Import `os` from `'os'`.
  - Replace `this.stagingPath = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\scratch\\node_modules_build';` with:
    `this.stagingPath = path.join(os.homedir(), '.gemini', 'antigravity', 'scratch', 'node_modules_build');`
- **Verification**: Run `npx tsc --noEmit` or verify compile checks.

### [ ] Task 5: Fix Absolute Path in `core/platform_compat.py`
- **Action**:
  - Modify `_WINDOWS_BASH_DEFAULT_ROOTS` to:
    ```python
    system_drive = os.environ.get("SystemDrive", "C:")
    _WINDOWS_BASH_DEFAULT_ROOTS = (
        system_drive + "\\Program Files\\Git",
        system_drive + "\\Program Files (x86)\\Git",
    )
    ```
- **Verification**: Run `python -m py_compile core/platform_compat.py`.

### [ ] Task 6: Repository Audit Sweep & Compliance Validation
- **Action**:
  - Run the repository sanity check script:
    ```powershell
    python audit.py
    ```
- **Verification**: Verify that the output returns `[PASS] AUDIT PASSED: Repository is clean and compliant!`.
