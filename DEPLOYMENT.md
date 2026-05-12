# AksharaWorld Deployment Guide

## Current Status
- ✅ Dashboard build: Complete
- ✅ Sam Brain Worker: Already deployed to `sam-ceo-brain.akshara-sam.workers.dev`
- ⏳ Dashboard hosting: Ready for Cloudflare Pages deployment

## Prerequisites
1. Cloudflare account with `aksharaworld.in` domain registered
2. Cloudflare API Token (with Pages and Workers permissions)
3. Environment variables configured

## Deployment Steps

### Option 1: Automatic Deployment (GitHub Actions) — RECOMMENDED
1. Push code to GitHub main branch
2. GitHub Actions will automatically:
   - Build the Next.js dashboard
   - Deploy to Cloudflare Pages
   - Configure the worker integration

**Secrets needed in GitHub**:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SAM_URL` (sam-ceo-brain.akshara-sam.workers.dev)

### Option 2: Manual Deployment via Wrangler CLI
```bash
# 1. Install Wrangler globally
npm install -g wrangler

# 2. Authenticate with Cloudflare
wrangler login

# 3. Build the dashboard
npm run build

# 4. Deploy to Cloudflare Pages
wrangler pages deploy .next/standalone --project-name=akshara-dashboard

# 5. Configure custom domain
# Go to Cloudflare Dashboard → Pages → akshara-dashboard → Custom Domain
# Add: dash.aksharaworld.in
```

## Post-Deployment Configuration

### 1. Custom Domain Setup
In Cloudflare Dashboard:
1. Go to Pages → akshara-dashboard → Custom domain
2. Add: `dash.aksharaworld.in`
3. Verify DNS records are correct

### 2. Environment Variables
Set in Cloudflare Pages dashboard or .env:
```
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_SAM_URL=https://sam-ceo-brain.akshara-sam.workers.dev
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

### 3. Worker-to-Dashboard CORS
Verify CORS headers in Sam Brain Worker (already configured in `src/index.js`)

## Verification Checklist
- [ ] Dashboard deployed and accessible at dash.aksharaworld.in
- [ ] Clerk authentication working
- [ ] Sam Brain Worker responding at /health
- [ ] Chat with Sam works and connects to Gemini
- [ ] Dashboard data API (/api/dashboard) returns data
- [ ] Approvals API (/api/approve) accepts requests

## Troubleshooting

### 404 on custom domain
- Ensure DNS CNAME points to Cloudflare Pages
- Wait 5-10 minutes for DNS propagation

### CORS errors from Sam Brain
- Check Worker has CORS headers enabled
- Verify `Access-Control-Allow-Origin: *` in Worker response

### API routes not working
- Ensure `.env.local` has SAM_BRAIN_URL set correctly
- Check Worker is deployed and online

## Next Steps After Deployment
1. ✅ Approve "Dashboard Deployment" in Approvals queue
2. Run Innovation_Scout to identify revenue niches
3. Setup Telegram notifications
4. Configure Razorpay for first revenue stream
