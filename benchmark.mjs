import { GoogleDriveManager } from './sam-brain/src/utils/drive.js';

let fetchCallCount = 0;
const originalFetch = global.fetch;

global.fetch = async (url, options) => {
  if (url.includes('drive/v3/files/')) {
    fetchCallCount++;
    // Simulate network delay
    await new Promise(r => setTimeout(r, 50));
    return {
      text: async () => 'mock-content'
    };
  }
  return originalFetch(url, options);
};

async function runBenchmark() {
  console.log('--- Benchmarking getFileContent ---');
  const manager = new GoogleDriveManager({});
  const auth = { token: 'mock' };
  const fileId = 'file_123';

  const start = Date.now();
  for (let i = 0; i < 10; i++) {
    await manager.getFileContent(fileId, auth);
  }
  const duration = Date.now() - start;

  console.log(`10 calls took: ${duration}ms`);
  console.log(`fetch() was called ${fetchCallCount} times`);
}

runBenchmark();
