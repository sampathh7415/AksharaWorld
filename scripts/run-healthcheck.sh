#!/usr/bin/env bash

# 🛰️ AKSHARA WORLD — SANDBOX INTEGRATION HEALTHCHECK & AUTOMATION RUNNER
# 📁 scripts/run-healthcheck.sh

echo "===================================================================="
echo "⚡ Enterprise Local Sandbox Master Healthcheck & Debug Loop"
echo "===================================================================="

# Check for special BetterBugs parsing argument
if [ "$1" == "--betterbugs" ] && [ -n "$2" ]; then
  echo "🪲 Ingesting BetterBugs Session telemetry from: $2"
  if [ -f "$2" ]; then
    node -e "
      const { betterBugsParser } = require('./src/services/betterbugs-parser');
      betterBugsParser.parseLogFile('$2').then(report => {
        console.log(report);
        const sample = 'Uncaught TypeError at fetchDashboard()';
        console.log(betterBugsParser.selfHealPrompt(report, sample));
      });
    "
    exit 0
  else
    echo "🚨 Error: Telemetry log file not found at: $2"
    exit 1
  fi
fi

# Step 1: Spin up Floci Docker Cloud emulation layer
echo "🚀 Booting Floci S3 Cloud Emulation Container..."
docker compose -f compose.yaml up -d floci

if [ $? -ne 0 ]; then
  echo "⚠️ Failed to boot Floci container. Checking if Docker Daemon is running..."
  docker ps >/dev/null 2>&1
  if [ $? -ne 0 ]; then
    echo "🚨 Docker daemon is unreachable. Please start Docker on your host."
  fi
else
  echo "✅ Floci Docker Cloud emulator is operational on port 4566."
fi

# Step 2: Check & Install Playwright browser dependencies
echo "🎭 Initializing Playwright browser components..."
npx playwright install chromium --with-deps

if [ $? -ne 0 ]; then
  echo "⚠️ Playwright browser dependencies installation encountered warnings."
fi

# Step 3: Execute Playwright E2E automated test suite
echo "🧪 Running Playwright E2E Automated Test Suites..."
npm run test:e2e

TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "===================================================================="
  echo "✅ E2E Sandbox Verification: ALL TESTS PASSED SUCCESSFULLY!"
  echo "===================================================================="
  exit 0
else
  echo "===================================================================="
  echo "🚨 E2E Sandbox Verification: TEST SUITE FAILED!"
  echo "===================================================================="
  echo "Piping standard error logs to context window for self-healing..."
  
  if [ -d "./test-results" ]; then
    echo "🔍 Failed Test Trace Snapshots:"
    ls -la ./test-results/
  fi
  
  # Auto-check if there's any mock BetterBugs payload to diagnose
  if [ -f "./tests/mock-betterbugs.json" ]; then
    echo "🪲 BetterBugs Telemetry Diagnostic Auto-Parser Output:"
    node -e "
      const { betterBugsParser } = require('./src/services/betterbugs-parser');
      betterBugsParser.parseLogFile('./tests/mock-betterbugs.json').then(report => {
        console.log(report);
      });
    "
  fi
  
  exit $TEST_EXIT_CODE
fi
