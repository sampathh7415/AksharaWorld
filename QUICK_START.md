# Akshara World - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Optional: Docker for containerized deployment

---

## 📦 Installation

### Option 1: Manual Setup (Recommended)

**Windows (PowerShell)**
```powershell
# Navigate to project
cd "g:\My Drive\Antigravity"

# Run setup script
.\setup.ps1

# Wait for npm to finish installing...
# Should take 2-5 minutes depending on internet speed
```

**macOS/Linux (Bash)**
```bash
cd "g:\My Drive\Antigravity"
bash setup.sh
```

### Option 2: Docker Setup

```bash
docker-compose up -d

# Access dashboards:
# - Main Dashboard: http://localhost:3000
# - Akshara Dashboard: http://localhost:3001
```

---

## 🎯 Start Development

After setup, you can run either or both dashboards:

### Main Dashboard (Classic UI)
```bash
cd dashboard
npm run dev

# Open browser: http://localhost:3000
```

### Akshara Dashboard (Modern UI)
```bash
cd akshara-world-dashboard
npm run dev

# Open browser: http://localhost:3001
```

### Run Both Simultaneously
```bash
# Terminal 1
cd dashboard && npm run dev

# Terminal 2 (new window)
cd akshara-world-dashboard && npm run dev
```

---

## ✅ Verify Installation

Check that everything is working:

```bash
# Check main dashboard API
curl http://localhost:3000/api/health

# Check akshara dashboard API
curl http://localhost:3001/api/health

# Both should return JSON with status: "ok" or "operational"
```

---

## 🔧 Configuration

### Environment Variables

Each dashboard has a `.env.local` file pre-configured:

**Main Dashboard** (`dashboard/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SAM_BRAIN_URL=https://sam-ceo-brain.akshara-sam.workers.dev/api/sam
```

**Akshara Dashboard** (`akshara-world-dashboard/.env.local`):
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SAM_BRAIN_URL=https://sam-ceo-brain.akshara-sam.workers.dev/api/sam
```

For Phase 1+ features, add:
- Clerk authentication keys (see `.env.example`)
- Supabase connection strings

---

## 📊 What's Included

✅ **2 Fully-Functional Dashboards**
- Main Dashboard: Command center with chat
- Akshara Dashboard: Modern UI with auth

✅ **Complete API Layer**
- Health checks
- KPI endpoints
- Department management
- Approval workflows
- Sam AI chat integration

✅ **Production-Ready Configuration**
- Docker support
- GitHub Actions CI/CD
- Nginx reverse proxy
- Environment management

✅ **Documentation**
- Setup guide (this file)
- API reference
- Deployment instructions
- Phase roadmap

---

## 🚀 Deployment

### Production Build

```bash
# Build main dashboard
cd dashboard
npm run build
npm start

# Build akshara dashboard
cd akshara-world-dashboard
npm run build
npm start
```

### Cloud Deployment

**Cloudflare Pages** (Main Dashboard)
```bash
cd dashboard
npm run build
wrangler pages deploy out/
```

**Vercel** (Akshara Dashboard)
```bash
cd akshara-world-dashboard
vercel deploy --prod
```

**Docker** (Both)
```bash
docker-compose build
docker-compose up -d
```

---

## 📞 API Endpoints

### Main Dashboard
- `GET /api/health` - Service status
- `GET /api/kpi` - KPI metrics
- `GET /api/departments` - Department list
- `GET /api/approvals` - Pending approvals
- `POST /api/approvals` - Approve/reject
- `POST /api/sam` - Chat with Sam

### Akshara Dashboard
- `GET /api/health` - Service status

---

## 🆘 Troubleshooting

### "npm: command not found"
- Install Node.js from: https://nodejs.org/

### "Port 3000 already in use"
- Change port: `npm run dev -- -p 3001`

### "Dependencies not installing"
- Clear cache: `npm cache clean --force`
- Retry: `npm install --legacy-peer-deps`

### "Cannot find module"
- Reinstall: `rm -rf node_modules && npm install`

---

## 📈 Next Steps

1. ✅ **Phase 0** - Setup (COMPLETE)
2. 🚀 **Phase 1** - Start MVP departments
3. 📊 **Phase 2** - Setup revenue tracking
4. 🌍 **Phase 3** - Scale to multilingual
5. 🔒 **Phase 4** - Production hardening
6. 🤖 **Phase 5** - Full autonomy

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [API Documentation](./COMPLETE_SETUP.md)

---

**Questions?** Check the main dashboard at http://localhost:3000 or review logs in your terminal.

Happy coding! 🎉
