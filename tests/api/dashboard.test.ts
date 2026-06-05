/**
 * 🧪 DASHBOARD API TESTS
 * Comprehensive test suite for all dashboard endpoints
 */

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

const results: TestResult[] = [];

/**
 * TEST: Health Check Endpoint
 */
async function testHealthCheck() {
  const start = Date.now();
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (response.status !== 200) throw new Error(`Status ${response.status}`);
    
    const data = await response.json();
    if (!data.status || !data.components) throw new Error('Invalid response structure');
    
    results.push({
      name: '✅ /api/health - System health check',
      passed: true,
      duration: Date.now() - start,
    });
  } catch (err: any) {
    results.push({
      name: '❌ /api/health - System health check',
      passed: false,
      duration: Date.now() - start,
      error: err.message,
    });
  }
}

/**
 * TEST: Real Data Aggregation
 */
async function testRealDataEndpoint() {
  const start = Date.now();
  try {
    const response = await fetch(`${BASE_URL}/api/dashboard/real-data`);
    if (response.status !== 200) throw new Error(`Status ${response.status}`);
    
    const data = await response.json();
    if (!data.metrics || !data.sources) throw new Error('Invalid response structure');
    if (data.status !== 'complete') throw new Error('Status not complete');
    
    // Validate metrics structure
    const { revenue, traffic, recentTransactions } = data.metrics;
    if (!revenue || !traffic) throw new Error('Missing core metrics');
    
    results.push({
      name: '✅ /api/dashboard/real-data - Business metrics aggregation',
      passed: true,
      duration: Date.now() - start,
    });
  } catch (err: any) {
    results.push({
      name: '❌ /api/dashboard/real-data - Business metrics aggregation',
      passed: false,
      duration: Date.now() - start,
      error: err.message,
    });
  }
}

/**
 * TEST: Sam Brain Health
 */
async function testSamBrainHealth() {
  const start = Date.now();
  try {
    const response = await fetch(`${BASE_URL}/api/sam/health`);
    // 503 is acceptable - means worker is offline but endpoint works
    if (response.status !== 200 && response.status !== 503) {
      throw new Error(`Unexpected status ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.status) throw new Error('Missing status field');
    
    results.push({
      name: '✅ /api/sam/health - Sam Brain health check',
      passed: true,
      duration: Date.now() - start,
    });
  } catch (err: any) {
    results.push({
      name: '❌ /api/sam/health - Sam Brain health check',
      passed: false,
      duration: Date.now() - start,
      error: err.message,
    });
  }
}

/**
 * TEST: Approval Endpoint
 */
async function testApprovalEndpoint() {
  const start = Date.now();
  try {
    const response = await fetch(`${BASE_URL}/api/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'TEST-APR-001',
        action: 'approve',
      }),
    });
    
    if (response.status !== 200) throw new Error(`Status ${response.status}`);
    
    const data = await response.json();
    if (data.status !== 'success') throw new Error('Not successful');
    
    results.push({
      name: '✅ /api/approve - Decision logging',
      passed: true,
      duration: Date.now() - start,
    });
  } catch (err: any) {
    results.push({
      name: '❌ /api/approve - Decision logging',
      passed: false,
      duration: Date.now() - start,
      error: err.message,
    });
  }
}

/**
 * TEST: Sam Chat Endpoint
 */
async function testSamChatEndpoint() {
  const start = Date.now();
  try {
    const response = await fetch(`${BASE_URL}/api/sam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What is the current revenue status?',
      }),
    });
    
    if (response.status !== 200) throw new Error(`Status ${response.status}`);
    
    const data = await response.json();
    if (!data.reply) throw new Error('No reply from Sam');
    if (!['success', 'fallback'].includes(data.status)) throw new Error('Invalid status');
    
    results.push({
      name: '✅ /api/sam - AI CEO query routing',
      passed: true,
      duration: Date.now() - start,
    });
  } catch (err: any) {
    results.push({
      name: '❌ /api/sam - AI CEO query routing',
      passed: false,
      duration: Date.now() - start,
      error: err.message,
    });
  }
}

/**
 * RUN ALL TESTS
 */
async function runAllTests() {
  console.log('\n🧪 Starting Dashboard Test Suite...\n');
  
  await testHealthCheck();
  await testRealDataEndpoint();
  await testSamBrainHealth();
  await testApprovalEndpoint();
  await testSamChatEndpoint();
  
  // Print results
  console.log('\n' + '='.repeat(80));
  console.log('TEST RESULTS');
  console.log('='.repeat(80) + '\n');
  
  results.forEach((result) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    console.log(`   ⏱️ ${result.duration}ms`);
    if (result.error) console.log(`   Error: ${result.error}`);
  });
  
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(1);
  
  console.log('\n' + '='.repeat(80));
  console.log(`SUMMARY: ${passed}/${total} passed (${passRate}%)`);
  console.log('='.repeat(80) + '\n');
  
  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED - Dashboard ready for production!\n');
    process.exit(0);
  } else {
    console.log(`⚠️ ${total - passed} test(s) failed. Check errors above.\n`);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch((err) => {
    console.error('Test suite failed:', err);
    process.exit(1);
  });
}

export { runAllTests };
