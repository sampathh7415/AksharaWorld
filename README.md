# 🌟 Akshara World – Command Center

**The 24/7 Autonomous Digital Business Dashboard**

Akshara World is an enterprise-grade autonomous business platform powered by **Sam (AI CEO)**. This repository contains the unified dashboard for real-time operations, KPI tracking, and department management.

## 🚀 Key Features

- ✅ **Unified Command Center**: Real-time business monitoring and control.
- ✅ **Sam AI Integration**: Resilient AI CEO connection with automatic Gemini fallback.
- ✅ **Solid-State Architecture**: 3-retry exponential backoff and circuit breaker patterns.
- ✅ **Professional Lite Mode**: Sleek, high-performance light interface.
- ✅ **8 AI Departments**: Tech_Core, Innovation_Scout, Revenue_Vault, Growth_Engine, Content_Forge, Media_Studio, Guardian_Ops, Insight_Lab.

## 📂 Project Structure

```text
akshara-dashboard/
├── src/app/          # Next.js 16 Unified Dashboard (Root)
│   ├── api/          # Consolidated API Layer (Sam, Data, Approvals)
│   ├── internal/     # Management Dashboard UI
│   └── public/       # Public-facing routes (Blog, Products)
├── sam-brain/        # Cloudflare Worker (AI Brain)
├── docs/             # Technical Documentation & Setup Guides
├── scripts/          # Automation & Maintenance Scripts
├── public/           # Static Assets
└── next.config.ts    # Production Optimization Config
```

## ⚡ Quick Start

1. **Install Dependencies**:
   ```powershell
   npm install --legacy-peer-deps
   ```

2. **Run Development Server**:
   ```powershell
   npm run dev
   ```
   Access at: [http://localhost:3000](http://localhost:3000)

3. **Production Build**:
   ```powershell
   npm run build
   ```

## 📋 Documentation

For detailed guides, please refer to the `docs/` directory:
- [System Status](docs/SYSTEM_STATUS.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Technical Implementation](docs/TECHNICAL_IMPLEMENTATION.md)

---

**Status**: ✅ Production Ready  
**AI CEO**: Sam  
**Version**: 2.0.0 (Consolidated)
