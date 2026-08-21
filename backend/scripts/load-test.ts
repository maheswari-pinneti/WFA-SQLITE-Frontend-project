import axios from 'axios';

const TARGET_URL = process.env.API_URL || 'http://127.0.0.1:5001/v1/auth/login';
const CONCURRENT_USERS = parseInt(process.env.CONCURRENT_USERS || '100');

async function runLoadTest() {
  console.log(`[Load Test] Starting benchmark targeting: ${TARGET_URL}`);
  console.log(`[Load Test] Simulating ${CONCURRENT_USERS} simultaneous user login requests...`);

  const startTime = Date.now();
  const requests: Promise<any>[] = [];

  // Generate 500 simultaneous login request promises
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    // Attempting login with dummy/invalid credentials to trigger full route execution safely
    const req = axios.post(TARGET_URL, {
      email: `test-load-${i}@thestackly.com`,
      password: 'wrongpassword'
    }, {
      validateStatus: () => true // Prevent axios throwing on 4xx/5xx status codes
    }).then(res => ({
      status: res.status,
      success: res.data?.success === true
    })).catch(err => ({
      status: 'error',
      success: false,
      error: err.message
    }));
    requests.push(req);
  }

  // Await concurrent executions
  const results = await Promise.all(requests);
  const durationMs = Date.now() - startTime;

  let successCount = 0;
  let clientErrors = 0; // 400/401/404/429
  let serverErrors = 0; // 500
  let connectionErrors = 0; // failed requests
  let sampleErrorMsg = '';

  results.forEach(res => {
    if (res.status === 'error') {
      connectionErrors++;
      sampleErrorMsg = res.error;
    } else if (res.status >= 500) {
      serverErrors++;
    } else if (res.status >= 400) {
      clientErrors++;
    } else {
      successCount++;
    }
  });

  console.log('\n--- Load Test Results ---');
  console.log(`Total Requests Sent: ${CONCURRENT_USERS}`);
  console.log(`Successful API Hits (4xx expected/ok): ${clientErrors + successCount}`);
  console.log(`Server Failures (5xx): ${serverErrors}`);
  console.log(`Network/Timeout Failures: ${connectionErrors}`);
  if (sampleErrorMsg) {
    console.log(`Sample Connection Error: ${sampleErrorMsg}`);
  }
  console.log(`Total Duration: ${durationMs} ms`);
  console.log(`Average Latency per Request: ${(durationMs / CONCURRENT_USERS).toFixed(2)} ms`);
  console.log(`Throughput: ${(CONCURRENT_USERS / (durationMs / 1000)).toFixed(2)} req/sec`);
  console.log('-------------------------\n');

  if (serverErrors > 0 || connectionErrors > 0) {
    console.error('❌ Warning: Load test completed with failures. Check server logs.');
    process.exit(1);
  } else {
    console.log('✅ Success: All concurrent requests handled gracefully by the server without crashing.');
    process.exit(0);
  }
}

runLoadTest().catch(err => {
  console.error('[Load Test] Error executing test:', err);
  process.exit(1);
});
