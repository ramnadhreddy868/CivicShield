const http = require('http');

// Create admin user
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n✅ Admin Account Created Successfully!\n');
    const response = JSON.parse(data);
    
    console.log('📝 Admin Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    admin@civicshield.com`);
    console.log(`Password: admin123`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🔐 User Details:');
    console.log(`Name: ${response.user.name}`);
    console.log(`Role: ${response.user.role}`);
    console.log(`Email: ${response.user.email}\n`);
    
    console.log('🚀 Next Steps:');
    console.log('1. Go to http://localhost:5174');
    console.log('2. Click "Admin" button in navbar');
    console.log('3. Enter the credentials above');
    console.log('4. Click "Admin Login"');
    console.log('5. You\'ll see the Admin Dashboard with all citizen reports\n');
    
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.log('\n⚠️  Make sure backend is running: npm run dev (in backend folder)\n');
  process.exit(1);
});

const payload = JSON.stringify({
  email: 'admin@civicshield2.com',
  password: 'admin123',
  name: 'System Admin',
  role: 'admin'
});

const payload2 = JSON.stringify({
  email: 'admin@civicshield1.com',
  password: 'admin1233',
  name: 'System Admin',
  role: 'admin'
});

console.log('🔐 Creating admin account...\n');
req.write(payload);
req.end();

console.log('🔐 Creating admin account...\n');
req.write(payload2);
req.end();
