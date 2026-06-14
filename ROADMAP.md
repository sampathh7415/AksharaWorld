# AksharaWorld — Roadmap & Current Status
*Version 4.0 — June 2026 — This is the single source of truth for "what's the goal and where are we right now."*

> **Rule:** Each phase locks only when its lock condition is 100% verified. Never move to the next phase until the current one is locked. Once locked, a phase is never reworked unless a critical bug appears.

---

## Business Identity

- **Name:** AksharaWorld | **Domain:** aksharaworld.in (live, Cloudflare) | **Dashboard:** dashboard.aksharaworld.in (live)
- **Logo:** Gold/navy circular "A" emblem — approved, used everywhere
- **GitHub:** github.com/sampathh7415/AksharaWorld (main branch = single source of truth for code)
- **Target audience:** Middle-class individuals in India and worldwide, affordable digital services
- **Brand ambassador:** "Akshara" — original illustrated mascot (NOT based on any real photo)
- **AI CEO:** "Sam" — abstract icon identity from logo palette, no human face

---

## Non-Negotiable Rules

1. Zero recurring cost — every tool must have a free tier
2. Lock before move — phase locks only when 100% verified
3. All data is yours — Sheets, Drive, GitHub. Never trapped in paid SaaS
4. GitHub `main` is the only place code changes happen — staging/scratch folders are disposable, never persistent
5. Telegram is the nerve — every critical event reaches the owner on mobile
6. Sam never auto-updates high-impact systems without owner approval via Telegram
7. **Legal compliance is non-negotiable** — Refund Policy, Terms of Service, Privacy Policy must be live before processing payments
8. **Security hygiene is recurring** — quarterly key rotation, 2FA on every account touching money or customer data
9. Revenue and infrastructure build happen in parallel — never wait for "perfect" before earning

---

## Storage Architecture (Single Source of Truth)

| Data type | Lives in |
|---|---|
| Code | GitHub `main` → deploys to Cloudflare Pages |
| Files/content delivered to customers | Google Drive (master copy) |
| Operational data (orders, logs, KPIs) | Google Sheets |
| Sam's memory | Local SQLite + ChromaDB (backed up to Drive) |
| Deployed site | Cloudflare Pages (derived output only) |

Staging/scratch folders (`aksharaworld-staging`, `node_modules_build`, `.gemini\antigravity\scratch`) are temporary — deleted after use, never treated as "the project."

---

## 🔒 PHASE 0 — Foundation (LOCKED ✅)

**What's done:**
- `aksharaworld.in` returns 200 OK on Cloudflare Pages (migrated from Netlify)
- All 5 Razorpay payment links correctly priced and wired
- `package.json` fixed (Next 15.2.8, React 18, Supabase removed)
- GA4 verified (`G-QZ4L9XW64F`)
- Telegram bot (`@Akshu23bot`), Google Sheets webhook, Ollama (5 models), FastAPI (port 8765) — all verified live with real API calls
- Pipeline config (`src/lib/sam/pipeline.config.ts`) created — tool routing map
- 30 stale PRs closed
- Exposed Razorpay secret removed from `wrangler.toml`, regenerated

**Remaining manual step:** Create LinkedIn page for AksharaWorld

---

## PHASE 1 — Revenue Engine

**Goal:** First real ₹1 earned and delivered, legally compliant, focused launch.

| # | Task |
|---|---|
| 1.1 | **Add legal pages** — Refund/Cancellation Policy, Terms of Service, Privacy Policy. Required for Razorpay live compliance. Do this BEFORE soft-launch |
| 1.2 | Run storefront audit — verify order intake form, payment flow, post-payment customer experience, Telegram alert + Sheets logging on successful payment |
| 1.3 | Fix any gaps the audit finds (thank-you page, confirmation email, etc.) |
| 1.4 | **Hero product focus** — soft-launch promotes ONLY Resume ATS Optimization (₹999) initially. Other 13 products remain on-site but not actively marketed yet |
| 1.5 | Soft-launch on existing social accounts (Instagram, Facebook, X, Threads, Pinterest, YouTube) + personal WhatsApp network, linking to aksharaworld.in |
| 1.6 | Deliver first 2-3 orders manually using Ollama (qwen3.6/gemma4) — these become Sam's first training examples |
| 1.7 | Every delivered order logged in full detail in Sheets |

**🔒 LOCK CONDITION:** At least one real paid order, legal pages live, fully logged in Sheets, delivered to a real customer.

---

## PHASE 2 — Sam's Brain

**Goal:** Sam becomes a real autonomous operator with senses, memory, and a brand identity.

| # | Task |
|---|---|
| 2.1 | Build the heartbeat daemon inside FastAPI (port 8765) — multi-tier loop: every 2 min (Telegram + Sheets), every 15 min (system health), daily (content schedule), weekly (durability audit) |
| 2.2 | Build "Sam's diary" — SQLite table logging every heartbeat tick (what checked, what found, what done, success/fail) |
| 2.3 | Build the decision-to-action layer connecting Ollama's decisions to real API calls via `pipeline.config.ts` |
| 2.4 | Add Whisper (speech-to-text) — Sam can hear |
| 2.5 | Add Piper (free local TTS) — Sam can speak with its own neutral voice |
| 2.6 | Add webcam face recognition — only the owner can issue commands to Sam |
| 2.7 | Generate original Akshara mascot — illustrated character, placed on site as customer guide |
| 2.8 | Connect Sam to all social media APIs (Meta Graph, YouTube, X, Pinterest, LinkedIn) |
| 2.9 | Auto-start script — Docker, Ollama, FastAPI daemon launch on Windows boot |
| 2.10 | Email intelligence — daily Gmail digest (3 accounts) summarized by Gemini, delivered to @Akshu23bot at 8AM | ✅ DONE |

**🔒 LOCK CONDITION:** Heartbeat runs continuously from boot with zero manual start. Sam completes one full order — start to finish — triggered only by a Telegram message. **First 10 Sam-handled orders require owner approval before reaching the customer; order 11+ can be autonomous if the first 10 succeeded.**

---

## PHASE 3 — Real Dashboard

**Goal:** One screen, everything real, you can talk to Sam.

| # | Task |
|---|---|
| 3.1 | Wire every panel to live data — orders, revenue, Sam activity, system health, traffic (GA4), social media stats |
| 3.2 | Live Sam activity feed showing heartbeat ticks in real time |
| 3.3 | Voice/chat interface with Sam in dashboard, using Phase 2 senses |
| 3.4 | Approvals queue for high-impact decisions (model swaps, etc.) |

**🔒 LOCK CONDITION:** Dashboard loads under 2 seconds, zero mocked data anywhere, you can have a voice conversation with Sam from the dashboard.

---

## PHASE 4 — Traffic Engine

**Goal:** People find AksharaWorld organically.

| # | Task |
|---|---|
| 4.1 | Sam's heartbeat drives daily content schedule — Blogger SEO articles, social posting routine (07:00-23:00 across Instagram/Facebook/Threads/X) |
| 4.2 | Pinterest pins, YouTube Shorts pipeline |
| 4.3 | LinkedIn created and folded into routine |
| 4.4 | WhatsApp community outreach |
| 4.5 | Google Search Console registered |
| 4.6 | AdSense activated once content threshold met |
| 4.7 | **Expand beyond hero product** — once Resume ATS has 5-10 reviews, actively market Tier 2/3 products |

### Phase 4 Sub-Strategy: Instagram Comment-to-DM Revenue Funnel

**How it works:**
Sam creates a Reel → posts to Instagram → caption says "Comment BLUEPRINT to get the free guide" → CreatorFlow auto-DMs the Razorpay link → customer pays → Google Drive delivers the PDF → Sam logs the sale to Sheets → Telegram alert fires.

**Products for this funnel:**
- Resume ATS Mastery Guide (PDF) — ₹299 (lead magnet)
- Career Acceleration Blueprint (PDF) — ₹499
- AI Tools for Job Seekers Guide (PDF) — ₹399
These complement the ₹999 done-for-you service (content → service upsell)

**Tools used (all existing except CreatorFlow):**
- SearXNG + Brave API + Tavily → Reddit/forum research (already in stack)
- Ollama qwen3.6 + Gemini API → content writing (already in stack)
- Google Drive → PDF storage and delivery link (already in stack)
- Razorpay payment links → checkout (already in stack)
- Instagram → traffic (account exists)
- CreatorFlow free tier (500 DMs/month) → NEW, free, add to stack

**Sam's role:**
- Innovation_Scout extended: weekly Reddit scan for job-seeker pain points
- Sam drafts e-book content using Gemini/Ollama
- Sam generates Reel content daily
- Sam monitors CreatorFlow triggers and logs DM conversions to Sheets

**🔒 LOCK CONDITION:** 100+ organic visitors/month, AdSense approved, all 9 platforms (incl. LinkedIn) actively posted to by Sam. **Additionally:** At least 1 PDF product live on Razorpay, at least 1 CreatorFlow automation active on Instagram, first PDF sale logged in Sheets.

---

## PHASE 5 — Full 24/7 Autonomy

**Goal:** Business runs itself for 20 years, self-healing, self-updating safely.

| # | Task |
|---|---|
| 5.1 | Self-healing loop: sandbox testing against `BUSINESS_CONTRACT.md` (correct Razorpay links, build passes, all pages 200, GA4 present, Telegram works, Sheets webhook works) |
| 5.2 | Safe updates auto-applied with production re-check + auto-rollback; unsafe updates logged to "known incompatible" list, never retried until something else changes |
| 5.3 | High-impact changes (e.g., Sam's primary model) always require owner Telegram approval |
| 5.4 | Sam surfaces newly-discovered free tools as "candidate resources" periodically |
| 5.5 | Quarterly durability audit — free-tier limits, new model versions, flagged 90 days early |
| 5.6 | **Security hygiene** — quarterly API key/secret rotation, 2FA enforced on Razorpay, Cloudflare, GitHub, Google |
| 5.7 | **Laptop dependency tripwire** — once monthly revenue covers it, move heartbeat's time-sensitive checks (Telegram, Sheets polling) to an always-on free-tier cloud VM; heavy generation stays on laptop |

**🔒 LOCK CONDITION:** 7 consecutive days where Sam handles all orders, content, social posting, and system health independently — owner only sees Telegram messages for genuine judgment calls.

---

## Current Status Summary

| Phase | Status |
|---|---|
| 0 — Foundation | 🔒 LOCKED ✅ |
| 1 — Revenue Engine | ⬜ NEXT — starting with legal pages |
| 2 — Sam's Brain | ⬜ Not started |
| 3 — Real Dashboard | ⬜ Not started |
| 4 — Traffic Engine | ⬜ Not started |
| 5 — Full Autonomy | ⬜ Not started |

**Immediate next action:** Phase 1.1 — add Refund Policy, Terms of Service, and Privacy Policy pages to the site.

---

*This file supersedes NEW_PLAN.md. Keep this updated as phases lock — it's the answer to "what are we doing and why" for anyone (including Sam) looking at this project.*
