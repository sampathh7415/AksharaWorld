# Daily Real-Time Ritual (~25 min, Mon–Sat)

## Morning (~15 min)

1. Open **Command Center** → `/internal` → **Insight Lab**
   - GA4 sessions (yesterday + 7-day trend)
   - Revenue from Sheets `Transactions`
   - Merchant feed status
   - Department logs
2. **Approve queue** — approve/reject Sam directives; **max 2 approvals today** (`sam-brain/ops-config.json`)
3. Note any Telegram or GA4 alerts from overnight

## Evening (~10 min)

1. Update **SalesPipeline** — all touches, stage changes, `next_action`
2. Confirm **Telegram** — no unacknowledged payment/API alerts (>4h)
3. If alert open → follow `docs/runbooks/` + log SystemLog

## Checklists

- Morning: `docs/cadence/checklist-morning.md`
- Evening: `docs/cadence/checklist-evening.md`

## Skip only if

- Emergency; log skip reason in `WeeklyScorecard` notes

**Target:** ≥20 days completed in 30-day window
