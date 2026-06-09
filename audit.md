# Reality Check (audit.md)

This automated checkpoint verification system checks your repository files for compatibility and hygiene issues before staging/validation.

---

## 1. Audit Directives
The AI agent Sam MUST execute the automated audit script before concluding any coding task. The audit checks for:
1. **Windows Absolute Path Prefix Bugs**: Catching any static or dynamic references like `C:\` or `G:\` in files. (These cause runtime crashes in Node.js ESM loader on Windows: `ERR_UNSUPPORTED_ESM_URL_SCHEME`).
2. **Orphaned / Untracked Files**: Finding any active files created during development that are untracked by git and are not registered inside `implementation_plan.md` or `prd.md`.

---

## 2. Running the Audit Script

### Option A: Running with Python
Run the python audit script directly in your terminal:
```powershell
python audit.py
```

### Option B: Running via PowerShell
If python is not in path, you can run:
```powershell
python3 audit.py
```

---

## 3. Compliance Rules
- **Rule 1**: If the audit outputs `🛑 AUDIT FAILED`, do not request code validation or deployment approval from the user. You must fix the absolute path bugs.
- **Rule 2**: If untracked files are reported, ensure they are added to `.gitignore` if they are temporary/scratch files, or add them to `implementation_plan.md` if they are permanent codebase additions.
