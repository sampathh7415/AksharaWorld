# Command Center Demo Script (15 minutes)

**Goal:** Show real-time ops → book paid pilot or send checkout link.

## Prep (2 min)

- Open `/internal` → Insight Lab tab
- Have Sheets `SalesPipeline` row open for prospect name
- Razorpay test checkout link ready

## Agenda

| Min | Section | Talk track |
|-----|---------|------------|
| 0–2 | Hook | "You run the business; Sam runs 8 departments on ₹0 cloud. Everything logs to Sheets — you approve what matters." |
| 2–6 | Insight Lab | GA4 sessions, revenue from Sheets, merchant feed, department logs — refresh live |
| 6–10 | Sam + approve queue | Daily cron → directives → max 2 approvals/day; show SystemLog |
| 10–12 | Payments | Razorpay → webhook → Transaction row → Telegram alert |
| 12–14 | Offer | Launch Pilot deliverables + ₹999 early-bird (if slots left) or ₹1,500 |
| 14–15 | Close | "I'll send checkout in Chat — or we start Monday with onboarding." |

## Objection pointers

See `docs/sales/objection-handling.md`.

## After demo

1. Update `SalesPipeline` stage → `demo` or `paid`
2. Send checkout link within 1 hour
3. Log demo count in `WeeklyScorecard`
