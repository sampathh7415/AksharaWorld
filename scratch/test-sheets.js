// scratch/test-sheets.js
const fs = require('fs');
const path = require('path');

// Manually load env vars from .env.local if dotenv not loaded yet
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

const { SheetsDb } = require('../src/lib/google/sheetsDb');

async function test() {
  console.log('Testing SheetsDb connection...');
  console.log('Webhook URL:', process.env.APPS_SCRIPT_WEBHOOK_URL);
  
  try {
    const log = await SheetsDb.addSystemLog({
      department: 'Tech_Core',
      message: 'Test system log from local Antigravity audit run',
      status: 'info'
    });
    console.log('✅ Success! Logs posted:', log);
  } catch (e) {
    console.error('❌ Failed to post log:', e);
  }
}

test();
