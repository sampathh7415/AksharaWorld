#!/bin/bash

# 📊 DETAILED DIAGNOSTICS SCRIPT
# Provides comprehensive system health information

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "🔍 AKSHARA WORLD DASHBOARD - SYSTEM DIAGNOSTICS"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

echo "📌 Environment Variables Check:"
echo "─────────────────────────────────────────────────────────────────"

echo -n "RAZORPAY_KEY_ID: "
if [ -n "$RAZORPAY_KEY_ID" ]; then echo "✅ Configured"; else echo "❌ Missing"; fi

echo -n "RAZORPAY_KEY_SECRET: "
if [ -n "$RAZORPAY_KEY_SECRET" ]; then echo "✅ Configured"; else echo "❌ Missing"; fi

echo -n "BREVO_API_KEY: "
if [ -n "$BREVO_API_KEY" ]; then echo "✅ Configured"; else echo "⚠️  Optional"; fi

echo -n "NEXT_PUBLIC_SAM_URL: "
if [ -n "$NEXT_PUBLIC_SAM_URL" ]; then echo "✅ Configured"; else echo "⚠️  Using default"; fi

echo -n "NEXT_PUBLIC_SUPABASE_URL: "
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then echo "✅ Configured"; else echo "⚠️  Optional (DB features disabled)"; fi

echo ""
echo "🏗️  Project Structure:"
echo "─────────────────────────────────────────────────────────────────"

echo -n "API Endpoints: "
if [ -d "src/app/api" ]; then
  COUNT=$(find src/app/api -name "route.ts" | wc -l)
  echo "✅ $COUNT endpoints found"
else
  echo "❌ Not found"
fi

echo -n "Library Modules: "
if [ -d "src/lib" ]; then
  COUNT=$(find src/lib -name "*.ts" | wc -l)
  echo "✅ $COUNT modules"
else
  echo "❌ Not found"
fi

echo -n "Tests: "
if [ -f "tests/api/dashboard.test.ts" ]; then
  echo "✅ Test suite found"
else
  echo "❌ Not found"
fi

echo ""
echo "📦 Dependencies:"
echo "─────────────────────────────────────────────────────────────────"

echo -n "Node modules installed: "
if [ -d "node_modules" ]; then
  COUNT=$(ls node_modules 2>/dev/null | wc -l)
  echo "✅ $COUNT packages"
else
  echo "❌ Not found (run: npm install --legacy-peer-deps)"
fi

echo ""
echo "🚀 Deployment Ready Checklist:"
echo "─────────────────────────────────────────────────────────────────"

echo -n "Build configuration: "
if [ -f "next.config.js" ] || [ -f "next.config.ts" ]; then echo "✅ Present"; else echo "⚠️  Default"; fi

echo -n "TypeScript config: "
if [ -f "tsconfig.json" ]; then echo "✅ Present"; else echo "⚠️  Default"; fi

echo -n "Environment template: "
if [ -f ".env.example" ]; then echo "✅ Present"; else echo "⚠️  Missing"; fi

echo -n "Documentation: "
if [ -f "DEPLOYMENT_CHECKLIST.md" ]; then echo "✅ Present"; else echo "⚠️  Missing"; fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "✨ Diagnostic complete!"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
