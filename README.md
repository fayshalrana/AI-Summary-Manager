# SmartBrief - AI-Powered Text Summarization Platform

SmartBrief is a modern web application that leverages Google's Gemini AI to provide intelligent text summarization services. Built with a React frontend and Node.js backend, it offers a user-friendly interface for creating concise summaries from uploaded documents or direct text input.

## 🚀 Key Features

### Core Functionality
- **AI-Powered Summarization**: Uses Google Gemini AI for intelligent text summarization
- **File Upload Support**: Upload and process `.txt` and `.docx` files
- **Direct Text Input**: Paste text directly for instant summarization
- **Custom Prompts**: Use custom prompts to control summarization style and focus
- **Real-time Processing**: Live status updates during summarization
- **Compression Analytics**: Track word count reduction and time savings

### User Management
- **Role-Based Access**: User, Editor, Reviewer, and Admin roles
- **Credit System**: Manage usage with a credit-based system
- **Admin Panel**: Complete user management and system oversight
- **Role-Based Summary Management**: Different access levels for summary viewing and management
- **Admin Credit Management**: Admins can add/remove credits for any user
- **Role Updates**: Admins can change user roles (user, editor, reviewer, admin)

### Advanced Features
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Notifications**: Toast notifications for user feedback
- **Analytics Dashboard**: Track usage patterns and performance metrics

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Redux Toolkit** - State management with RTK Query
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hot Toast** - User notifications
- **React Icons** - Icon library
- **Vite** - Fast build tool and dev server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Mammoth** - DOCX file parsing
- **Axios** - HTTP client for API calls

### AI Integration
- **Google Gemini AI** - Primary AI provider for text summarization
- **Custom Prompt Engineering** - Tailored summarization prompts
- **Usage Tracking** - Monitor API usage and costs

### DevOps & Deployment
- **Vercel** - Frontend deployment
- **Render** - Backend deployment
- **MongoDB Atlas** - Cloud database
- **Environment Variables** - Secure configuration management

## 📁 Project Structure

```
smartBrief/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── store/          # Redux store and slices
│   │   ├── config/         # API configuration
│   │   └── assets/         # Static assets
│   ├── public/             # Public assets
│   └── package.json        # Frontend dependencies
├── backend/                 # Node.js backend application
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── services/           # Business logic services
│   ├── middleware/         # Express middleware
│   └── package.json        # Backend dependencies
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Google Gemini API key

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smartBrief/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/smartBrief
   JWT_SECRET=your-super-secret-jwt-key
   GEMINI_API_KEY=your-gemini-api-key
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_APP_NAME=SmartBrief
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Backend Management

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Users
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id/credits` - Update user credits (admin only)
- `PUT /api/users/:id/role` - Update user role (admin only)
- `GET /api/users/:id/summaries` - Get summaries by user (admin/editor only)

#### Summaries
- `POST /api/summaries` - Create new summary
- `GET /api/summaries` - Get user summaries
- `GET /api/summaries/:id` - Get specific summary
- `DELETE /api/summaries/:id` - Delete summary
- `GET /api/summaries/all` - Get all summaries (admin/editor only)
- `PUT /api/summaries/:id/status` - Update summary status (admin/editor only)

### Database Models

#### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user|editor|reviewer|admin),
  credits: Number,
  createdAt: Date
}
```

#### Summary Schema
```javascript
{
  userId: ObjectId,
  originalText: String,
  summary: String,
  wordCount: { original: Number, summary: Number },
  prompt: String,
  aiProvider: String,
  model: String,
  status: String,
  processingTime: Number,
  creditsUsed: Number
}
```

### Services Architecture

#### AI Service (`services/aiService.js`)
- Handles Google Gemini API integration
- Provides text validation and processing
- Tracks API usage and costs

#### File Service (`services/fileService.js`)
- Processes uploaded files (.txt, .docx)
- Extracts text content using Mammoth
- Validates file types and sizes
- Cleans and normalizes extracted text

#### Credit Service (`services/creditService.js`)
- Manages user credit system
- Validates credit availability
- Tracks credit usage per operation
- Handles admin credit management
- Provides credit history and analytics

### Credit Management System

#### Credit Allocation
- **New Users**: Start with 5 free credits
- **Credit Costs**: 1 credit per summary generation
- **Admin Control**: Admins can add/remove credits for any user
- **Credit History**: Track all credit transactions

#### Admin Credit Operations
```javascript
// Add credits to user
await creditService.addCredits(userId, 50, 'Bonus for active usage');

// Remove credits from user
await creditService.removeCredits(userId, 10, 'Penalty for policy violation');

// Get user credit history
const history = await creditService.getCreditHistory(userId);
```

#### Credit Validation
- Prevents negative credit balances
- Validates credit availability before operations
- Tracks credit usage with timestamps
- Provides detailed credit reports

## 🤖 Gemini AI Integration

### Configuration
The application uses Google's Gemini AI for text summarization. Integration is handled through the `aiService.js`:

```javascript
// Example usage
const aiService = require('./services/aiService');

const result = await aiService.generateSummary(
  text,
  customPrompt,
  'gemini-1.5-flash-latest'
);
```

### Supported Models
- `gemini-1.5-flash-latest` - Fast, efficient summarization
- `gemini-pro` - Advanced reasoning capabilities
- `gemini-pro-vision` - Image and text processing

### Prompt Engineering
The system supports custom prompts for different summarization styles:
- **Executive Summary**: High-level overview for decision makers
- **Academic Summary**: Detailed analysis with key points
- **Bullet Points**: Structured list format
- **Custom**: User-defined summarization style

### Error Handling
- API rate limiting
- Token limit management
- Network timeout handling
- Fallback strategies

## 📁 File Upload Features

### Supported Formats
- **.txt** - Plain text files (max 5MB)
- **.docx** - Microsoft Word documents (max 10MB)

### Processing Pipeline
1. **File Validation**: Check type, size, and content
2. **Text Extraction**: Parse file content using appropriate libraries
3. **Content Cleaning**: Normalize text format and structure
4. **AI Processing**: Send to Gemini for summarization
5. **Result Storage**: Save summary with metadata

### File Service Methods
```javascript
// Extract text from uploaded file
const result = await fileService.extractTextFromFile(file);

// Validate file before processing
const validation = fileService.validateFile(file);

// Get supported file types
const supportedTypes = fileService.getSupportedFileTypes();
```

## 🔐 Security Features

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Session management
- Role-based access control

### Role-Based Access Control (RBAC)

#### User Roles
- **User**: Basic access to create and view own summaries
- **Editor**: Can view all summaries and manage content
- **Reviewer**: Can review and approve summaries
- **Admin**: Full system access and user management

#### Permission Matrix
| Feature | User | Editor | Reviewer | Admin |
|---------|------|--------|----------|-------|
| Create Summary | ✅ | ✅ | ✅ | ✅ |
| View Own Summaries | ✅ | ✅ | ✅ | ✅ |
| View All Summaries | ❌ | ✅ | ✅ | ✅ |
| Manage User Credits | ❌ | ❌ | ❌ | ✅ |
| Update User Roles | ❌ | ❌ | ❌ | ✅ |
| System Analytics | ❌ | ❌ | ❌ | ✅ |
| Delete Summaries | ❌ | ✅ | ✅ | ✅ |

### Data Protection
- Input validation and sanitization
- SQL injection prevention (MongoDB)
- XSS protection
- CORS configuration

### File Security
- File type validation
- Size limits enforcement
- Content scanning
- Secure file handling

## 📊 Analytics & Monitoring

### User Analytics
- Summary creation frequency
- Average processing time
- Compression ratios
- Credit usage patterns

### Admin Management Features

#### User Management Dashboard
- **Credit Management**: Add/remove credits for any user
- **Role Management**: Change user roles (user → editor → reviewer → admin)
- **User Analytics**: View individual user statistics
- **Bulk Operations**: Manage multiple users simultaneously

#### Summary Management
- **Global Summary View**: Access all summaries across users
- **Summary Status Management**: Approve, reject, or flag summaries
- **Content Moderation**: Review and edit summary content

#### System Administration
- **Credit System Control**: Configure credit costs and limits
- **Role Permissions**: Customize role-based access
- **System Health**: Monitor API usage and performance

### System Metrics
- API response times
- Error rates
- Database performance
- AI service usage

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Set build command: `npm run build`
4. Deploy automatically on push to main

### Backend (Render)
1. Connect GitHub repository to Render
2. Set environment variables
3. Configure build command: `npm install`
4. Set start command: `npm start`

### Database (MongoDB Atlas)
1. Create MongoDB Atlas cluster
2. Configure network access
3. Create database user
4. Update connection string in environment variables

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartBrief
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=your-gemini-api-key
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Frontend (.env)
```env
VITE_API_BASE_URL=https://your-backend-domain.onrender.com/api
VITE_APP_NAME=SmartBrief
VITE_APP_VERSION=1.0.0
```

## 🧪 Testing

### Backend Testing
```bash
# Run all tests
npm test

# Test specific modules
npm test -- --grep "auth"
```

### Frontend Testing
```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

## 📝 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Summary Endpoints

#### Create Summary
```http
POST /api/summaries
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

{
  "text": "Your text to summarize...",
  "prompt": "Custom prompt (optional)",
  "model": "gemini-1.5-flash-latest"
}
```

#### Get User Summaries
```http
GET /api/summaries?page=1&limit=10
Authorization: Bearer <jwt-token>
```

#### Admin Management Endpoints

##### Update User Credits (Admin Only)
```http
PUT /api/users/:userId/credits
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "credits": 50,
  "reason": "Bonus credits for active user"
}
```

##### Update User Role (Admin Only)
```http
PUT /api/users/:userId/role
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "role": "editor",
  "reason": "Promoted to editor for content management"
}
```

##### Get All Summaries (Admin/Editor Only)
```http
GET /api/summaries/all?page=1&limit=20&status=completed
Authorization: Bearer <admin-jwt-token>
```

##### Update Summary Status (Admin/Editor Only)
```http
PUT /api/summaries/:summaryId/status
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "status": "approved",
  "notes": "Summary meets quality standards"
}
```

## 🔄 Version History

- **v1.0.0** - Initial release with core summarization features
- **v1.1.0** - Added file upload support
- **v1.2.0** - Implemented credit system and user management
- **v1.3.0** - Added admin dashboard and analytics

---

**SmartBrief** - Making text summarization intelligent and accessible. 🚀 
