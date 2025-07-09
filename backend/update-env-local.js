const fs = require('fs');

const envContent = `PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/smartBrief

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# AI API Keys
GEMINI_API_KEY=AIzaSyDY2pLMU9QtmQDp_6uAvBk0zQfKRoIgkII`;

fs.writeFileSync('.env', envContent, 'utf8');
console.log('.env file updated to use local MongoDB');
console.log('Make sure MongoDB is installed and running locally on port 27017'); 