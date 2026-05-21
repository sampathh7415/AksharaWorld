# Runbook 01 — Razorpay Webhook / Payment Failure

**Severity:** P1 (revenue stop)  
**Target acknowledgment:** < 4 hours

## Symptoms

- Telegram alert: Razorpay webhook error
- Customer paid but no `Transactions` row in Sheets
- Smoke test fails on `/api/razorpay-webhook`

## First response (15 min)

1. Stop paid ads and outbound checkout sends.
2. Check Cloudflare Workers logs for `/api/razorpay-webhook`.
3. Verify `RAZORPAY_WEBHOOK_SECRET` in Wrangler secrets matches Razorpay dashboard.
4. Confirm webhook URL points to production `https://[domain]/api/razorpay-webhook`.

## Diagnosis

| Check | Pass criteria |
|-------|----------------|
| Razorpay dashboard → Webhooks → delivery logs | Recent events show 200 |
| Signature validation | Test event with valid signature returns 2xx |
| Sheets write | Manual POST test creates row (staging) |
| Idempotency | Duplicate event does not double-charge row |

## Recovery

1. Fix secret or handler bug; deploy to `main`.
2. Run `node scripts/smoke-test-payment-flow.mjs` with `BASE_URL` production.
3. Replay missed payments: Razorpay dashboard → fetch payment IDs → manual `Transactions` row + Gmail receipt.
4. Notify affected customers via Chat/email.

## Post-incident

- Log to Sheets `SystemLog` with department `Guardian_Ops`
- GitHub Issue with blameless template (`docs/runbooks/incident-github-template.md`)
