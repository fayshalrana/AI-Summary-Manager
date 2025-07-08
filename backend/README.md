# SmartBrief Backend API

A comprehensive backend API for the SmartBrief application with authentication, role management, and credit system.

## Features

### 🔐 Authentication System
- JWT-based authentication
- User registration and login
- Password hashing with bcrypt
- Token-based session management

### 👥 Role Management
- **Admin**: Full access to all features
- **Editor**: Can edit/delete summaries
- **Reviewer**: Can view all summaries
- **User**: Manage own summaries only

### 💳 Credit System
- 5 credits assigned on registration
- 1 credit deducted per summarization
- Admin can recharge user credits
- Credit balance tracking

### 🤖 AI Summarization Engine
- OpenAI and Google Gemini API integration
- Support for .txt and .docx file uploads
- Raw text input processing
- Custom prompt support
- Summary regeneration with new prompts
- Automatic credit deduction

### 📂 Summary Management
- Complete CRUD operations for summaries
- Role-based access control
- Pagination and search functionality
- File upload processing
- Summary statistics and analytics

## Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp env.example .env
```

3. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartBrief
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "credits": 5,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "credits": 5,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/auth/me
Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer jwt-token-here
```

### User Management

#### GET /api/users
Get all users (admin only).

#### GET /api/users/:id
Get specific user (admin or own user).

#### PATCH /api/users/:id/credit
Update user credits (admin only).

**Request Body:**
```json
{
  "credits": 10
}
```

#### PATCH /api/users/:id/role
Update user role (admin only).

**Request Body:**
```json
{
  "role": "editor"
}
```

#### POST /api/users/:id/deduct-credit
Deduct credit from user account.

#### DELETE /api/users/:id
Delete user (admin only).

#### GET /api/users/stats/overview
Get user statistics (admin only).

### Summarization Endpoints

#### POST /api/summaries
Create a new summary from text input.

**Request Body:**
```json
{
  "text": "Your text to summarize here...",
  "prompt": "Optional custom prompt",
  "provider": "openai",
  "model": "gpt-3.5-turbo"
}
```

#### POST /api/summaries/upload
Create a summary from file upload (.txt or .docx).

**Request:** Multipart form data with file and optional parameters.

#### GET /api/summaries
Get all summaries (user-specific or all for reviewers/admins).

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for text content

#### GET /api/summaries/:id
Get specific summary by ID.

#### PUT /api/summaries/:id
Regenerate summary with new prompt (deducts credit).

**Request Body:**
```json
{
  "prompt": "New custom prompt",
  "provider": "openai",
  "model": "gpt-4"
}
```

#### DELETE /api/summaries/:id
Delete summary (admin, editor, or owner only).

#### GET /api/summaries/ai/models
Get available AI models and configuration status.

#### GET /api/summaries/file/types
Get supported file types for upload.

## Role Permissions

### Admin
- Full access to all features
- Can manage all users
- Can update roles and credits
- Can view all summaries
- Can delete any user

### Editor
- Can edit/delete summaries
- Can view all summaries
- Can manage own profile

### Reviewer
- Can view all summaries
- Can manage own profile

### User
- Can manage own summaries only
- Can manage own profile
- Can create summaries from text and files
- Can regenerate summaries with new prompts
- Limited access to features

## Credit System

### Credit Rules
- New users receive 5 credits on registration
- 1 credit is deducted per summarization
- Users cannot perform actions without sufficient credits
- Admins can recharge user credits

### Credit Management
- Check credit balance before operations
- Automatic deduction after successful operations
- Credit validation middleware available

### AI Integration
- OpenAI GPT models (3.5-turbo, GPT-4, GPT-4-turbo)
- Google Gemini models (gemini-pro, gemini-pro-vision)
- Custom prompt support for tailored summaries
- Automatic model selection based on provider
- Processing time tracking and usage statistics

### File Processing
- Support for .txt and .docx files
- Automatic text extraction and validation
- File size limits (5MB for .txt, 10MB for .docx)
- Text cleaning and normalization

## Middleware

### Authentication Middleware
- `authenticateToken`: Verifies JWT token
- `requireAdmin`: Admin access only
- `requireEditor`: Editor or higher access
- `requireReviewer`: Reviewer or higher access
- `requireUser`: Any authenticated user

### Usage Example
```javascript
const { authenticateToken, requireAdmin } = require('./middleware/auth');

router.get('/admin-only', authenticateToken, requireAdmin, (req, res) => {
  // Admin only route
});
```

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation
- Error handling
- CORS enabled

## Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: user, admin, editor, reviewer),
  credits: Number (default: 5),
  createdAt: Date (auto-generated)
}
```

### Summary Model
```javascript
{
  userId: ObjectId (ref: User),
  originalText: String (required, max 50k chars),
  summary: String (required, max 10k chars),
  wordCount: {
    original: Number (required),
    summary: Number (required)
  },
  prompt: String (max 1k chars),
  aiProvider: String (enum: openai, gemini),
  model: String,
  status: String (enum: processing, completed, failed),
  error: String (max 500 chars),
  processingTime: Number (milliseconds),
  creditsUsed: Number (default: 1),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

## Development

### Running in Development
```bash
npm run dev
```

### Testing
```bash
# Test authentication system
node test-auth.js

# Test summarization system
node test-summarization.js
```

### Environment Variables
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `OPENAI_API_KEY`: OpenAI API key for GPT models
- `GEMINI_API_KEY`: Google Gemini API key
- `NODE_ENV`: Environment (development/production)

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Test all endpoints
5. Update documentation

## License

ISC 