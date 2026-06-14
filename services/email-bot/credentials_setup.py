"""
credentials_setup.py — One-time OAuth2 authorization for each Gmail account.

Run this script ONCE per account. It will:
  1. Open a browser window for Google OAuth consent
  2. Save a token_accountN.json file in the tokens/ folder
  3. Future runs will auto-refresh without browser interaction

Usage:
  python credentials_setup.py          # authorizes all 3 accounts sequentially
  python credentials_setup.py --account 1   # authorizes only account 1
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path

from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

from config import CREDENTIALS_FILE, SCOPES, GMAIL_ACCOUNTS


def authorize_account(account: dict) -> None:
    """Run the OAuth2 flow for a single Gmail account and save the token."""
    label      = account["label"]
    email      = account["email"]
    token_path = account["token"]

    print(f"\n🔐 Authorizing: {label} <{email}>")
    print(f"   Token will be saved to: {token_path}")

    # Check if token already exists and is valid
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
        if creds and creds.valid:
            print(f"   ✅ Already authorized — token is valid.")
            return
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                Path(token_path).parent.mkdir(parents=True, exist_ok=True)
                with open(token_path, "w") as f:
                    f.write(creds.to_json())
                print(f"   ✅ Token refreshed successfully.")
                return
            except Exception:
                print(f"   ⚠  Could not refresh. Re-authorizing...")

    # Check credentials.json exists
    if not os.path.exists(CREDENTIALS_FILE):
        print(f"\n❌ credentials.json not found at: {CREDENTIALS_FILE}")
        print("   Please download it from:")
        print("   https://console.cloud.google.com → APIs & Services → Credentials")
        print("   → OAuth 2.0 Client IDs → Download JSON → rename to credentials.json")
        print(f"   → Place it in: {Path(CREDENTIALS_FILE).parent}")
        return

    # Run OAuth2 consent flow — manual URL mode (works with any browser)
    print(f"\n   Generating authorization URL...")
    print(f"   ⚠️  Make sure to log in as: {email}\n")

    flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)

    # Generate the auth URL manually
    flow.redirect_uri = "urn:ietf:wg:oauth:2.0:oob"
    auth_url, _ = flow.authorization_url(
        prompt="consent",
        access_type="offline",
    )

    print("=" * 60)
    print("   STEP 1: Open this URL in any browser (Edge/Firefox/Chrome):")
    print("=" * 60)
    print(f"\n{auth_url}\n")
    print("=" * 60)
    print(f"   ⚠️  Sign in as: {email}")
    print("   Click 'Advanced' → 'Go to Email Bot (unsafe)' → 'Allow'")
    print("=" * 60)

    code = input("\n   STEP 2: Paste the authorization code here and press Enter:\n   > ").strip()

    if not code:
        print("   ❌ No code entered. Skipping this account.")
        return

    try:
        flow.fetch_token(code=code)
        creds = flow.credentials
    except Exception as exc:
        print(f"   ❌ Failed to exchange code: {exc}")
        return

    # Save token
    Path(token_path).parent.mkdir(parents=True, exist_ok=True)
    with open(token_path, "w") as f:
        f.write(creds.to_json())

    print(f"   ✅ Token saved to: {token_path}")


def main():
    parser = argparse.ArgumentParser(description="Gmail OAuth2 Setup")
    parser.add_argument(
        "--account",
        type=int,
        choices=[1, 2, 3],
        help="Authorize only one account (1, 2, or 3). Omit to authorize all.",
    )
    args = parser.parse_args()

    print("=" * 60)
    print("   Gmail Email Bot — OAuth2 Authorization Setup")
    print("=" * 60)

    if args.account:
        account = GMAIL_ACCOUNTS[args.account - 1]
        authorize_account(account)
    else:
        for account in GMAIL_ACCOUNTS:
            authorize_account(account)

    print("\n✅ Setup complete! You can now run: python main.py")


if __name__ == "__main__":
    main()
