#!/usr/bin/env python3
"""
add_github_secrets.py
Adds all required GitHub Actions secrets for AksharaWorld repo by reading them safely from .env.local
Usage: python add_github_secrets.py <GITHUB_TOKEN>
"""
import sys, json, base64, os
import urllib.request, urllib.error

REPO = "sampathh7415/AksharaWorld"
API_BASE = "https://api.github.com"

# The keys we want to read from .env.local and upload to GitHub
SECRET_KEYS = [
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
    "TELEGRAM_TOKEN",
    "TELEGRAM_CHAT_ID",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "GOOGLE_SHEETS_SPREADSHEET_ID",
    "NEXT_PUBLIC_WHATSAPP_NUMBER",
    "APPS_SCRIPT_WEBHOOK_URL",
    "NEXT_PUBLIC_GA_MEASUREMENT_ID",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
]

def load_env_local():
    """Reads keys from .env.local safely"""
    env = {}
    env_path = ".env.local"
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip()
                    # Strip wrapping quotes if present
                    if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
                        v = v[1:-1]
                    env[k] = v
    return env

def api_request(method, path, token, data=None):
    url = f"{API_BASE}{path}"
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json"
    }
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            content = r.read()
            return json.loads(content.decode()) if content else {}
    except urllib.error.HTTPError as e:
        return {"error": e.code, "msg": e.read().decode()}

def get_public_key(token):
    return api_request("GET", f"/repos/{REPO}/actions/secrets/public-key", token)

def encrypt_secret(public_key_b64, secret_value):
    """Encrypt using libsodium (PyNaCl)"""
    try:
        from nacl import encoding, public
        pk = public.PublicKey(public_key_b64.encode(), encoding.Base64Encoder())
        box = public.SealedBox(pk)
        encrypted = box.encrypt(secret_value.encode())
        return base64.b64encode(encrypted).decode()
    except ImportError:
        return None

def add_secret(token, key_id, key_b64, name, value):
    encrypted = encrypt_secret(key_b64, value)
    if not encrypted:
        print(f"  ⚠️  PyNaCl not installed — cannot encrypt {name} automatically")
        return False
    data = {"encrypted_value": encrypted, "key_id": key_id}
    result = api_request("PUT", f"/repos/{REPO}/actions/secrets/{name}", token, data)
    if "error" in result:
        print(f"  ❌ {name}: {result}")
        return False
    print(f"  ✅ {name}: Added")
    return True

if __name__ == "__main__":
    token = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("GITHUB_TOKEN", "")
    if not token:
        print("Usage: python add_github_secrets.py <GITHUB_TOKEN>")
        sys.exit(1)
    
    env = load_env_local()
    secrets_to_add = {}
    for key in SECRET_KEYS:
        val = env.get(key)
        if val:
            secrets_to_add[key] = val
        else:
            print(f"⚠️  Key {key} not found in .env.local — skipping")

    if not secrets_to_add:
        print("❌ No secrets found in .env.local to add!")
        sys.exit(1)

    print(f"\n🔐 Adding {len(secrets_to_add)} secrets to {REPO} from .env.local\n")
    
    pk_info = get_public_key(token)
    if "error" in pk_info:
        print(f"❌ Could not get public key: {pk_info}")
        sys.exit(1)
    
    key_id = pk_info["key_id"]
    key_b64 = pk_info["key"]
    print(f"✅ Got repo public key: {key_id}\n")
    
    ok = 0
    for name, value in secrets_to_add.items():
        if add_secret(token, key_id, key_b64, name, value):
            ok += 1
    
    print(f"\n{'='*50}")
    print(f"✅ {ok}/{len(secrets_to_add)} secrets added successfully")
