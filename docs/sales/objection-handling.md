# Objection Handling Sheet

| Objection | Response |
|-----------|----------|
| **₹1,500 is too much** | Early-bird ₹999 for first 5 only. Compare to one month of paid hosting + auth + analytics — we target ₹0 infra. Refund within 7 days if access not delivered. |
| **Is AI real or just ChatGPT?** | Sam is a dedicated Worker (`sam-brain/`) with department directives logged to Sheets. You approve critical actions — human-in-the-loop. |
| **I don't trust data in Sheets** | Clerk auth, Cloudflare TLS, Razorpay PCI — card data never touches our servers. Privacy policy at `/public/privacy`. |
| **I already use Notion/Trello** | Akshara is for **revenue + real-time ops**, not task lists. Sheets SOT + Razorpay + GA4 in one Command Center. |
| **What if you're down?** | Cloudflare 99.9% SLA; `resilientFetch` degrades gracefully; Telegram alerts on failures. |
| **GST / invoice?** | We provide Razorpay payment receipt; formal GST invoice — [add your GST details before scaling]. |
| **Need to think** | Send checkout link + 48h follow-up. Log `replied` → `demo` or `lost` in pipeline. |
