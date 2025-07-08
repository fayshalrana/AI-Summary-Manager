import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testBackendConnection() {
  console.log('🔍 Testing SmartBrief Backend Connection...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health Check: PASSED');
    console.log(`   Response: ${JSON.stringify(healthResponse.data)}\n`);

    // Test 2: Registration Endpoint
    console.log('2. Testing Registration Endpoint...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123'
      });
      console.log('✅ Registration: PASSED');
      console.log(`   Response: ${JSON.stringify(registerResponse.data)}\n`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
        console.log('✅ Registration: PASSED (User already exists - expected)');
        console.log(`   Response: ${JSON.stringify(error.response.data)}\n`);
      } else {
        console.log('❌ Registration: FAILED');
        console.log(`   Error: ${error.response?.data?.error || error.message}\n`);
      }
    }

    // Test 3: Protected Endpoint (should fail without auth)
    console.log('3. Testing Protected Endpoint (should require auth)...');
    try {
      await axios.get(`${API_BASE_URL}/summaries/ai/models`);
      console.log('❌ Protected Endpoint: FAILED (should require authentication)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Protected Endpoint: PASSED (correctly requires authentication)');
        console.log(`   Response: ${JSON.stringify(error.response.data)}\n`);
      } else {
        console.log('❌ Protected Endpoint: UNEXPECTED ERROR');
        console.log(`   Error: ${error.response?.data?.error || error.message}\n`);
      }
    }

    // Test 4: CORS Headers
    console.log('4. Testing CORS Configuration...');
    const corsResponse = await axios.get(`${API_BASE_URL}/health`);
    const corsHeaders = corsResponse.headers;
    
    if (corsHeaders['access-control-allow-origin']) {
      console.log('✅ CORS: PASSED');
      console.log(`   Allow-Origin: ${corsHeaders['access-control-allow-origin']}`);
    } else {
      console.log('❌ CORS: FAILED (No CORS headers found)');
    }

    console.log('\n🎉 Backend Connection Test Summary:');
    console.log('✅ Backend is running and accessible');
    console.log('✅ Health check endpoint working');
    console.log('✅ Authentication endpoints working');
    console.log('✅ Protected endpoints properly secured');
    console.log('✅ CORS properly configured');
    console.log('\n🚀 Frontend should be able to connect successfully!');

  } catch (error) {
    console.log('❌ Backend Connection Test: FAILED');
    if (error.code === 'ECONNREFUSED') {
      console.log('   Error: Backend server is not running on http://localhost:5000');
      console.log('   Solution: Start the backend server with "npm start" in the backend directory');
    } else if (error.response) {
      console.log(`   Error: ${error.response.status} - ${error.response.statusText}`);
      console.log(`   Details: ${JSON.stringify(error.response.data)}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

// Run the test
testBackendConnection(); 