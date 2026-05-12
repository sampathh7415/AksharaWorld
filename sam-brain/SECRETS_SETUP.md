# Cloudflare Worker Secrets Setup

## Current Status
Sam Brain Worker is deployed to: `sam-ceo-brain.akshara-sam.workers.dev`

## Required Secrets (Set via Wrangler)

### 1. Gemini API Key
```bash
cd G:\My\ Drive\Antigravity\sam-brain
wrangler secret put GEMINI_API_KEY
# Paste your Gemini API key when prompted
```

### 2. Telegram Bot Configuration (for notifications)
```bash
wrangler secret put TELEGRAM_BOT_TOKEN
# Get from BotFather on Telegram

wrangler secret put OWNER_CHAT_ID
# Your Telegram chat ID
```

### 3. Google Drive Integration (for saving reports)
```bash
wrangler secret put DRIVE_FOLDER_ID
# The Google Drive folder ID for Akshara World
```

### 4. Razorpay Payment Gateway (for Phase 2)
```bash
wrangler secret put RAZORPAY_KEY_ID
wrangler secret put RAZORPAY_KEY_SECRET
```

## Verify Secrets Are Set
```bash
# List all secrets (only shows names, not values)
wrangler secret list

# You should see:
# - GEMINI_API_KEY
# - TELEGRAM_BOT_TOKEN
# - OWNER_CHAT_ID
# - DRIVE_FOLDER_ID
# - RAZORPAY_KEY_ID
# - RAZORPAY_KEY_SECRET
```

## Test the Worker

### 1. Local Testing
```bash
cd G:\My\ Drive\Antigravity\sam-brain
wrangler dev

# In another terminal:
curl http://localhost:8787/health
# Should return: {"status":"online","name":"Sam CEO Brain","version":"2.0","project":"Akshara World"}
```

### 2. Production Testing
```bash
# Test health endpoint
curl https://sam-ceo-brain.akshara-sam.workers.dev/health

# Test Sam chat (replace with your actual Gemini key if not in secrets)
curl -X POST https://sam-ceo-brain.akshara-sam.workers.dev/api/sam \
  -H "Content-Type: application/json" \
  -d '{"message":"What is our main business goal?"}'

# Expected response:
# {"reply":"<Sam's response from Gemini>"}
```

### 3. Dashboard Testing
1. Go to `http://localhost:3000` (or dash.aksharaworld.in once deployed)
2. Sign in with Clerk
3. Go to "Chat with Sam" tab
4. Send a message
5. Verify Sam responds with Gemini AI

## Troubleshooting

### "GEMINI_API_KEY not configured" error
**Solution**: Set the secret via `wrangler secret put GEMINI_API_KEY`

### Timeouts from Gemini API
**Solution**: Check API quotas at https://console.cloud.google.com/apis/dashboard

### CORS errors from dashboard
**Solution**: Verify Worker CORS headers are correct (already set in src/index.js)

## Important Security Notes
- 🔒 Never commit secrets to Git (use .gitignore for .env files)
- 🔒 Rotate API keys regularly
- 🔒 Use environment-specific secrets (dev vs prod)
- 🔒 Gemini API key is free tier only - monitor usage
