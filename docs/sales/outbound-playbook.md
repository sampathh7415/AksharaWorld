# Outbound Playbook (Week 2+)

## Daily quota

**10 touches/day** (Mon–Sat). Log every touch in `SalesPipeline` before EOD.

## Stages

`prospect` → `contacted` → `replied` → `demo` → `paid` | `lost`

## Channels (priority order)

1. WhatsApp (India SMB, local services)
2. Instagram / YouTube DM (creators)
3. Email (coaches, freelancers)
4. LinkedIn (B2B services)

## Message templates

### First touch (WhatsApp / DM)

```
Hi [Name] — I help builders in India launch a digital business on ₹0 infra
(Command Center + Sam AI running 8 departments). 

First 5 seats at ₹999, then ₹1,500. 15-min demo if useful.
Worth a quick look?
```

### Follow-up (48h no reply)

```
Bumping this — happy to show the Command Center live (15 min) or send the checkout link.
No pressure if timing's off.
```

### Demo invite

```
Great — here's a 15-min slot: [Calendly or manual times].
We'll walk through Insight Lab + how Sam logs every department action to Sheets.
```

### Checkout send (after interest)

```
Here's the Launch Pilot checkout (₹999 early-bird / ₹1,500 standard): [Razorpay link]
Refund within 7 days if we don't provision access. Support via Google Chat <24h weekdays.
```

## Early-bird rules

- Track `early_bird_sold` in `WeeklyScorecard`
- Stop offering ₹999 after 5 paid `early_bird_999` rows in `SalesPipeline`

## Weekly review

Sunday: count touches → replied → demo → paid by channel; allocate 70% effort to best channel in Week 4.
