# Real-Time Decision Rules

Use GA4, Telegram, and `SalesPipeline` movement — no new infrastructure required.

| Signal | Detection | Action | Owner |
|--------|-------------|--------|-------|
| Traffic spike, flat conversion | GA4 Intelligence or manual: sessions ↑, purchases flat | Change CTA/headline on top Blogger post within 24h | Growth_Engine |
| Payment webhook failure | Telegram alert or smoke test FAIL | Stop outbound/ads; fix webhook; run `smoke-test-payment-flow.mjs` | Tech_Core + Guardian_Ops |
| Sheets API errors | Dashboard mock data + Telegram | Check Google API quota; verify secrets; see runbook #2 | Tech_Core |
| 48h no pipeline movement | No stage changes in `SalesPipeline` | Change offer band or ICP segment; log `experiment_id` in notes | Revenue_Vault |
| 5 early-bird sold | COUNT `early_bird_999` in pipeline = 5 | Switch all CTAs to ₹1,500 standard | Revenue_Vault |
| Demo → paid < 20% after 5 demos | WeeklyScorecard | Revise demo script; tighten ICP on WhatsApp | Growth_Engine |
| Unacknowledged Telegram > 4h | Manual check evening ritual | Open incident in SystemLog; follow runbook | Guardian_Ops |

## Experiment log format (in SalesPipeline `notes`)

```
experiment_id=EXP-001 change=price_1500_to_1299 channel=WhatsApp start=2026-05-21
```
