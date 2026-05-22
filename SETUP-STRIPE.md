# Connect your bank & accept real payments (Stripe)

Your store does **not** connect to your bank directly. **Stripe** holds payments and sends payouts to your bank after you link it in their dashboard.

## Step 1 — Create Stripe account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Complete **Activate your account** (business type, identity, address).
3. Open **Settings → Bank accounts and scheduling → Add bank account**.
4. Enter your bank details (India: IFSC + account; US: routing + account; EU: IBAN).

Payouts typically arrive in **2–7 business days** (varies by country).

## Step 2 — API keys in this project

1. Copy `.env.example` to `.env` in this folder.
2. In Stripe: **Developers → API keys**
3. Paste **Secret key** into `.env`:

```env
STRIPE_SECRET_KEY=sk_test_51...
BASE_URL=http://localhost:3847
```

Use `sk_live_...` only when you are ready for real money.

## Step 3 — Webhook (required for Stripe checkout → studio credits)

### Local testing

Install [Stripe CLI](https://stripe.com/docs/stripe-cli), then:

```powershell
stripe login
stripe listen --forward-to localhost:3847/api/stripe-webhook
```

Copy the `whsec_...` secret into `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Production (after deploy)

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://YOUR-DOMAIN.com/api/stripe-webhook`
3. Event: `checkout.session.completed`
4. Copy signing secret → `STRIPE_WEBHOOK_SECRET` on your host

## Step 4 — Restart the store

```powershell
cd C:\Users\Lenovo\.cursor\projects\empty-window\autopilot-store
node src\server.js
```

Console should show: `Stripe: LIVE — payouts via your linked bank`

## Step 5 — Test payment

1. Open http://localhost:3847
2. Buy a pack with test card: `4242 4242 4242 4242`, any future expiry, any CVC
3. After redirect → **Open AI Studio** with credits

## Optional — Real AI images/video

Add to `.env`:

```env
REPLICATE_API_TOKEN=r8_...
```

Get token: [https://replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)

Without this, studio still works in **demo preview** mode.
