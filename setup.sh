#!/bin/bash

# Akshara World Project Setup Script
# Automatically configures both dashboards

echo "🚀 Akshara World - Complete Project Setup"
echo "========================================="
echo ""

# Install main dashboard
echo "📦 Installing Main Dashboard..."
cd g:/My\ Drive/Antigravity/dashboard
npm install
echo "✅ Main Dashboard ready!"
echo ""

# Install Akshara dashboard
echo "📦 Installing Akshara Dashboard..."
cd g:/My\ Drive/Antigravity/akshara-world-dashboard
npm install
echo "✅ Akshara Dashboard ready!"
echo ""

# Create environment files if missing
echo "⚙️ Configuring environment..."
if [ ! -f g:/My\ Drive/Antigravity/dashboard/.env.local ]; then
  cp g:/My\ Drive/Antigravity/dashboard/.env.example g:/My\ Drive/Antigravity/dashboard/.env.local
fi

if [ ! -f g:/My\ Drive/Antigravity/akshara-world-dashboard/.env.local ]; then
  cp g:/My\ Drive/Antigravity/akshara-world-dashboard/.env.example g:/My\ Drive/Antigravity/akshara-world-dashboard/.env.local
fi

echo "✅ Environment files configured!"
echo ""

echo "🎉 Setup Complete!"
echo ""
echo "Start development servers:"
echo "  Main Dashboard:    cd dashboard && npm run dev"
echo "  Akshara Dashboard: cd akshara-world-dashboard && npm run dev"
echo ""
echo "📚 Documentation: see COMPLETE_SETUP.md"
