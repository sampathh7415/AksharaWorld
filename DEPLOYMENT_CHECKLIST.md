# 🚀 DEPLOYMENT CHECKLIST - Dashboard Real-Time Integration

## ✅ Pre-Deployment Verification

### Environment Configuration
- [ ] Copy `.env.example` to `.env.local`
- [ ] Add Razorpay credentials (KEY_ID, KEY_SECRET)
- [ ] Add Brevo API key and list ID
- [ ] Add Sam Brain URL (or use default)
- [ ] Add JWT auth secret
- [ ] (Optional) Add Telegram bot token for alerts
- [ ] (Optional) Add Supabase credentials for database

### Build & Test
- [ ] Run `npm install --legacy-peer-deps`
- [ ] Run `npm run build` (should complete without errors)
- [ ] Run `npm run dev` (development server starts)
- [ ] Run `npm run test` (all tests pass)

### API Endpoint Verification
- [ ] `curl http://localhost:3000/api/health` → Returns 200 with component status
- [ ] `curl http://localhost:3000/api/dashboard/real-data` → Returns complete metrics
- [ ] `curl http://localhost:3000/api/sam/health` → Returns Sam Brain status

### Dashboard UI Test
- [ ] Open http://localhost:3000/dashboard in browser
- [ ] Dashboard loads without errors
- [ ] KPI cards display (revenue, visitors, subscribers, phase)
- [ ] Transaction table shows data (if Razorpay configured)
- [ ] 10-second auto-refresh works
- [ ] "Chat with Sam" responds to messages
- [ ] Approvals queue shows pending items
- [ ] Department view displays 8 departments
- [ ] Resource inventory shows active status

### Production Readiness
- [ ] All console errors resolved
- [ ] Response time < 500ms for dashboard calls
- [ ] Caching headers properly set (10s)
- [ ] Error handling graceful (fallback values shown)
- [ ] Monitoring/alerts configured
- [ ] Database connections tested (if Supabase used)

## 🎯 Deployment Steps

### 1. Build Production
```bash
npm run build
```

### 2. Test Production Build Locally
```bash
npm start
```

### 3. Run Full Test Suite
```bash
npm run test
```

### 4. Deploy to Production
```bash
# For Vercel:
git push

# For other platforms:
npm run build
npm start
```

## ✨ Success Indicators

✅ **All working successfully when:**

1. **API Endpoints** ✓
   - `/api/health` returns healthy status
   - `/api/dashboard/real-data` returns complete metrics
   - `/api/sam` routes queries correctly
   - `/api/approve` logs decisions

2. **Dashboard Display** ✓
   - KPI cards show real business metrics
   - Transaction table populated
   - Auto-refresh every 10 seconds
   - No console errors

3. **Business Integration** ✓
   - Razorpay revenue appears on dashboard
   - Recent transactions listed
   - Visitor metrics from GA4
   - Subscriber counts from Brevo

4. **AI Features** ✓
   - Sam AI responds to queries
   - Approval queue functional
   - Decision logging works

5. **Resilience** ✓
   - Dashboard shows fallback values if API fails
   - No cascading failures
   - Graceful error messages

6. **Performance** ✓
   - Response time < 500ms
   - Caching reduces load
   - 10-second refresh cycle maintained

## 🔧 Troubleshooting

### "No transactions shown"
- Check Razorpay credentials in `.env.local`
- Verify API key has permission to read payments
- Check `/api/dashboard/real-data` response for errors

### "Sam AI not responding"
- Verify Sam Brain Cloudflare Worker URL is correct
- Check `/api/sam/health` endpoint status
- Ensure NEXT_PUBLIC_SAM_URL environment variable set

### "Build fails"
- Run `npm install --legacy-peer-deps` to reinstall
- Clear `.next` folder: `rm -rf .next`
- Retry `npm run build`

### "Tests failing"
- Ensure development server running: `npm run dev`
- Check all required environment variables set
- Review test output for specific errors

## 📞 Support

For issues, check:
1. Environment variables in `.env.local`
2. API endpoint responses via curl
3. Browser console for client-side errors
4. Server logs in development console
