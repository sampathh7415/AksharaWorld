# Meta Graph API Credentials Setup Guide

> Generated via llama3 (local Ollama) | AksharaWorld | 2026-06-14  
> Full guide to obtaining all credentials needed for `poster.py` to post to Instagram, Facebook, and Threads automatically.

---

## Prerequisites

- A **Facebook account** with admin access to your Facebook Page  
- An **Instagram Business Account** connected to that Facebook Page  
- A browser logged into the account you use for AksharaWorld  

---

## Step-by-Step Guide

### Part 1 — Create the Meta Developer App

1. Go to **https://developers.facebook.com/apps** and log in with your Facebook account (Sampathh7415@gmail.com).

2. Click **"Create App"**.

3. Select use case: **"Other"** → then **"Business"** type.

4. Fill in:
   - **App Name:** `AksharaWorld Poster`
   - **App Contact Email:** your Gmail
   - **Business Account:** select your Meta Business Suite account (or create one)

5. Click **"Create App"**. You will land on the App Dashboard.

6. Note your **App ID** and **App Secret** (Settings → Basic) — these are `META_APP_ID` and `META_APP_SECRET`.

---

### Part 2 — Add Instagram Graph API Product

7. In the App Dashboard left sidebar, click **"Add Product"**.

8. Find **"Instagram Graph API"** and click **"Set Up"**.

9. Also add **"Facebook Login"** → **"Set Up"** → choose **"Web"** → enter `https://aksharaworld.in` as Site URL.

---

### Part 3 — Get Your Page Access Token

10. Go to **https://developers.facebook.com/tools/explorer**

11. In the top-right dropdown, select your **App** (`AksharaWorld Poster`).

12. Under **"User or Page"**, click **"Get Page Access Token"** → select your **Facebook Page** (AksharaWorld).

13. When prompted for permissions, grant:
    - `pages_show_list`
    - `pages_read_engagement`
    - `pages_manage_posts`
    - `instagram_basic`
    - `instagram_content_publish`
    - `instagram_manage_comments`

14. Copy the **Page Access Token** — this is your short-lived `META_PAGE_ACCESS_TOKEN` (valid ~1 hour).

---

### Part 4 — Get Your Instagram Business Account ID

15. In the Graph API Explorer, with your Page Access Token selected, run this query:

    ```
    GET /me/accounts
    ```

    Find your Page in the response. Note the **`id`** — this is your `FACEBOOK_PAGE_ID`.

16. Then run:

    ```
    GET /{page-id}?fields=instagram_business_account
    ```

    The returned `instagram_business_account.id` is your **`INSTAGRAM_ACCOUNT_ID`**.

---

### Part 5 — Convert to Long-Lived Token (60 days)

17. Call this URL in your browser (replace placeholders):

    ```
    https://graph.facebook.com/v19.0/oauth/access_token
      ?grant_type=fb_exchange_token
      &client_id={META_APP_ID}
      &client_secret={META_APP_SECRET}
      &fb_exchange_token={SHORT_LIVED_PAGE_TOKEN}
    ```

    The response contains `access_token` — this is your **`META_LONG_LIVED_TOKEN`** (valid 60 days).

18. Set up a cron job or reminder to refresh this token every 50 days.  
    The token refresh script is in `services/social-media/poster.py` (`SETUP_GUIDE` section).

---

## Environment Variables to Add to `.env.local`

After completing the steps above, fill in these values in your `.env.local`:

```env
META_APP_ID=your_app_id_here
META_APP_SECRET=your_app_secret_here
META_PAGE_ACCESS_TOKEN=your_long_lived_page_token_here
META_LONG_LIVED_TOKEN=your_long_lived_page_token_here
INSTAGRAM_ACCOUNT_ID=your_ig_business_account_id_here
FACEBOOK_PAGE_ID=your_facebook_page_id_here
THREADS_USER_ID=same_as_instagram_account_id
```

---

## Verification

Once credentials are set, run a dry-test:

```bash
cd "G:\My Drive\Antigravity"
python services/social-media/poster.py
```

This will print the `SETUP_GUIDE` and confirm which credentials are present.

To test a live post:

```bash
python services/social-media/daily_runner.py --dry-run
```

---

## Notes

- **App Review:** For posting to public Pages, Meta may require App Review for `instagram_content_publish`. For testing, use the app in **Development Mode** — it works for accounts listed as app testers/admins.
- **Token Expiry:** Long-lived tokens expire in 60 days. Set a calendar reminder to renew before expiry.
- **Rate Limits:** Instagram Graph API allows 200 calls/hour per user token (free tier). One post per day is well within limits.
