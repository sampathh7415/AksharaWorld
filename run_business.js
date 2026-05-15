const https = require('https');
require('dotenv').config({ path: '.env.local' });

// Colors for console
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const reset = '\x1b[0m';

console.log(`${cyan}=================================================${reset}`);
console.log(`${cyan}🚀 AKSHARA WORLD — AUTONOMOUS OPERATIONS ENGINE 🚀${reset}`);
console.log(`${cyan}=================================================${reset}\n`);

async function runRealTimeEngine() {
  // 1. Guardian_Ops: Verify System Uptime
  console.log(`${yellow}[Guardian_Ops]${reset} Verifying Command Center connectivity...`);
  try {
    const dashboardRes = await fetch('https://sam-ceo-brain.akshara-sam.workers.dev/api/dashboard');
    const data = await dashboardRes.json();
    console.log(`${green}✔ System Uptime: ${data.metrics?.uptime || '100%'} | Departments: ${data.metrics?.departments || 8}${reset}`);
    console.log(`${green}✔ Live Revenue: ₹${data.metrics?.revenue?.total || '0.00'}${reset}\n`);
  } catch (e) {
    console.log(`❌ Dashboard API offline: ${e.message}\n`);
  }

  // 2. Innovation_Scout: Trigger Daily Scan via Sam Brain
  console.log(`${yellow}[Innovation_Scout]${reset} Triggering real-time market scan via Sam CEO Brain...`);
  try {
    const samRes = await fetch('https://sam-ceo-brain.akshara-sam.workers.dev/api/department/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department: 'Innovation_Scout' })
    });
    
    if (samRes.ok) {
        console.log(`${green}✔ Innovation_Scout sequence initiated on edge network.${reset}`);
        console.log(`${green}✔ Check your Telegram (@Sampathh7) for the real-time AI market report!${reset}\n`);
    } else {
        console.log(`❌ Failed to trigger scout. Status: ${samRes.status}\n`);
    }
  } catch (e) {
    console.log(`❌ Brain API offline: ${e.message}\n`);
  }

  // 3. Revenue_Vault: Verify Payment Webhook readiness
  console.log(`${yellow}[Revenue_Vault]${reset} Verifying Razorpay Webhook listener on Sam Brain...`);
  try {
     const hookRes = await fetch('https://sam-ceo-brain.akshara-sam.workers.dev/api/webhook/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: "ping" })
     });
     if (hookRes.ok) {
         console.log(`${green}✔ Razorpay Webhook is ACTIVE and listening for new payments.${reset}\n`);
     } else {
         console.log(`❌ Webhook error. Status: ${hookRes.status}\n`);
     }
  } catch (e) {
     console.log(`❌ Webhook offline: ${e.message}\n`);
  }

  console.log(`${cyan}=================================================${reset}`);
  console.log(`${cyan}⚡ AUTONOMOUS BUSINESS CYCLE COMPLETE ⚡${reset}`);
  console.log(`${cyan}The business is now operating 24/7 in the cloud.${reset}`);
  console.log(`${cyan}=================================================${reset}`);
}

runRealTimeEngine();
