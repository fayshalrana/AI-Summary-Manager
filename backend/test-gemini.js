require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  console.log('Testing Gemini API...');
  
  // Check if API key is set
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
    console.error('❌ GEMINI_API_KEY not set or still using placeholder value');
    console.log('Please add your Gemini API key to the .env file');
    return;
  }

  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Test with a simple prompt
    const prompt = 'Hello! Please respond with "Gemini API is working!" if you can see this message.';
    
    console.log('Sending test request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API is working!');
    console.log('Response:', text);
    
  } catch (error) {
    console.error('❌ Gemini API test failed:', error.message);
    if (error.message.includes('API_KEY')) {
      console.log('Please check your Gemini API key is correct');
    }
  }
}

testGeminiAPI(); 