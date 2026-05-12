#!/bin/bash

# Akshara World - Real-Time Business Operations Bootstrap
# Start all systems and begin autonomous operations

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║      🚀 AKSHARA WORLD - REAL-TIME OPERATIONS LAUNCHER 🚀   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

BASE_DIR="g:\My Drive\Antigravity"

# Start main dashboard
echo "🚀 Starting Main Dashboard (Port 3000)..."
cd "$BASE_DIR/dashboard"
npm run dev &
MAIN_PID=$!
echo "✅ Main Dashboard started (PID: $MAIN_PID)"
echo ""

# Wait a moment
sleep 3

# Start Akshara dashboard
echo "🚀 Starting Akshara Dashboard (Port 3001)..."
cd "$BASE_DIR/akshara-world-dashboard"
npm run dev &
AKSHARA_PID=$!
echo "✅ Akshara Dashboard started (PID: $AKSHARA_PID)"
echo ""

# Wait for dashboards to boot
sleep 5

echo "═".repeat(60)
echo ""
echo "✨ ALL SYSTEMS OPERATIONAL"
echo ""
echo "📊 Dashboard URLs:"
echo "  • Main Dashboard:    http://localhost:3000"
echo "  • Akshara Dashboard: http://localhost:3001"
echo "  • Business Control:  http://localhost:3000/business-control"
echo ""
echo "🎯 Next Steps:"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Navigate to /business-control"
echo "  3. Click 'Start Business Now' to begin operations"
echo "  4. Watch real-time metrics update"
echo ""
echo "═".repeat(60)
echo ""
echo "🤖 Ready to launch! Awaiting your command..."
echo ""

# Keep running
wait $MAIN_PID $AKSHARA_PID
