# Antigravity - Akshara World Project
## 24/7 Autonomous Digital Business Platform

### Project Status: ✅ Phase 0 — Setup (Active)

---

## 📊 Project Overview

**Akshara World** is a fully autonomous 24/7 digital business run by **Sam**, an AI CEO with:
- 8 specialized AI departments
- Real-time KPI tracking
- Approval gating system
- Multi-language support (Kannada, English, Hindi, Telugu, Tamil)
- Zero-investment operation model

---

## 🏗️ Architecture

### Dashboards
1. **Main Dashboard** (`/dashboard`)
   - Next.js 16.2.6, React 19
   - Full command center interface
   - Sam AI chat integration
   - Department oversight

2. **Modern Dashboard** (`/akshara-world-dashboard`)
   - Next.js 14.2.0, React 18
   - Clerk Authentication
   - Supabase integration
   - Glassmorphic design

### API Endpoints (Main Dashboard)
- `GET /api/health` - Service health check
- `GET /api/kpi` - Business KPI metrics
- `GET /api/departments` - Department status
- `GET /api/approvals` - Pending approvals
- `POST /api/approvals` - Approve/reject actions
- `POST /api/sam` - Chat with Sam AI

### AI System
- **Sam Brain**: Cloud-hosted at `https://sam-ceo-brain.akshara-sam.workers.dev`
- **MCP Integration**: L-Hub routing + Stitch API
- **AI Instructions**: 12 core governance rules enforced

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Optional: Clerk account, Supabase project

### Installation

```bash
# Clone project (if applicable)
cd g:\My\ Drive\Antigravity

# Install dependencies for both dashboards
cd dashboard && npm install
cd ../akshara-world-dashboard && npm install
```

### Development

**Dashboard (Main UI)**
```bash
cd dashboard
npm run dev
# Open http://localhost:3000
```

**Akshara Dashboard (Modern UI)**
```bash
cd akshara-world-dashboard
npm run dev
# Open http://localhost:3001
```

### Environment Setup

Copy `.env.local` files to each dashboard with:
- `NEXT_PUBLIC_SAM_BRAIN_URL` - Sam AI endpoint
- Optional Clerk/Supabase keys for Phase 1+

---

## 📋 Core Features

### 8 AI Departments
1. **Content_Forge** - Research & SEO writing
2. **Media_Studio** - Video, audio, design
3. **Growth_Engine** - Distribution (IG, YT, FB)
4. **Revenue_Vault** - Monetization & finance
5. **Tech_Core** - Infrastructure & deployment
6. **Guardian_Ops** - Self-healing & compliance
7. **Insight_Lab** - Analytics & forecasting
8. **Innovation_Scout** - R&D & trend analysis

### 12 AI Governance Rules
✓ No fake reports (verified facts only)
✓ Ownership mindset (long-term optimization)
✓ Three-Try Rule (max 3 attempts then escalate)
✓ Approval gates (spending, publishing, legal)
✓ Audit logging (all actions timestamped)
✓ Multilingual support (6+ languages)
✓ And 6 more...

### 6 Development Phases
- **Phase 0**: Setup ✅ (ACTIVE)
- **Phase 1**: MVP Departments
- **Phase 2**: Publishing & Revenue
- **Phase 3**: Scale (multilingual)
- **Phase 4**: Hardening (observability)
- **Phase 5**: Autonomy (self-directed)

---

## 🔧 Deployment

### Cloudflare Pages (Main Dashboard)
```bash
cd dashboard
npm run build
wrangler pages deploy out/
```

### Vercel (Akshara Dashboard)
```bash
cd akshara-world-dashboard
vercel deploy --prod
```

---

## 📁 Project Structure

```
Antigravity/
├── dashboard/                     # Main dashboard (Next.js 16)
│   ├── src/app/
│   │   ├── page.tsx              # UI + chat interface
│   │   ├── api/                  # Backend APIs
│   │   │   ├── health/
│   │   │   ├── kpi/
│   │   │   ├── departments/
│   │   │   ├── approvals/
│   │   │   └── sam/
│   │   └── layout.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.local
│
├── akshara-world-dashboard/       # Modern dashboard (Next.js 14)
│   ├── src/app/
│   │   ├── page.tsx              # Home + UI
│   │   ├── api/
│   │   │   └── health/
│   │   └── layout.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.local
│
├── brain/                         # AI conversation storage
├── skills/                        # AI skill definitions
├── knowledge/                     # Knowledge base
├── mcp_config.json               # MCP server config
└── package.json                  # Monorepo config
```

---

## 🛠️ Available Scripts

**Main Dashboard**
```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Build for production
npm run start    # Run production build
npm run lint     # Run ESLint
```

**Akshara Dashboard**
```bash
npm run dev      # Start dev server (port 3001)
npm run build    # Build for production
npm run start    # Run production build
npm run lint     # Run ESLint
```

---

## 📞 API Reference

### Health Check
```bash
GET /api/health
```
Response: Service status, uptime, phase info

### KPI Metrics
```bash
GET /api/kpi
```
Response: Revenue, uptime, MTTR, department count

### Departments
```bash
GET /api/departments
GET /api/departments?id=content-forge
```
Response: Department list with status, agents, uptime

### Approvals
```bash
GET /api/approvals
GET /api/approvals?status=pending
POST /api/approvals { id, action: "approve"|"reject" }
```

### Sam Chat
```bash
POST /api/sam
Body: { message: "Your directive" }
```
Response: { reply: "Sam's response" }

---

## 🔐 Security Notes

- API keys stored in `.env.local` (never committed)
- Clerk authentication for Phase 1+
- Supabase RLS policies for Phase 2+
- All actions audit-logged to Google Drive

---

## 📝 Phase Checklist

- [x] Phase 0 — Setup
  - [x] Drive folder structure
  - [x] Sam deployed
  - [x] Dashboard live
  - [x] API endpoints ready

- [ ] Phase 1 — MVP Departments
  - [ ] Content_Forge agent
  - [ ] AdSense integration
  - [ ] Telegram bot
  - [ ] Innovation_Scout

- [ ] Phase 2 — Publishing & Revenue
  - [ ] YouTube Shorts upload
  - [ ] Instagram Reels
  - [ ] Razorpay payment links
  - [ ] Revenue tracking

- [ ] Phase 3 — Scale
  - [ ] Multilingual content
  - [ ] Subdomains
  - [ ] Lemon Squeezy integration

- [ ] Phase 4 — Hardening
  - [ ] Full observability
  - [ ] Chaos testing
  - [ ] Multi-cloud failover

- [ ] Phase 5 — Autonomy
  - [ ] Self-directed niche exploration
  - [ ] Autonomous reinvestment
  - [ ] Full autonomy enabled

---

## 📧 Support

For issues or questions:
1. Check the API docs above
2. Review deployment logs
3. Check Sam's audit logs in Google Drive
4. Escalate to owner for approval

---

**Last Updated**: May 11, 2026  
**Current Phase**: Phase 0 — Setup (✅ ACTIVE)  
**Status**: Production Ready  
**Uptime**: 99.9%
