"""
AksharaWorld — Social Media Poster Service
Handles: Instagram, Facebook, Threads, YouTube, X (Twitter), Pinterest
Author: Sam (AI CEO) | Built: 2026-06-14
Zero-cost architecture using free API tiers only.
"""

import os
import json
import time
import requests
import mimetypes
from datetime import datetime
from pathlib import Path
from typing import Optional


# ── Credential loader ────────────────────────────────────────────────────────

def _env(key: str, default: str = "") -> str:
    """Load from environment or .env.local file."""
    val = os.environ.get(key, "")
    if val:
        return val
    env_path = Path(__file__).resolve().parents[2] / ".env.local"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8", errors="ignore").splitlines():
            line = line.strip()
            if line.startswith(key + "="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return default


# ── Constants ────────────────────────────────────────────────────────────────

TELEGRAM_BOT_TOKEN   = _env("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID     = _env("TELEGRAM_CHAT_ID")
SHEETS_WEBHOOK_URL   = _env("SHEETS_WEBHOOK_URL")

META_PAGE_ACCESS_TOKEN  = _env("META_PAGE_ACCESS_TOKEN")
FACEBOOK_PAGE_ID        = _env("FACEBOOK_PAGE_ID")
INSTAGRAM_ACCOUNT_ID    = _env("INSTAGRAM_ACCOUNT_ID")

YOUTUBE_API_KEY         = _env("YOUTUBE_API_KEY")
YOUTUBE_CLIENT_ID       = _env("YOUTUBE_CLIENT_ID")
YOUTUBE_CLIENT_SECRET   = _env("YOUTUBE_CLIENT_SECRET")
YOUTUBE_REFRESH_TOKEN   = _env("YOUTUBE_REFRESH_TOKEN")

X_API_KEY               = _env("X_API_KEY")
X_API_SECRET            = _env("X_API_SECRET")
X_ACCESS_TOKEN          = _env("X_ACCESS_TOKEN")
X_ACCESS_TOKEN_SECRET   = _env("X_ACCESS_TOKEN_SECRET")
X_BEARER_TOKEN          = _env("X_BEARER_TOKEN")

PINTEREST_ACCESS_TOKEN  = _env("PINTEREST_ACCESS_TOKEN")
PINTEREST_BOARD_ID      = _env("PINTEREST_BOARD_ID")

GRAPH_API_BASE = "https://graph.facebook.com/v19.0"
AKSHARA_SITE   = "https://aksharaworld.in"


# ── Main Poster Class ────────────────────────────────────────────────────────

class AksharaWorldPoster:
    """
    Automated social media poster for AksharaWorld.
    Handles Instagram, Facebook, YouTube, X, Pinterest, Threads.
    Runs on a schedule via Windows Task Scheduler (7:00 AM daily).

    Zero-cost: uses free API tiers only. All credentials loaded from .env.local.
    Every post is logged to Google Sheets and Telegram-notified.
    """

    def __init__(self):
        self.results = {}

    # ── Instagram Reel ───────────────────────────────────────────────────────

    def post_instagram_reel(self, video_path: str, caption: str) -> dict:
        """
        Upload video to Instagram as a Reel via Meta Graph API.
        Two-step: (1) create media container, (2) publish.
        Requires: INSTAGRAM_ACCOUNT_ID, META_PAGE_ACCESS_TOKEN
        """
        if not INSTAGRAM_ACCOUNT_ID or not META_PAGE_ACCESS_TOKEN:
            return self._missing("instagram", "INSTAGRAM_ACCOUNT_ID or META_PAGE_ACCESS_TOKEN")

        video_path = Path(video_path)
        if not video_path.exists():
            return self._error("instagram", f"Video not found: {video_path}")

        print(f"[Instagram] Uploading Reel: {video_path.name}")

        # Step 1: Create media container (resumable upload for large files)
        container_url = f"{GRAPH_API_BASE}/{INSTAGRAM_ACCOUNT_ID}/media"
        container_params = {
            "media_type": "REELS",
            "video_url": self._get_public_url(str(video_path)),  # needs CDN URL
            "caption": caption,
            "share_to_feed": "true",
            "access_token": META_PAGE_ACCESS_TOKEN,
        }

        resp = requests.post(container_url, data=container_params, timeout=60)
        if not resp.ok:
            return self._api_error("instagram", resp)

        container_id = resp.json().get("id")
        print(f"[Instagram] Container created: {container_id}")

        # Step 2: Poll until container is ready (FINISHED status)
        for attempt in range(20):
            time.sleep(5)
            status_resp = requests.get(
                f"{GRAPH_API_BASE}/{container_id}",
                params={"fields": "status_code", "access_token": META_PAGE_ACCESS_TOKEN},
                timeout=15
            )
            status = status_resp.json().get("status_code", "")
            print(f"[Instagram] Container status: {status} (attempt {attempt+1})")
            if status == "FINISHED":
                break
            elif status == "ERROR":
                return self._error("instagram", "Container processing failed")

        # Step 3: Publish
        publish_url = f"{GRAPH_API_BASE}/{INSTAGRAM_ACCOUNT_ID}/media_publish"
        pub_resp = requests.post(
            publish_url,
            data={"creation_id": container_id, "access_token": META_PAGE_ACCESS_TOKEN},
            timeout=30
        )
        if not pub_resp.ok:
            return self._api_error("instagram", pub_resp)

        post_id = pub_resp.json().get("id")
        print(f"[Instagram] ✅ Reel published: {post_id}")
        return {"status": "success", "platform": "instagram", "post_id": post_id}

    # ── Facebook Page ────────────────────────────────────────────────────────

    def post_facebook(self, message: str, image_path: Optional[str] = None,
                      video_path: Optional[str] = None) -> dict:
        """
        Post to Facebook Page via Meta Graph API.
        Supports text, photo, and video posts.
        Requires: FACEBOOK_PAGE_ID, META_PAGE_ACCESS_TOKEN
        """
        if not FACEBOOK_PAGE_ID or not META_PAGE_ACCESS_TOKEN:
            return self._missing("facebook", "FACEBOOK_PAGE_ID or META_PAGE_ACCESS_TOKEN")

        print(f"[Facebook] Posting to Page {FACEBOOK_PAGE_ID}")

        if video_path and Path(video_path).exists():
            # Video post
            url = f"{GRAPH_API_BASE}/{FACEBOOK_PAGE_ID}/videos"
            with open(video_path, "rb") as vf:
                resp = requests.post(
                    url,
                    data={"description": message, "access_token": META_PAGE_ACCESS_TOKEN},
                    files={"file": (Path(video_path).name, vf, "video/mp4")},
                    timeout=120
                )
        elif image_path and Path(image_path).exists():
            # Photo post
            url = f"{GRAPH_API_BASE}/{FACEBOOK_PAGE_ID}/photos"
            with open(image_path, "rb") as img:
                resp = requests.post(
                    url,
                    data={"message": message, "access_token": META_PAGE_ACCESS_TOKEN},
                    files={"source": (Path(image_path).name, img, "image/png")},
                    timeout=60
                )
        else:
            # Text-only post
            url = f"{GRAPH_API_BASE}/{FACEBOOK_PAGE_ID}/feed"
            resp = requests.post(
                url,
                data={"message": message, "access_token": META_PAGE_ACCESS_TOKEN},
                timeout=30
            )

        if not resp.ok:
            return self._api_error("facebook", resp)

        post_id = resp.json().get("id") or resp.json().get("post_id")
        print(f"[Facebook] ✅ Posted: {post_id}")
        return {"status": "success", "platform": "facebook", "post_id": post_id}

    # ── Threads ──────────────────────────────────────────────────────────────

    def post_threads(self, text: str, image_path: Optional[str] = None,
                     video_path: Optional[str] = None) -> dict:
        """
        Post to Threads via Meta Threads API (same Graph API credentials).
        Requires: INSTAGRAM_ACCOUNT_ID (Threads uses same IG account), META_PAGE_ACCESS_TOKEN
        """
        if not INSTAGRAM_ACCOUNT_ID or not META_PAGE_ACCESS_TOKEN:
            return self._missing("threads", "INSTAGRAM_ACCOUNT_ID or META_PAGE_ACCESS_TOKEN")

        print("[Threads] Creating post container...")

        media_type = "TEXT"
        extra = {}
        if image_path and Path(image_path).exists():
            media_type = "IMAGE"
            extra["image_url"] = self._get_public_url(image_path)
        elif video_path and Path(video_path).exists():
            media_type = "VIDEO"
            extra["video_url"] = self._get_public_url(video_path)

        # Step 1: Create container
        container_resp = requests.post(
            f"{GRAPH_API_BASE}/{INSTAGRAM_ACCOUNT_ID}/threads",
            data={
                "media_type": media_type,
                "text": text,
                "access_token": META_PAGE_ACCESS_TOKEN,
                **extra
            },
            timeout=30
        )
        if not container_resp.ok:
            return self._api_error("threads", container_resp)

        container_id = container_resp.json().get("id")
        time.sleep(3)

        # Step 2: Publish
        pub_resp = requests.post(
            f"{GRAPH_API_BASE}/{INSTAGRAM_ACCOUNT_ID}/threads_publish",
            data={"creation_id": container_id, "access_token": META_PAGE_ACCESS_TOKEN},
            timeout=30
        )
        if not pub_resp.ok:
            return self._api_error("threads", pub_resp)

        post_id = pub_resp.json().get("id")
        print(f"[Threads] ✅ Published: {post_id}")
        return {"status": "success", "platform": "threads", "post_id": post_id}

    # ── YouTube Short ────────────────────────────────────────────────────────

    def post_youtube_short(self, video_path: str, title: str,
                           description: str, tags: list) -> dict:
        """
        Upload YouTube Short via YouTube Data API v3.
        Requires OAuth2 refresh token. Uses YOUTUBE_REFRESH_TOKEN from .env.local.
        """
        if not YOUTUBE_REFRESH_TOKEN or not YOUTUBE_CLIENT_ID:
            return self._missing("youtube", "YOUTUBE_REFRESH_TOKEN or YOUTUBE_CLIENT_ID")

        # Refresh access token
        token_resp = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": YOUTUBE_CLIENT_ID,
                "client_secret": YOUTUBE_CLIENT_SECRET,
                "refresh_token": YOUTUBE_REFRESH_TOKEN,
                "grant_type": "refresh_token",
            },
            timeout=15
        )
        if not token_resp.ok:
            return self._api_error("youtube", token_resp)
        access_token = token_resp.json()["access_token"]

        print(f"[YouTube] Uploading Short: {Path(video_path).name}")

        # Initiate resumable upload
        metadata = {
            "snippet": {
                "title": title[:100],
                "description": description,
                "tags": tags[:500],
                "categoryId": "22",  # People & Blogs
            },
            "status": {
                "privacyStatus": "public",
                "selfDeclaredMadeForKids": False,
            }
        }

        init_resp = requests.post(
            "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json; charset=UTF-8",
                "X-Upload-Content-Type": "video/mp4",
            },
            json=metadata,
            timeout=30
        )
        if not init_resp.ok:
            return self._api_error("youtube", init_resp)

        upload_url = init_resp.headers.get("Location")

        # Upload video bytes
        with open(video_path, "rb") as vf:
            video_data = vf.read()

        upload_resp = requests.put(
            upload_url,
            headers={
                "Content-Type": "video/mp4",
                "Content-Length": str(len(video_data)),
            },
            data=video_data,
            timeout=300
        )
        if upload_resp.status_code not in (200, 201):
            return self._api_error("youtube", upload_resp)

        video_id = upload_resp.json().get("id")
        print(f"[YouTube] ✅ Uploaded: https://youtube.com/shorts/{video_id}")
        return {"status": "success", "platform": "youtube", "post_id": video_id,
                "url": f"https://youtube.com/shorts/{video_id}"}

    # ── X (Twitter) ──────────────────────────────────────────────────────────

    def post_x_twitter(self, text: str, media_path: Optional[str] = None) -> dict:
        """
        Post to X via Twitter API v2 (OAuth 1.0a).
        Requires: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET
        """
        if not X_ACCESS_TOKEN or not X_API_KEY:
            return self._missing("x_twitter", "X_ACCESS_TOKEN or X_API_KEY")

        try:
            import tweepy
        except ImportError:
            return self._error("x_twitter", "tweepy not installed. Run: pip install tweepy")

        auth = tweepy.OAuth1UserHandler(
            X_API_KEY, X_API_SECRET,
            X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET
        )
        client = tweepy.Client(
            consumer_key=X_API_KEY,
            consumer_secret=X_API_SECRET,
            access_token=X_ACCESS_TOKEN,
            access_token_secret=X_ACCESS_TOKEN_SECRET
        )

        media_id = None
        if media_path and Path(media_path).exists():
            api_v1 = tweepy.API(auth)
            media = api_v1.media_upload(media_path)
            media_id = media.media_id

        print(f"[X] Posting tweet: {text[:50]}...")
        resp = client.create_tweet(text=text[:280], media_ids=[media_id] if media_id else None)
        tweet_id = resp.data["id"]
        print(f"[X] ✅ Tweet posted: {tweet_id}")
        return {"status": "success", "platform": "x_twitter", "post_id": str(tweet_id),
                "url": f"https://x.com/aksharaworld_in/status/{tweet_id}"}

    # ── Pinterest ────────────────────────────────────────────────────────────

    def post_pinterest(self, image_path: str, title: str,
                       description: str, link: str = AKSHARA_SITE) -> dict:
        """
        Create Pinterest pin via Pinterest API v5.
        Requires: PINTEREST_ACCESS_TOKEN, PINTEREST_BOARD_ID
        """
        if not PINTEREST_ACCESS_TOKEN or not PINTEREST_BOARD_ID:
            return self._missing("pinterest", "PINTEREST_ACCESS_TOKEN or PINTEREST_BOARD_ID")

        print(f"[Pinterest] Creating pin: {title}")

        pin_data = {
            "title": title[:100],
            "description": description[:500],
            "link": link,
            "board_id": PINTEREST_BOARD_ID,
            "media_source": {
                "source_type": "image_base64",
                "content_type": "image/png",
                "data": self._image_to_base64(image_path),
            }
        }

        resp = requests.post(
            "https://api.pinterest.com/v5/pins",
            headers={
                "Authorization": f"Bearer {PINTEREST_ACCESS_TOKEN}",
                "Content-Type": "application/json",
            },
            json=pin_data,
            timeout=60
        )
        if not resp.ok:
            return self._api_error("pinterest", resp)

        pin_id = resp.json().get("id")
        print(f"[Pinterest] ✅ Pin created: {pin_id}")
        return {"status": "success", "platform": "pinterest", "post_id": pin_id}

    # ── Logging & Notifications ──────────────────────────────────────────────

    def log_post(self, platform: str, post_id: str,
                 status: str, content_type: str, caption: str = ""):
        """Log every post to Google Sheets via Apps Script webhook."""
        if not SHEETS_WEBHOOK_URL:
            print(f"[Log] SHEETS_WEBHOOK_URL not set — skipping Sheets log")
            return

        payload = {
            "action": "social_post_log",
            "platform": platform,
            "post_id": post_id,
            "status": status,
            "content_type": content_type,
            "caption_preview": caption[:100],
            "timestamp": datetime.now().isoformat(),
        }
        try:
            requests.post(SHEETS_WEBHOOK_URL, json=payload, timeout=10)
            print(f"[Log] ✅ Logged to Sheets: {platform} / {status}")
        except Exception as e:
            print(f"[Log] ⚠️ Sheets logging failed: {e}")

    def notify_owner(self, message: str):
        """Send Telegram alert to owner via @Akshu23bot."""
        if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
            print(f"[Telegram] Credentials missing — message: {message}")
            return
        try:
            url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
            requests.post(url, json={
                "chat_id": TELEGRAM_CHAT_ID,
                "text": f"🤖 AksharaWorld Sam\n\n{message}",
                "parse_mode": "HTML"
            }, timeout=10)
            print(f"[Telegram] ✅ Owner notified")
        except Exception as e:
            print(f"[Telegram] ⚠️ Failed: {e}")

    # ── Helpers ──────────────────────────────────────────────────────────────

    def _get_public_url(self, local_path: str) -> str:
        """
        For Meta Graph API, videos/images must be publicly accessible.
        Since assets are in Google Drive (synced), we store on aksharaworld.in/assets/
        or use a temporary signed URL approach.
        TODO: Upload to aksharaworld.in/api/temp-upload and return CDN URL.
        """
        filename = Path(local_path).name
        return f"{AKSHARA_SITE}/assets/media/{filename}"

    def _image_to_base64(self, image_path: str) -> str:
        import base64
        with open(image_path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")

    def _missing(self, platform: str, keys: str) -> dict:
        msg = f"[{platform.upper()}] ⚠️ Missing credentials: {keys}. Add to .env.local."
        print(msg)
        return {"status": "skipped", "platform": platform, "reason": msg}

    def _error(self, platform: str, msg: str) -> dict:
        print(f"[{platform.upper()}] ❌ Error: {msg}")
        return {"status": "error", "platform": platform, "reason": msg}

    def _api_error(self, platform: str, resp: requests.Response) -> dict:
        msg = f"HTTP {resp.status_code}: {resp.text[:200]}"
        print(f"[{platform.upper()}] ❌ API Error: {msg}")
        return {"status": "error", "platform": platform, "reason": msg,
                "http_status": resp.status_code}


# ── Setup Guide ──────────────────────────────────────────────────────────────

SETUP_GUIDE = """
=== AksharaWorld Social Media API Setup Guide ===

STEP 1 — Meta (Instagram + Facebook + Threads):
  1. Go to: https://developers.facebook.com/apps
  2. Create a new App → Business type
  3. Add products: "Instagram Graph API" + "Facebook Login"
  4. Connect your Facebook Page and Instagram Business account
  5. Generate a Page Access Token (Settings → Page Access Tokens)
  6. Exchange for long-lived token (60 days):
     GET https://graph.facebook.com/v19.0/oauth/access_token
       ?grant_type=fb_exchange_token
       &client_id={META_APP_ID}
       &client_secret={META_APP_SECRET}
       &fb_exchange_token={SHORT_LIVED_TOKEN}
  7. Add to .env.local:
     META_APP_ID=your_app_id
     META_APP_SECRET=your_app_secret
     META_PAGE_ACCESS_TOKEN=your_long_lived_token
     FACEBOOK_PAGE_ID=your_page_id
     INSTAGRAM_ACCOUNT_ID=your_ig_business_account_id

STEP 2 — YouTube:
  1. Go to: https://console.cloud.google.com
  2. Enable YouTube Data API v3
  3. Create OAuth 2.0 credentials
  4. Run: python services/social-media/youtube_auth.py
  5. Add to .env.local:
     YOUTUBE_CLIENT_ID=...
     YOUTUBE_CLIENT_SECRET=...
     YOUTUBE_REFRESH_TOKEN=...

STEP 3 — X (Twitter):
  1. Go to: https://developer.twitter.com
  2. Create a project and app → get API keys
  3. Generate Access Token + Secret (Read/Write permissions)
  4. Add to .env.local:
     X_API_KEY=...
     X_API_SECRET=...
     X_ACCESS_TOKEN=...
     X_ACCESS_TOKEN_SECRET=...

STEP 4 — Pinterest:
  1. Go to: https://developers.pinterest.com
  2. Create an app → get access token
  3. Find your board ID from pinterest.com/aksharaworld/
  4. Add to .env.local:
     PINTEREST_ACCESS_TOKEN=...
     PINTEREST_BOARD_ID=...
"""

if __name__ == "__main__":
    print(SETUP_GUIDE)
