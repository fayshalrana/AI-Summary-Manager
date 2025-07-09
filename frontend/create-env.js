import fs from 'fs';

const envContent = `# API Configuration
# For production (Render deployment)
VITE_API_BASE_URL=https://ai-summary-manager.onrender.com/api

# For development (local backend)
# VITE_API_BASE_URL=http://localhost:5000/api`;

fs.writeFileSync('.env', envContent, 'utf8');
console.log('.env file created successfully for frontend');
console.log('API Base URL set to: https://ai-summary-manager.onrender.com/api'); 