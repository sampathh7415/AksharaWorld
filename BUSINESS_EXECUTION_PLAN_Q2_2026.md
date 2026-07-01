# 🎯 AksharaWorld Business Execution Plan - Q2 2026
## Complete Real-Time Business Automation & Revenue Operations

**Created**: June 2026  
**Status**: 🟢 ACTIVE EXECUTION  
**Owner**: Sam (AI CEO) + Sampath (Human Operator)  
**Business Model**: AI-First Local Business Operating System  

---

## 📋 EXECUTIVE SUMMARY

### Current Situation
- ✅ **Phase 0 (Foundation)**: LOCKED — Domain, DNS, Razorpay, Ollama, Telegram, GA4, all verified LIVE
- ⏳ **Phase 1 (Revenue Engine)**: NEXT — Legal compliance + first paid order + delivery automation
- 📊 **Pending Process**: Real-time dashboard integration, Sam heartbeat automation, business decision autonomy

### Immediate Priority (Next 7 Days)
1. **Legal Pages** (Phase 1.1) — Terms of Service, Privacy Policy, Refund Policy
2. **Storefront Audit** (Phase 1.2) — Verify payment flow end-to-end
3. **First Order Delivery** (Phase 1.6) — Manual Resume ATS service using Ollama
4. **Sheets Logging** (Phase 1.7) — Full audit trail of transaction + delivery

### Revenue Target
- **Phase 1 Goal**: ₹1+ earned, delivered, logged, compliant
- **Phase 2 Goal**: Sam autonomous operator (₹50-70k/month personal business)
- **Phase 3 Goal**: Sam as product (₹1.3M/month SaaS)

---

## 🏗️ SYSTEM ARCHITECTURE

### 5-Layer Stack (Currently Deployed)

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 5: INTEGRATIONS (6 Connected)                   │
│  • Razorpay (payments)  • Telegram (nerve system)      │
│  • Google Sheets (ops)  • Ollama (brain)               │
│  • Firebase (storage)   • Google Analytics 4 (traffic) │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  LAYER 4: MULTI-DEVICE SYNC                            │
│  • Next.js Dashboard (laptop)                           │
│  • Electron Desktop (Mac/Linux/Windows)                │
│  • React Native Mobile (iOS/Android) — PENDING         │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  LAYER 3: OFFLINE-FIRST SYNC                           │
│  • CRDT-based sync (works offline)                     │
│  • Auto-sync when online                               │
│  • Conflict resolution                                 │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  LAYER 2: MEMORY (Conversation + Decisions)            │
│  • SQLite (local persistence)                          │
│  • agentmemory (persistent agent memory)               │
│  • Session replay capability                           │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  LAYER 1: BRAIN (Local AI Models)                      │
│  • Ollama: qwen3.6 | gemma4 | llama3                  │
│  • Runs locally, NO cloud dependency                   │
│  • http://localhost:11434/v1 (API endpoint)            │
└─────────────────────────────────────────────────────────┘
```

### Current Deployment Status

| Component | Status | Endpoint | Test |
|-----------|--------|----------|------|
| **Razorpay** | ✅ LIVE | /payments | Webhooks verified |
| **Ollama** | ✅ LIVE | localhost:11434/v1 | 5 models running |
| **Telegram Bot** | ✅ LIVE | @Akshu23bot | Tested 6/1 |
| **Google Sheets** | ✅ LIVE | webhook | JSON ingestion verified |
| **GA4** | ✅ LIVE | G-QZ4L9XW64F | Events tracked |
| **Dashboard** | ✅ BUILD COMPLETE | http://localhost:3000/dashboard | Needs DB layer |
| **Sam Brain** | ✅ WORKER | Cloudflare Worker | Decision routing ready |

---

## 📊 REVENUE PIPELINE (Q2 2026)

### Current Products (14 Total)

#### Tier 1: Lead Magnets (₹200-500)
1. ✅ Resume ATS Mastery Guide (PDF) — ₹299
2. ✅ Career Acceleration Blueprint (PDF) — ₹499
3. ✅ AI Tools for Job Seekers (PDF) — ₹399

#### Tier 2: Core Products (₹999-4,999)
4. ✅ **Resume ATS Optimization** (Done-for-You) — ₹999 ⭐ HERO PRODUCT
5. ✅ LinkedIn Profile Optimization — ₹1,499
6. ✅ Interview Prep Bundle — ₹2,999
7. ✅ Career Transition Strategy — ₹3,499

#### Tier 3: Premium Services (₹5,000+)
8. ✅ Full Career Coaching (3 months) — ₹9,999
9. ✅ Executive Resume + LinkedIn — ₹7,999
10. ✅ Job Search Acceleration (4 weeks) — ₹5,999

#### Tier 4: Digital Products & Affiliate
11. ✅ Google Merchant Center — Commission-based
12. ✅ Affiliate Commissions — 5-25% varies
13. ✅ Google AdSense (Blogger) — CPM-based
14. ✅ Premium Content Access — ₹499/month

### Revenue Model (Phase 1)

| Channel | Monthly Target | Status | Automation |
|---------|---|---|---|
| **Resume ATS Service** (Hero) | ₹15-20k | ⏳ Launching Phase 1 | Ollama-driven |
| **Google AdSense** | ₹15-30k | ⏳ Phase 4 (content driven) | Auto-posting |
| **Affiliate Commissions** | ₹5-15k | ⏳ Phase 4 | Recommendation engine |
| **Premium Content** | ₹10k | ⏳ Phase 4 | Drive access controls |
| **Merchant Center** | ₹5-10k | ⏳ Phase 4 | Product sync |
| **TOTAL PHASE 1** | **₹50-70k/mo** | Next 4 weeks |  |

---

## 🚀 PHASE 1 EXECUTION PLAN (CURRENT - Next 4 Weeks)

### Phase 1.1: Legal Compliance ⚠️ BLOCKING
**Timeline**: Days 1-2 | **Owner**: Sampath + Claude  
**Impact**: Must complete before processing ANY payments

#### Tasks:
1. ✅ Create `/pages/legal/refund-policy.tsx`
   - 30-day unconditional refund for all services
   - Instant payment reversal via Razorpay API
   - No questions asked, automatic Sheets logging

2. ✅ Create `/pages/legal/terms-of-service.tsx`
   - Usage terms for all 14 products
   - Intellectual property (delivered PDFs are customer's)
   - Service SLA (delivery within 24 hours)
   - Limitation of liability

3. ✅ Create `/pages/legal/privacy-policy.tsx`
   - Data collection: email, name, resume (Resume ATS service)
   - Storage: Google Drive (master copy), Sheets (metadata)
   - No third-party sharing (except Razorpay, Telegram for notifications)
   - Deletion: on-demand within 7 days

#### Verification:
```
- Razorpay compliance: Refund + Terms + Privacy live ✅
- Legal review: Basic compliance check ✅
- Deployment: Legal pages 200 OK ✅
```

### Phase 1.2: Storefront Audit
**Timeline**: Days 2-3 | **Owner**: Sampath (manual testing)

#### Test Scenarios:
1. **Happy Path**: Customer → Product → Payment → Delivery
   - Browse aksharaworld.in
   - Click "Resume ATS Optimization (₹999)"
   - Fill form (name, email, resume URL/upload)
   - Redirect to Razorpay checkout
   - Pay ₹999
   - Webhook fires: payment.captured
   - Telegram alert sent to @Akshu23bot
   - Sheets row added: [timestamp, name, email, product, amount, status=PAID]
   - Thank-you page shown
   - Delivery process initiated (manual for Phase 1)

2. **Refund Path**: Customer requests refund
   - Email: support@aksharaworld.in → Sheets
   - Manual Razorpay refund: `RAZORPAY_KEY_SECRET`
   - Telegram notification: "Refund processed: ₹999"
   - Sheets updated: status=REFUNDED

#### Gaps to Fix:
- [ ] Order intake form (name, email, resume/CV field)
- [ ] Thank-you page after payment
- [ ] Delivery confirmation email
- [ ] Support email address (support@aksharaworld.in)

### Phase 1.3: Gap Fixes
**Timeline**: Days 3-4 | **Owner**: Sampath

#### Deliverables:
1. Create `/pages/checkout.tsx` — Order intake form
2. Create `/pages/thank-you.tsx` — Post-payment confirmation
3. Create `/api/orders/submit` — Save form → Sheets
4. Update `.env.local` — Support email routing
5. Create email template — Delivery confirmation

### Phase 1.4: Hero Product Soft-Launch Focus
**Timeline**: Day 5 | **Owner**: Sam (content) + Sampath (social)

#### Launch Sequence:
1. **Social Announcement** (5 posts across 5 platforms)
   - Instagram: "Your resume needs AI. Here's why 🤖 [Link]"
   - Facebook: Career-focused post + resume pain points
   - X: Thread: 5 tweets on ATS rejection rates
   - Threads: Mirror X thread
   - Pinterest: Resume improvement pins + link
   - Format: Drive → agentmemory → auto-generated

2. **WhatsApp Personal Network**
   - Direct message 50+ personal contacts
   - Template: "Hey! I've built an ATS-optimized resume service (₹999). Let me know if interested. Link: [aksharaworld.in]"

3. **Hero Product Page Highlight**
   - Feature "Resume ATS Optimization" prominently on homepage
   - Other 13 products remain live but deprioritized

### Phase 1.5: First 2-3 Manual Deliveries
**Timeline**: Days 6-28 (continuous) | **Owner**: Sampath (manual) + Ollama (semi-auto)

#### Resume ATS Optimization Process (Manual):
1. **Customer Order**: Pays ₹999 → Sheets logged
2. **Receive Resume**: Email or Drive link
3. **Ollama Analysis** (using qwen3.6):
   - Input: "Analyze this resume for ATS compatibility. List 10 key improvements."
   - Parse response: Keyword gaps, formatting issues, hidden sections
4. **Manual Enhancement**:
   - Rewrite summary with detected keywords
   - Reorganize sections for ATS parsing
   - Add hidden keywords naturally
5. **Deliver**: PDF in email within 24 hours
6. **Sheets**: Log time-to-delivery, customer feedback

#### Expected Results:
- 2-3 orders = first training data for Sam
- Feedback loop: what worked, what didn't
- Refinement: Ollama prompt tuning

### Phase 1.6: Complete Sheets Logging
**Timeline**: Days 1-28 (ongoing) | **Owner**: Sam (automation)

#### Required Columns in Google Sheets:
```
| Timestamp | Name | Email | Product | Amount | Status | Delivered_At | Feedback | Notes |
|-----------|------|-------|---------|--------|--------|--------------|----------|-------|
| 6/1/26 10:30 | Raj | raj@email.com | Resume ATS | ₹999 | PAID | 6/1/26 18:30 | 4.5⭐ | Excellent results |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |
```

**Key Metrics Tracked**:
- Conversion: Views → Orders
- Delivery time: Order → Completion
- Customer satisfaction: Feedback score
- Revenue: Total earned this phase
- Refunds: $ + reason

### Phase 1 Lock Condition ✅
```
WHEN:
  - Legal pages live + 200 OK ✅
  - ≥ 1 real paid order received ✅
  - Service delivered to real customer ✅
  - Refund available and tested ✅
  - Full Sheets audit trail ✅

THEN:
  - Phase 1 LOCKED ✅
  - Proceed to Phase 2 (Sam's Brain)
```

---

## 🧠 PHASE 2: SAM'S BRAIN (Weeks 5-8)

### Goal: Sam Becomes Autonomous Operator

#### 2.1: Heartbeat Daemon (FastAPI Port 8765)
**What**: Multi-tier loop running 24/7
```python
# Heartbeat rhythm:
- Every 2 minutes:  Check Telegram + Sheets for new orders
- Every 15 minutes: System health report
- Every 1 hour:     Content schedule execution
- Every 1 day:      Durability audit
- Every 1 week:     Free-tier limits check
```

#### 2.2: Sam's Diary (SQLite)
**What**: Complete audit trail of every heartbeat decision
```sql
CREATE TABLE sam_diary (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP,
  tick_type TEXT ('telegram_check', 'order_process', 'content_post', etc),
  what_checked TEXT,
  what_found TEXT,
  what_done TEXT,
  success BOOLEAN,
  error_message TEXT,
  details JSON
);
```

#### 2.3: Decision-to-Action Layer
**What**: Ollama decision → Real API calls
- Resume received → Ollama analysis → PDF generated → Email sent
- Negative feedback → Auto-refund via Razorpay API
- High volume detected → Scale to another model

#### 2.4: Sensory Input
- **Whisper** (OpenAI, free local): Sam hears customer voicemail
- **Piper** (local TTS): Sam speaks with neutral voice
- **Webcam Face Recognition**: Only owner can command Sam

#### 2.5: Content Autonomy
- Generate daily Blogger posts (SEO)
- Auto-schedule social media (Instagram, X, etc)
- Monitor Reddit for trending topics
- Create original images/graphics

#### 2.6: Social API Integration
- Meta Graph API (Instagram, Facebook)
- YouTube API (Shorts scheduling)
- X (Twitter) API
- Pinterest API
- LinkedIn API

---

## 📊 PHASE 3: REAL DASHBOARD (Weeks 9-12)

### Goal: One screen, everything real, talk to Sam

#### 3.1: Live Data Wiring
- ✅ Razorpay: Revenue metrics (total, today, month)
- ✅ GA4: Visitor counts, conversion rates
- ✅ Brevo: Subscriber count
- ✅ Sheets: Recent orders, delivery status
- ✅ Sam: Activity feed in real-time

#### 3.2: Live Sam Activity Feed
```
6/15 14:23 — Processed order #5: Resume ATS delivery (24min)
6/15 14:20 — Posted to Instagram Reels (engagement: +12 likes)
6/15 14:15 — System health check: ALL GREEN ✅
6/15 14:10 — Refined Ollama prompt for resume analysis
```

#### 3.3: Voice/Chat with Sam
- Dashboard mic button → Whisper → Ollama → Piper → Dashboard speaker
- Sam: "Hello! I see you have 3 pending orders. Shall I prioritize Resume ATS today?"

#### 3.4: Approvals Queue
- High-impact decisions need owner approval
- Example: Swap primary model from qwen to llama
- Owner approves via Telegram button or dashboard

---

## 🌐 PHASE 4: TRAFFIC ENGINE (Weeks 13-16)

### Goal: People find AksharaWorld organically

#### 4.1: Content Calendar (Sam-driven)
- Daily Blogger post (SEO articles)
- 5× social media posts (7am-11pm staggered)
- 2× Pinterest pins weekly
- 1× YouTube Short weekly

#### 4.2: Reddit Intelligence
- Track r/careerguidance, r/jobsearch, r/Resume
- Sam identifies pain points
- Sam creates solutions (PDFs, guides)
- Sam posts (only when relevant, never spam)

#### 4.3: Funnel: Instagram Comment → DM → Payment
- Sam posts Reels
- Caption: "Comment BLUEPRINT to get the free guide"
- CreatorFlow auto-DMs Razorpay link
- Customer pays → Drive delivers PDF

#### 4.4: SEO & Discovery
- Google Search Console registered
- Blogger posts optimized (keywords from Tavily API)
- Schema markup for local business
- AdSense enabled once content threshold met

---

## 💰 RESOURCE ALLOCATION & TOOLING

### Free Tier Stack (₹0/month)
- **Hosting**: Cloudflare Pages + Workers (free tier)
- **AI Models**: Ollama local + Gemini API (free tier)
- **Database**: SQLite local + Google Sheets (free)
- **Analytics**: Google Analytics 4 (free)
- **Email**: Gmail (free)
- **Payment**: Razorpay (1.2% + ₹0 setup)
- **Messaging**: Telegram Bot (free)
- **Storage**: Google Drive (15GB free)
- **Content Delivery**: Blogger (free)

### Paid Tiers (Only if Revenue Covers)
- **Vercel** ($20/mo): Only if Cloudflare Pages insufficient
- **Supabase** ($25/mo): Only if Sheets webhook insufficient
- **Brevo/SendGrid** ($20/mo): Only if volume > 1000/day emails

### Current Infrastructure Cost
```
Monthly: ₹0 (all free tier)
Quarterly: ₹0
Annual: ₹0
```

---

## 🎯 KEY METRICS & SUCCESS INDICATORS

### Phase 1 Metrics (Revenue Engine)
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Real paid orders | ≥ 1 | 0 | ⏳ Week 1 |
| Legal pages live | 3/3 | 0/3 | ⏳ Day 2 |
| Delivery time | < 24 hrs | N/A | ⏳ Week 2 |
| Customer satisfaction | ≥ 4.0★ | N/A | ⏳ Week 2 |
| Sheets audit trail | 100% logged | 0% | ⏳ Week 1 |
| Refund tested | ✅ working | Not tested | ⏳ Week 3 |
| **PHASE 1 LOCKED** | **6 metrics** | **0/6** | **6-7 days** |

### Phase 2 Metrics (Sam's Brain)
| Metric | Target | Status |
|--------|--------|--------|
| Heartbeat uptime | 99.9% | TBD |
| Auto-processed orders | 100% | TBD |
| Sam diary completeness | 100% | TBD |
| Error recovery rate | ≥ 95% | TBD |
| Decision quality | Sam > manual | TBD |

### Revenue Tracking
```
Week 1: First order → ₹999
Week 2-3: 2-5 orders → ₹2-5k
Week 4: Scaling begins → ₹5-10k
Month 2: Consistent → ₹15-20k/month
```

---

## 🛠️ TECHNICAL IMPLEMENTATION ROADMAP

### Week 1 (June 1-7): Legal + Audit
```bash
Day 1: Create legal pages (/pages/legal/*)
Day 2: Storefront audit (manual testing)
Day 3: Gap fixes (forms, thank-you page)
Day 4-7: Soft-launch + monitoring
```

### Week 2-3 (June 8-21): First Deliveries
```bash
Day 8: Ready to accept first order
Day 9-14: Manual Resume ATS deliveries (2-3)
Day 14-21: Gather feedback + refine Ollama prompts
```

### Week 4 (June 22-28): Phase 1 Lock + Phase 2 Planning
```bash
Day 22-25: Complete Phase 1 checklist
Day 25: Phase 1 LOCKED ✅
Day 26-28: Begin Phase 2 architecture (Heartbeat daemon)
```

---

## 📞 BUSINESS DECISION AUTHORITY MATRIX

| Decision Type | Authority | Approval Path | Telegram Alert |
|---|---|---|---|
| **New order processing** | Sam (automated) | ≤ ₹10k: auto-approve | YES |
| **Refund > ₹5k** | Sampath (manual) | Review within 24h | YES |
| **Model swap** | Sampath (explicit) | Telegram approval | YES |
| **Price change** | Sampath (explicit) | Telegram approval + 48h notice | YES |
| **New product launch** | Sampath (explicit) | Must clear Phase X | YES |
| **System downtime** | Sam (auto-recovery) | Retry 3×, then alert | YES |
| **Negative feedback** | Sam (escalate) | Telegram to owner | YES |

---

## 🚨 RISK MITIGATION

### Critical Risks & Contingencies

| Risk | Impact | Mitigation | Trigger |
|------|--------|-----------|---------|
| **Razorpay key exposed** | CRITICAL | Auto-rotate weekly, 2FA | Every Monday |
| **Ollama model fails** | HIGH | Fall back to Gemini API | Timeout > 5s |
| **Customer refund abuse** | MEDIUM | Log all refunds, flag patterns | > 3 refunds/day |
| **Resume delivery error** | MEDIUM | Auto-retry, manual review | Delivery fails |
| **Telegram bot offline** | HIGH | Health check every 5 min | Bot unreachable |
| **Drive quota exceeded** | MEDIUM | Archive old files weekly | > 10GB used |
| **Sheets API rate limit** | LOW | Queue + batch operations | > 100 requests/min |

---

## 📍 EXECUTION CHECKLIST - NEXT 7 DAYS

### ✅ Monday (June 3)
- [ ] Create legal pages (Refund, ToS, Privacy)
- [ ] Deploy legal pages to production
- [ ] Verify pages 200 OK
- [ ] Git commit: "Phase 1.1: Legal compliance pages added"

### ✅ Tuesday (June 4)
- [ ] Manual storefront audit (payment flow)
- [ ] Test Razorpay webhook
- [ ] Verify Telegram alert
- [ ] Check Sheets logging

### ✅ Wednesday (June 5)
- [ ] Fix any gaps from audit
- [ ] Deploy checkout form
- [ ] Deploy thank-you page
- [ ] Deploy support email routing

### ✅ Thursday (June 6)
- [ ] Social media soft-launch posts (5 platforms)
- [ ] Share WhatsApp personal network
- [ ] Monitor for incoming traffic

### ✅ Friday-Sunday (June 7-9)
- [ ] Await first order
- [ ] Manual delivery using Ollama
- [ ] Gather customer feedback
- [ ] Refine process

---

## 🎓 LEARNING & FEEDBACK LOOPS

### Weekly Standups (Every Friday 6pm)
- Revenue this week
- Orders processed
- Customer feedback summary
- Blockers and solutions
- Next week priorities

### Post-Delivery Review
- Delivery time: Actual vs target
- Customer satisfaction: Feedback score
- Ollama quality: Did model deliver?
- Process improvements: What to refine

### Monthly Metrics Review
- Revenue: Total, per-channel, per-product
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- Refund rate
- System uptime
- Sam's autonomy score

---

## 🎯 SUCCESS DEFINITION

### Phase 1 Success (4 Weeks)
✅ **"First real ₹1 earned legally, delivered properly, and fully logged"**
- Legal pages live
- First paid customer delighted
- Process repeatable
- Sheets audit trail complete
- Zero compliance issues

### By End of Q2 2026
✅ **"₹15-20k/month from Resume ATS service, Sam running 80% autonomously"**
- Phase 1: LOCKED ✅
- Phase 2: 70% complete
- Real revenue flowing
- Customer testimonials collected
- Refund rate < 5%

### By End of Q3 2026
✅ **"Business runs itself 95% autonomously, ₹50-70k/month achieved"**
- Phase 2: LOCKED ✅
- Phase 3: Dashboard 100% real data
- 4 revenue channels active
- Sam making business decisions
- Owner seeing only strategic decisions

---

## 📝 APPENDIX: RESOURCE LINKS

### Live Services Status
- **Razorpay**: [Payment Links](https://dashboard.razorpay.com/app/payment-links)
- **Ollama**: http://localhost:11434/v1
- **Telegram Bot**: @Akshu23bot
- **Google Analytics**: GA-QZ4L9XW64F
- **Dashboard**: http://localhost:3000/dashboard
- **GitHub**: https://github.com/sampathh7415/AksharaWorld

### Key Configuration Files
- `.env.local` — API keys (never commit)
- `package.json` — Build scripts
- `docker-compose.yml` — Local development
- `wrangler.json` — Cloudflare Workers config
- `compose.yaml` — Additional services

### Documentation
- ROADMAP.md — Phase definitions
- DEPLOYMENT_COMPLETE.md — Dashboard status
- DASHBOARD_REAL_TIME_INTEGRATION_PLAN.md — Technical details

---

## ✨ Final Notes

This is the **single source of truth** for all business operations during Q2 2026. Every decision, every feature, every resource allocation flows through this plan. It's tracked, it's testable, it's executable.

**Status**: 🟢 **READY TO EXECUTE**  
**Next Action**: Begin Phase 1.1 (Legal pages) TODAY  
**Owner**: Sam (AI) + Sampath (Human)  
**Timeline**: 4 weeks to Phase 1 lock, 8 weeks to Phase 2 lock

---

*Document Version: 4.0*  
*Last Updated: June 1, 2026*  
*Maintained By: Sam AI CEO / Sampath (Human Operator)*  
*Repository: github.com/sampathh7415/AksharaWorld*

