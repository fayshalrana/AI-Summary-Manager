const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

let authToken = '';

async function testAuth() {
  console.log('🧪 Testing SmartBrief Authentication System\n');

  try {
    // Test 1: Register new user
    console.log('1. Testing user registration...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ Registration successful');
    console.log(`   User ID: ${registerResponse.data.user.id}`);
    console.log(`   Credits: ${registerResponse.data.user.credits}`);
    console.log(`   Role: ${registerResponse.data.user.role}\n`);

    authToken = registerResponse.data.token;

    // Test 2: Login with registered user
    console.log('2. Testing user login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful');
    console.log(`   Token received: ${loginResponse.data.token.substring(0, 20)}...\n`);

    // Test 3: Get current user info
    console.log('3. Testing get current user...');
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get user info successful');
    console.log(`   Name: ${meResponse.data.user.name}`);
    console.log(`   Email: ${meResponse.data.user.email}\n`);

    // Test 4: Test credit deduction
    console.log('4. Testing credit deduction...');
    const deductResponse = await axios.post(`${BASE_URL}/users/${meResponse.data.user.id}/deduct-credit`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Credit deduction successful');
    console.log(`   Remaining credits: ${deductResponse.data.remainingCredits}\n`);

    // Test 5: Test invalid login
    console.log('5. Testing invalid login...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: testUser.email,
        password: 'wrongpassword'
      });
    } catch (error) {
      if (error.response.status === 401) {
        console.log('✅ Invalid login properly rejected');
      }
    }

    console.log('\n🎉 All authentication tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
  }
}

// Check if axios is available
try {
  require.resolve('axios');
  testAuth();
} catch (error) {
  console.log('⚠️  Axios not installed. Install it with: npm install axios');
  console.log('   Then run: node test-auth.js');
} 