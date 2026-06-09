import os
import sys
import re
import subprocess

# Directories to ignore
IGNORE_DIRS = {
    '.git', 'node_modules', '.next', '.venv', 'venv', 'env', 
    'dist', 'build', '.docusaurus', 'out', '.kiro', '.netlify', 
    '.vercel', '.cursor', '.claude', '.gemini', 'sam-brain', 
    'sam-data', 'agentmemory', 'node_modules_old_ignored', 
    'node_modules_old_639149567000899127_ignored'
}

# File extensions to scan for path bugs
SCAN_EXTENSIONS = {'.js', '.ts', '.jsx', '.tsx', '.py'}

# Regex pattern for absolute Windows paths (e.g., C:\path or G:\path or C:/path)
ABS_PATH_PATTERN = re.compile(r'(?:"|\')([a-zA-Z]:[\\/][^"\']+)(?:"|\')')

def check_absolute_paths():
    """Scan code files for Windows absolute path prefixes in imports or configurations."""
    violations = []
    print("Scanning for absolute Windows path prefix violations...")
    
    for root, dirs, files in os.walk('.'):
        # Filter ignored directories in-place (include tests/ in IGNORE_DIRS dynamically)
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and d != 'tests']
        
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext not in SCAN_EXTENSIONS:
                continue
                
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    for line_num, line in enumerate(f, 1):
                        trimmed = line.strip()
                        # Skip comments
                        if trimmed.startswith('#') or trimmed.startswith('//') or trimmed.startswith('*') or trimmed.startswith('/*'):
                            continue
                            
                        # Find all matches
                        matches = ABS_PATH_PATTERN.findall(line)
                        if matches:
                            for match in matches:
                                # Skip HTTP URLs and mock symbols
                                if ':' in match and not match.startswith('http') and not match.startswith('https'):
                                    violations.append({
                                        'file': filepath,
                                        'line': line_num,
                                        'content': trimmed,
                                        'match': match
                                    })
            except Exception as e:
                print(f"Error reading {filepath}: {e}")
                
    return violations

def check_orphaned_files():
    """Identify untracked files not registered in the system index or git."""
    print("Checking for orphaned/untracked files...")
    orphaned = []
    try:
        # Run git status to find untracked files
        result = subprocess.run(
            ['git', 'status', '--porcelain'], 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE, 
            text=True, 
            check=True
        )
        for line in result.stdout.splitlines():
            if line.startswith('?? '):
                file_path = line[3:]
                # Ignore temp/scratch directories
                if not any(ignored in file_path for ignored in IGNORE_DIRS):
                    orphaned.append(file_path)
    except subprocess.CalledProcessError as e:
        print(f"Git status failed: {e.stderr}")
    except FileNotFoundError:
        print("git command not found. Skipping git-based orphaned check.")
        
    return orphaned

def main():
    print("==================================================")
    print("[SAFE] VIBE CODER: AUTOMATED SANITY CHECK AUDIT")
    print("==================================================")
    
    path_violations = check_absolute_paths()
    orphaned_files = check_orphaned_files()
    
    has_errors = False
    
    print("\n--------------------------------------------------")
    if path_violations:
        has_errors = True
        print(f"[ERROR] FOUND {len(path_violations)} WINDOWS ABSOLUTE PATH VIOLATIONS:")
        for v in path_violations:
            print(f"  [LOC] {v['file']}:{v['line']} -> Found match: '{v['match']}'")
            print(f"     Line: {v['content']}")
    else:
        print("[OK] No absolute Windows path violations found in code imports.")
        
    print("\n--------------------------------------------------")
    if orphaned_files:
        print(f"[WARNING] FOUND {len(orphaned_files)} UNTRACKED/ORPHANED FILES:")
        for file in orphaned_files:
            print(f"  [FILE] {file}")
        print("  Note: Please ensure these are either git-ignored or registered in implementation_plan.md / prd.md.")
    else:
        print("[OK] No untracked/orphaned files found in project scope.")
        
    print("==================================================")
    if has_errors:
        print("[FAIL] AUDIT FAILED: Please fix the absolute path bugs before code validation.")
        sys.exit(1)
    else:
        print("[PASS] AUDIT PASSED: Repository is clean and compliant!")
        sys.exit(0)

if __name__ == '__main__':
    main()
