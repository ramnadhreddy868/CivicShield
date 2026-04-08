#!/usr/bin/env node

/**
 * CivicShield Auth System - Connection Test Script
 * Run this to verify backend and frontend are properly connected
 * 
 * Usage: node test-auth-connection.js
 * (Run from project root directory)
 */

const http = require('http');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, text) {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: body ? JSON.parse(body) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  log('cyan', '\n═══════════════════════════════════════════════');
  log('cyan', '   CivicShield Auth System Connection Test');
  log('cyan', '═══════════════════════════════════════════════\n');

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Health Check
  log('blue', '📋 Test 1: Backend Health Check');
  try {
    const health = await makeRequest('GET', '/api/health');
    if (health.status === 200 && health.data.status === 'ok') {
      log('green', '✅ Backend is running on http://localhost:5000');
      testsPassed++;
    } else {
      log('red', '❌ Backend returned unexpected response');
      testsFailed++;
    }
  } catch (err) {
    log('red', `❌ Cannot connect to backend: ${err.message}`);
    log('yellow', '   Make sure backend is running: cd backend && npm run dev');
    testsFailed++;
  }

  // Test 2: Test user registration
  log('blue', '\n📋 Test 2: User Registration Endpoint');
  try {
    const testEmail = `test_${Date.now()}@example.com`;
    const response = await makeRequest('POST', '/api/auth/register', {
      email: testEmail,
      password: 'testpass123',
      name: 'Test User',
      role: 'citizen',
      phone: '5550000',
    });

    if (response.status === 201 && response.data.token) {
      log('green', '✅ Registration works. Token generated successfully');
      log('green', `   User: ${response.data.user.name} (${response.data.user.email})`);
      testsPassed++;

      // Store token for next test
      global.testToken = response.data.token;
      global.testEmail = testEmail;
      global.testPass = 'testpass123';
    } else {
      log('red', `❌ Registration failed: ${response.status}`);
      if (response.data?.error) {
        log('yellow', `   Error: ${response.data.error}`);
      }
      testsFailed++;
    }
  } catch (err) {
    log('red', `❌ Registration test error: ${err.message}`);
    testsFailed++;
  }

  // Test 3: Test login
  log('blue', '\n📋 Test 3: User Login Endpoint');
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: global.testEmail,
      password: global.testPass,
      role: 'citizen',
    });

    if (response.status === 200 && response.data.token) {
      log('green', '✅ Login works. Token generated successfully');
      log('green', `   User: ${response.data.user.name}`);
      log('green', `   Role: ${response.data.user.role}`);
      testsPassed++;
      global.loginToken = response.data.token;
    } else {
      log('red', `❌ Login failed: ${response.status}`);
      if (response.data?.error) {
        log('yellow', `   Error: ${response.data.error}`);
      }
      testsFailed++;
    }
  } catch (err) {
    log('red', `❌ Login test error: ${err.message}`);
    testsFailed++;
  }

  // Test 4: Test protected route (/auth/me)
  log('blue', '\n📋 Test 4: Protected Route (/api/auth/me)');
  if (global.loginToken) {
    try {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/me',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${global.loginToken}`,
        },
        timeout: 5000,
      };

      const response = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
          });
          res.on('end', () => {
            try {
              resolve({
                status: res.statusCode,
                data: JSON.parse(body),
              });
            } catch (e) {
              resolve({
                status: res.statusCode,
                data: body,
              });
            }
          });
        });
        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
        req.end();
      });

      if (response.status === 200 && response.data._id) {
        log('green', '✅ Protected route works with valid token');
        log('green', `   Authenticated user: ${response.data.name}`);
        testsPassed++;
      } else {
        log('red', `❌ Protected route failed: ${response.status}`);
        testsFailed++;
      }
    } catch (err) {
      log('red', `❌ Protected route test error: ${err.message}`);
      testsFailed++;
    }
  } else {
    log('yellow', '⚠️  Skipped (no token from login)');
  }

  // Test 5: Test admin registration
  log('blue', '\n📋 Test 5: Admin User Registration');
  try {
    const adminEmail = `admin_${Date.now()}@example.com`;
    const response = await makeRequest('POST', '/api/auth/register', {
      email: adminEmail,
      password: 'adminpass123',
      name: 'Test Admin',
      role: 'admin',
    });

    if (response.status === 201 && response.data.user.role === 'admin') {
      log('green', '✅ Admin registration works');
      log('green', `   User: ${response.data.user.name}`);
      log('green', `   Role: ${response.data.user.role}`);
      testsPassed++;
      global.adminToken = response.data.token;
      global.adminEmail = adminEmail;
    } else {
      log('red', `❌ Admin registration failed: ${response.status}`);
      testsFailed++;
    }
  } catch (err) {
    log('red', `❌ Admin registration test error: ${err.message}`);
    testsFailed++;
  }

  // Test 6: Test admin login
  log('blue', '\n📋 Test 6: Admin Login');
  if (global.adminEmail) {
    try {
      const response = await makeRequest('POST', '/api/auth/login', {
        email: global.adminEmail,
        password: 'adminpass123',
        role: 'admin',
      });

      if (response.status === 200 && response.data.user.role === 'admin') {
        log('green', '✅ Admin login works');
        log('green', `   User: ${response.data.user.name}`);
        log('green', `   Role: ${response.data.user.role}`);
        testsPassed++;
      } else {
        log('red', `❌ Admin login failed: ${response.status}`);
        testsFailed++;
      }
    } catch (err) {
      log('red', `❌ Admin login test error: ${err.message}`);
      testsFailed++;
    }
  } else {
    log('yellow', '⚠️  Skipped (no admin user from previous test)');
  }

  // Summary
  log('cyan', '\n═══════════════════════════════════════════════');
  log('cyan', '                   Test Summary');
  log('cyan', '═══════════════════════════════════════════════\n');

  if (testsFailed === 0) {
    log('green', `✅ All ${testsPassed} tests passed!`);
    log('green', '\n✨ Your authentication system is working correctly!');
    log('green', '\nYou can now:');
    log('green', '  1. Register citizen accounts');
    log('green', '  2. Login as citizen');
    log('green', '  3. Register admin accounts');
    log('green', '  4. Login as admin');
    log('green', '  5. Access protected routes with valid tokens\n');
  } else {
    log('red', `❌ ${testsFailed} test(s) failed, ${testsPassed} passed`);
    log('yellow', '\nPlease check:');
    log('yellow', '  • Backend is running on http://localhost:5000');
    log('yellow', '  • MongoDB is connected');
    log('yellow', '  • Environment variables are set in .env');
    log('yellow', '  • All required dependencies are installed\n');
  }

  process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((err) => {
  log('red', `Fatal error: ${err.message}`);
  process.exit(1);
});
