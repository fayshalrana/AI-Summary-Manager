const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

const sampleText = `Artificial intelligence (AI) is a branch of computer science that aims to create intelligent machines that work and react like humans. Some of the activities computers with artificial intelligence are designed for include speech recognition, learning, planning, and problem solving.

AI has been around for decades, but recent advances in machine learning and deep learning have made it more powerful than ever. Machine learning algorithms can now process massive amounts of data and identify patterns that humans might miss. Deep learning, a subset of machine learning, uses neural networks with multiple layers to process data in increasingly complex ways.

The applications of AI are vast and growing. In healthcare, AI is being used to diagnose diseases, predict patient outcomes, and develop new treatments. In finance, AI algorithms are used for fraud detection, risk assessment, and automated trading. In transportation, self-driving cars use AI to navigate roads and avoid obstacles.

However, AI also raises important ethical and societal questions. Concerns about job displacement, privacy, and the potential for AI to be used maliciously are being actively debated. It's important to develop AI responsibly and ensure that it benefits humanity as a whole.

The future of AI is both exciting and uncertain. As technology continues to advance, we can expect AI to become even more integrated into our daily lives. The key will be to harness its power while addressing the challenges it presents.`;

let authToken = '';

async function testSummarization() {
  console.log('🧪 Testing SmartBrief Summarization System\n');

  try {
    // Test 1: Register user (if not already registered)
    console.log('1. Setting up test user...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      authToken = registerResponse.data.token;
      console.log('✅ User registered successfully');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
        // User already exists, try to login
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        authToken = loginResponse.data.token;
        console.log('✅ User logged in successfully');
      } else {
        throw error;
      }
    }

    // Test 2: Check AI configuration
    console.log('\n2. Checking AI configuration...');
    const configResponse = await axios.get(`${BASE_URL}/summaries/ai/models`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ AI configuration retrieved');
    console.log(`   OpenAI configured: ${configResponse.data.configuration.openai.configured}`);
    console.log(`   Gemini configured: ${configResponse.data.configuration.gemini.configured}`);

    // Test 3: Check supported file types
    console.log('\n3. Checking supported file types...');
    const fileTypesResponse = await axios.get(`${BASE_URL}/summaries/file/types`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ File types retrieved');
    console.log(`   Supported types: ${fileTypesResponse.data.supportedTypes.map(t => t.extension).join(', ')}`);

    // Test 4: Create summary from text
    console.log('\n4. Testing text summarization...');
    const summaryResponse = await axios.post(`${BASE_URL}/summaries`, {
      text: sampleText,
      prompt: 'Create a concise summary highlighting the key points about AI:',
      provider: 'openai'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Text summarization successful');
    console.log(`   Summary ID: ${summaryResponse.data.summary._id}`);
    console.log(`   Original words: ${summaryResponse.data.summary.wordCount.original}`);
    console.log(`   Summary words: ${summaryResponse.data.summary.wordCount.summary}`);
    console.log(`   Compression: ${summaryResponse.data.summary.compressionRatio}%`);
    console.log(`   Processing time: ${summaryResponse.data.aiInfo.processingTime}ms`);

    const summaryId = summaryResponse.data.summary._id;

    // Test 5: Get specific summary
    console.log('\n5. Testing get specific summary...');
    const getSummaryResponse = await axios.get(`${BASE_URL}/summaries/${summaryId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get summary successful');
    console.log(`   Summary retrieved: ${getSummaryResponse.data.summary._id}`);

    // Test 6: Regenerate summary with new prompt
    console.log('\n6. Testing summary regeneration...');
    const regenerateResponse = await axios.put(`${BASE_URL}/summaries/${summaryId}`, {
      prompt: 'Summarize this text in bullet points focusing on applications and challenges:',
      provider: 'openai'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Summary regeneration successful');
    console.log(`   New summary words: ${regenerateResponse.data.summary.wordCount.summary}`);
    console.log(`   Credits used: ${regenerateResponse.data.summary.creditsUsed}`);

    // Test 7: Get all summaries
    console.log('\n7. Testing get all summaries...');
    const allSummariesResponse = await axios.get(`${BASE_URL}/summaries`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get all summaries successful');
    console.log(`   Total summaries: ${allSummariesResponse.data.pagination.totalCount}`);
    console.log(`   Current page: ${allSummariesResponse.data.pagination.currentPage}`);

    // Test 8: Test file upload (create a test file)
    console.log('\n8. Testing file upload summarization...');
    const testFileName = 'test-document.txt';
    fs.writeFileSync(testFileName, sampleText);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFileName));
    formData.append('prompt', 'Summarize this document in a professional tone:');
    formData.append('provider', 'openai');

    const uploadResponse = await axios.post(`${BASE_URL}/summaries/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`
      }
    });
    console.log('✅ File upload summarization successful');
    console.log(`   File summary ID: ${uploadResponse.data.summary._id}`);
    console.log(`   File processed: ${uploadResponse.data.fileInfo.fileName}`);

    // Clean up test file
    fs.unlinkSync(testFileName);

    // Test 9: Test error handling - insufficient credits
    console.log('\n9. Testing error handling...');
    try {
      await axios.post(`${BASE_URL}/summaries`, {
        text: 'This is a test text that should fail due to insufficient credits.',
        provider: 'openai'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('Insufficient credits')) {
        console.log('✅ Insufficient credits properly handled');
      } else {
        console.log('⚠️  Unexpected error:', error.response?.data?.error || error.message);
      }
    }

    console.log('\n🎉 All summarization tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
    
    if (error.response?.status === 500) {
      console.log('\n💡 Make sure:');
      console.log('   - MongoDB is running');
      console.log('   - AI API keys are configured in .env');
      console.log('   - Server is running on port 5000');
    }
  }
}

// Check if required modules are available
try {
  require.resolve('axios');
  require.resolve('form-data');
  testSummarization();
} catch (error) {
  console.log('⚠️  Required modules not installed. Install them with:');
  console.log('   npm install axios form-data');
  console.log('   Then run: node test-summarization.js');
} 