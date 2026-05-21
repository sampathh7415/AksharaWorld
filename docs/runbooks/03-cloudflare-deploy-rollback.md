# Runbook 03 — Cloudflare Pages Deploy Rollback

**Severity:** P1 if production broken; P2 if preview only

## Symptoms

- 5xx on all routes after deploy
- Smoke test fails `GET /`
- Checkout or `/internal` regression

## First response (10 min)

1. Cloudflare Dashboard → Pages → AksharaWorld → Deployments.
2. Identify last **green** deployment before incident.
3. **Rollback** to previous deployment (instant on Pages).

## Git-based rollback

```bash
git log --oneline -5
git revert <bad-commit-sha>
git push origin main
```

Cloudflare auto-deploys on push to `main`.

## Verify after rollback

```bash
BASE_URL=https://your-production-url.pages.dev node scripts/smoke-test-payment-flow.mjs
```

Manual: one Razorpay **test** payment in test mode.

## Post-incident

- Document bad commit in GitHub Issue
- Add Vitest case if regression was testable
- Do not re-deploy until smoke test passes locally
