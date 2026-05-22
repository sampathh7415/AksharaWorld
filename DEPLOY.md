# Publish your AI store 24/7 (free tier options)

Deploy so customers can buy while your PC is off.

## Option A — Render (recommended, free tier)

1. Push this folder to GitHub.
2. [https://render.com](https://render.com) → **New Web Service** → connect repo.
3. Settings:
   - **Build command:** (leave empty)
   - **Start command:** `node src/server.js`
   - **Environment:** add all variables from `.env.example`
   - `BASE_URL` = `https://your-app.onrender.com`
4. Add Stripe webhook URL: `https://your-app.onrender.com/api/stripe-webhook`
5. Deploy → share your public URL.

`render.yaml` in this repo can be used for blueprint deploy.

## Option B — Railway

1. [https://railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Set start command: `node src/server.js`
3. Add env vars + public domain
4. Stripe webhook → your Railway URL

## Option C — Your VPS / Windows server

```powershell
# Install Node 18+, clone repo, then:
cd autopilot-store
copy .env.example .env
# edit .env with production BASE_URL and Stripe keys

# Keep running with PM2 or NSSM:
npm install -g pm2
pm2 start src/server.js --name ai-store
pm2 save
```

Point a domain (Cloudflare, Namecheap, etc.) to your server IP with HTTPS (Caddy or nginx + Let's Encrypt).

## After deploy checklist

- [ ] `BASE_URL` matches public HTTPS URL
- [ ] `STRIPE_SECRET_KEY` = live or test key
- [ ] Webhook `checkout.session.completed` configured
- [ ] Bank linked in Stripe Dashboard
- [ ] Test purchase → studio credits work
- [ ] Optional: `REPLICATE_API_TOKEN` for real AI output

## Custom domain

On Render/Railway: add custom domain in dashboard → update DNS CNAME → update `BASE_URL` and Stripe webhook URL.
