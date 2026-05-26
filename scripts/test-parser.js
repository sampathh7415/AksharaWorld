const { betterBugsParser } = require('../src/services/betterbugs-parser');
const path = require('path');

async function testParser() {
  console.log('Testing BetterBugs Telemetry Parser...');
  const filePath = path.join(__dirname, '../tests/mock-betterbugs.json');
  
  const report = await betterBugsParser.parseLogFile(filePath);
  console.log('\n--- GENERATED REPORT ---');
  console.log(report);
  console.log('------------------------\n');
  
  const sampleCode = `
  async function fetchDashboard() {
    const d = await resilientFetch<any>('/api/dashboard', { timeout: 6000, retries: 2 });
    setData(d);
    if (d.capsule) setCapsule(d.capsule); // Trigger error if 'd' is undefined
  }
  `;
  
  const prompt = betterBugsParser.selfHealPrompt(report, sampleCode);
  console.log('--- SELF-HEALING PROMPT GENERATION ---');
  console.log(prompt);
  console.log('--------------------------------------\n');
  console.log('✅ Telemetry parser testing completed successfully!');
}

testParser().catch(err => {
  console.error('❌ Error executing parser test:', err);
});
