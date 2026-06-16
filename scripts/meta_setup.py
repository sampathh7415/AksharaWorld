import requests
import json
import re
APP_ID = "2240471386782281"
APP_SECRET = "7b5570643a9e912a7e720bdcb37c399c"
USER_TOKEN = "EAAf1smUjekkBRkLeCj6373juGGeZBlN0lbdJ7ZAeOSYJBP3HjIAKyZAhTuwVqZCyRAiWNuerBpfi4MGE1VEAaGLR37jtl4GTayBRccZCFEZAf3XXwr54yBBJJAM8zg66yvMZCVNxzsvlVSsyrnPHdpXXUUHGZBtxKTcVeXh6eDRiWC9i3Lli5ZCl8f1hfsEcr8pPZC2GVqpIsE68xbJTCtLsbOdhwl0lkJnTPjr7QOApjjlqJ6ow5yNqHl1ZAbJQ0gpNjPo3ZCnogXDaI3h5ZCjYZD"
BASE = "https://graph.facebook.com/v19.0"
print("STEP 1: Check token permissions...")
r = requests.get(BASE + "/me/permissions", params={"access_token": USER_TOKEN})
perms = r.json()
print(json.dumps(perms, indent=2))
print("\nSTEP 2: Get Pages...")
r = requests.get(BASE + "/me/accounts", params={"access_token": USER_TOKEN})
data = r.json()
print(json.dumps(data, indent=2))
if not data.get("data"):
    print("\nERROR: No pages found.")
    print("The token is missing pages_show_list permission.")
    print("\nSOLUTION: Go to Graph API Explorer:")
    print("https://developers.facebook.com/tools/explorer/?app_id=2240471386782281")
    print("1. Click 'Generate Access Token'")
    print("2. Make sure to CHECK these permissions:")
    print("   - pages_show_list")
    print("   - pages_read_engagement") 
    print("   - instagram_basic")
    print("   - instagram_content_publish")
    print("3. Copy the NEW token and run this script again")
else:
    PAGE_ID = data["data"][0]["id"]
    PAGE_TOKEN = data["data"][0]["access_token"]
    PAGE_NAME = data["data"][0]["name"]
    print("Page: " + PAGE_NAME + " | ID: " + PAGE_ID)
    print("\nSTEP 3: Get Instagram Account...")
    r = requests.get(BASE + "/" + PAGE_ID, params={"fields": "instagram_business_account", "access_token": PAGE_TOKEN})
    ig = r.json()
    print(json.dumps(ig, indent=2))
    IG_ID = ig.get("instagram_business_account", {}).get("id", "")
    print("Instagram ID: " + IG_ID)
    print("\nSTEP 4: Long-Lived Token...")
    r = requests.get(BASE + "/oauth/access_token", params={
        "grant_type": "fb_exchange_token",
        "client_id": APP_ID,
        "client_secret": APP_SECRET,
        "fb_exchange_token": PAGE_TOKEN
    })
    ll = r.json()
    LONG_TOKEN = ll.get("access_token", PAGE_TOKEN)
    expires = str(ll.get("expires_in", "unknown"))
    print("Expires in: " + expires + " seconds")
    print("\nSTEP 5: Save to .env.local...")
    with open(".env.local", "r", encoding="utf-8") as f:
        env = f.read()
    for key, val in [
        ("META_APP_ID", APP_ID),
        ("META_APP_SECRET", APP_SECRET),
        ("FACEBOOK_PAGE_ID", PAGE_ID),
        ("INSTAGRAM_ACCOUNT_ID", IG_ID),
        ("META_LONG_LIVED_TOKEN", LONG_TOKEN),
    ]:
        if key + "=" in env:
            env = re.sub(key + r"=.*", key + "=" + val, env)
        else:
            env += "\n" + key + "=" + val
    with open(".env.local", "w", encoding="utf-8") as f:
        f.write(env)
    print("Saved: FACEBOOK_PAGE_ID=" + PAGE_ID)
    print("Saved: INSTAGRAM_ACCOUNT_ID=" + IG_ID)
    print("Saved: META_LONG_LIVED_TOKEN=SET")
