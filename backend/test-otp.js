const http = require('http');

async function testCitizenOtp() {
  const data = JSON.stringify({
    email: 'testcitizen@example.com',
    password: 'password123'
  });
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/send-otp',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(responseData) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

testCitizenOtp().then(res => {
  console.log('Citizen OTP Result:', res.statusCode, res.body);
}).catch(console.error);
