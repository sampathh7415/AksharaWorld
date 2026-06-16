import subprocess, os, requests

print("="*60)
print("AKSHARAWORLD COMPLETE BUSINESS AUDIT")
print("="*60)

print("\n--- REPO STATUS (last 10 commits) ---")
result = subprocess.run(["git", "log", "--oneline", "-10"], capture_output=True, text=True)
print(result.stdout)

print("--- GIT STATUS ---")
result = subprocess.run(["git", "status"], capture_output=True, text=True)
print(result.stdout)

print("--- KEY BUSINESS FILES ---")
result2 = subprocess.run(["git", "ls-files"], capture_output=True, text=True)
files = result2.stdout.strip().split("\n")
print("Total tracked files:", len(files))
keywords = ["pipeline","roadmap","ROADMAP","sam","social","poster","runner","ollama_router","email-bot","webhook","meta_setup","startup","product","instagram","content"]
key_files = [f for f in files if any(x in f.lower() for x in keywords)]
print("Key business files:")
for f in key_files:
    print("  ", f)

print("\n--- SERVICES STATUS ---")
try:
    r = requests.get("http://localhost:11434/api/tags", timeout=3)
    models = r.json().get("models", [])
    print("Ollama: RUNNING -", len(models), "models:")
    for m in models:
        name = m.get("name", "unknown")
        size = m.get("size", 0) // 1024 // 1024 // 1024
        print("  ", name, str(size) + "GB")
except Exception as e:
    print("Ollama: OFFLINE -", e)

try:
    r = requests.get("http://localhost:8765/api/health", timeout=3)
    print("FastAPI Sam:", r.json())
except:
    print("FastAPI Sam: OFFLINE")

try:
    r = requests.get("http://127.0.0.1:8082/health", timeout=3)
    print("Free Claude Code: RUNNING on port 8082")
except:
    print("Free Claude Code: OFFLINE")

print("\n--- ENVIRONMENT VARIABLES ---")
env_path = ".env.local"
if os.path.exists(env_path):
    with open(env_path) as f:
        lines = f.readlines()
    configured = []
    missing = []
    for l in lines:
        if "=" in l and not l.startswith("#"):
            key = l.split("=")[0].strip()
            val = l.split("=", 1)[1].strip()
            if val in ["", "your_key_here", "MISSING", "placeholder"]:
                missing.append(key)
            else:
                configured.append(key)
    print("Configured keys (" + str(len(configured)) + "):")
    for k in configured:
        print("  ", k)
    print("Missing keys (" + str(len(missing)) + "):")
    for k in missing:
        print("  ", k)

print("\n--- SCHEDULED TASKS ---")
result = subprocess.run(["schtasks", "/query", "/fo", "LIST"], capture_output=True, text=True, shell=True)
for line in result.stdout.split("\n"):
    if "Akshara" in line or "aksharaworld" in line.lower() or "Gmail" in line:
        print(line)

print("\n--- DOCKER CONTAINERS ---")
result = subprocess.run(["docker", "ps"], capture_output=True, text=True)
print(result.stdout if result.stdout else "No containers running or Docker offline")

print("\n--- ASSETS ---")
for folder in ["assets/videos", "assets/images", "assets/audio", "assets/content"]:
    if os.path.exists(folder):
        files = os.listdir(folder)
        print(folder + ":", files)
    else:
        print(folder + ": NOT FOUND")

print("\n--- SITE STATUS ---")
for url in ["https://aksharaworld.in", "https://dashboard.aksharaworld.in"]:
    try:
        r = requests.get(url, timeout=8)
        print(url + ":", r.status_code)
    except Exception as e:
        print(url + ": ERROR -", str(e))

print("\nAUDIT COMPLETE")
