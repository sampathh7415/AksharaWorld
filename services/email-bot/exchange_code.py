"""
exchange_code.py — One-shot script to exchange an auth code for a token.
Run immediately after getting an auth code from the browser.

Usage:
  python exchange_code.py <account_number> <auth_code>

Example:
  python exchange_code.py 3 4/1AdkVLPxDLTutmis...
"""

import sys
from pathlib import Path
from google_auth_oauthlib.flow import InstalledAppFlow
from config import CREDENTIALS_FILE, SCOPES, GMAIL_ACCOUNTS

def exchange(account_num: int, code: str):
    account    = GMAIL_ACCOUNTS[account_num - 1]
    token_path = account["token"]
    label      = account["label"]
    email      = account["email"]

    print(f"\nExchanging code for: {label} <{email}>")

    flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
    flow.redirect_uri = "urn:ietf:wg:oauth:2.0:oob"
    flow.fetch_token(code=code)
    creds = flow.credentials

    Path(token_path).parent.mkdir(parents=True, exist_ok=True)
    with open(token_path, "w") as f:
        f.write(creds.to_json())

    print(f"  Token saved to: {token_path}")
    print(f"  Account {account_num} ({email}) is now authorized!")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python exchange_code.py <account_number 1-3> <auth_code>")
        sys.exit(1)
    exchange(int(sys.argv[1]), sys.argv[2].strip())
