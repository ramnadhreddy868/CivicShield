// Simple API test script
const http = require('http');

const API_BASE = 'http://localhost:5000/api';

function testEndpoint(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {}
    };

    if (data) {
      if (typeof data === 'object') {
        options.headers['Content-Type'] = 'application/json';
        data = JSON.stringify(data);
      }
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: body
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Civik Shield Backend API...\n');

  // Test 1: Health Check
  try {
    console.log('1. Testing Health Endpoint...');
    const health = await testEndpoint(`${API_BASE}/health`);
    if (health.status === 200) {
      console.log('   ✅ Health check passed');
      console.log('   Response:', JSON.parse(health.body));
    } else {
      console.log('   ❌ Health check failed:', health.status);
    }
  } catch (err) {
    console.log('   ❌ Health check error:', err.message);
    console.log('   ⚠️  Make sure backend is running: npm run dev');
    return;
  }

  // Test 2: Get Reports (should return empty array or existing reports)
  try {
    console.log('\n2. Testing GET /api/reports...');
    const reports = await testEndpoint(`${API_BASE}/reports`);
    if (reports.status === 200) {
      const data = JSON.parse(reports.body);
      console.log('   ✅ GET reports passed');
      console.log('   Found', Array.isArray(data) ? data.length : 0, 'reports');
    } else {
      console.log('   ❌ GET reports failed:', reports.status);
    }
  } catch (err) {
    console.log('   ❌ GET reports error:', err.message);
  }

  console.log('\n✅ Basic API tests completed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Make sure MongoDB is running');
  console.log('   2. Test report submission from frontend');
  console.log('   3. Check dashboard shows reports');
}

runTests();

