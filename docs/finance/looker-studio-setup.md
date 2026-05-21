# Looker Studio — Weekly Revenue Snapshot

## Data sources (one-time connect)

1. **Google Sheets** — Akshara SOT spreadsheet
   - `Transactions` (revenue)
   - `WeeklyScorecard` (funnel metrics)
   - `SalesPipeline` (stage counts)
2. **GA4** — sessions and conversions (optional overlay)

## Recommended charts

| Chart | Source | Metric |
|-------|--------|--------|
| Scorecard | WeeklyScorecard | `net_revenue_inr` by week |
| Bar | WeeklyScorecard | touches, demos, paid |
| Funnel | SalesPipeline | COUNT by `stage` |
| Table | Transactions | last 20 payments |

## Weekly ritual (Sunday, 10 min)

1. Update `WeeklyScorecard` row for the week ending today.
2. Open Looker dashboard → screenshot for records.
3. Note best channel in scorecard `notes` field.

## Formulas in Sheets (optional)

In `WeeklyScorecard`, `net_revenue_inr`:
```
=revenue_inr - refunds_inr
```

Pipeline stage counts (example for week):
```
=COUNTIF(SalesPipeline!D:D,"paid")
```
