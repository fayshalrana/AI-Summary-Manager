# SmartBrief Frontend

A modern React-based frontend for the SmartBrief AI-powered text summarization application.

## Features

### 🔐 Authentication & User Management
- **User Registration & Login**: Secure authentication with JWT tokens
- **Role-Based Access Control**: Support for user, admin, editor, and reviewer roles
- **Credit System**: Real-time credit balance display and management
- **Persistent Sessions**: Automatic token management and session restoration

### 📝 Summary Management
- **Text Input**: Direct text summarization with custom prompts
- **File Upload**: Support for .txt and .docx files
- **AI Provider Selection**: Choose between OpenAI and Google Gemini
- **Model Selection**: Dynamic model options based on selected provider
- **Real-time Processing**: Live status updates during summarization

### 📊 Summary History & Analytics
- **Summary List**: Paginated view of all user summaries
- **Search Functionality**: Find summaries by content or metadata
- **Detailed View**: Comprehensive summary details with metadata
- **Edit & Delete**: Role-based permissions for summary management
- **Statistics Display**: Word counts, compression ratios, and processing times

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Loading States**: Smooth loading indicators and progress feedback
- **Error Handling**: User-friendly error messages and validation
- **Accessibility**: Keyboard navigation and screen reader support

## Tech Stack

- **React 19**: Latest React with modern hooks and features
- **TypeScript**: Type-safe development with full type coverage
- **Redux Toolkit**: State management with RTK Query for API calls
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Axios**: HTTP client for API communication
- **Vite**: Fast build tool and development server

## Project Structure

```
src/
├── components/           # React components
│   ├── AuthForm.tsx     # Login/Registration form
│   ├── CreateSummary.tsx # Summary creation interface
│   ├── Header.tsx       # Application header
│   ├── LoadingSpinner.tsx # Loading indicator
│   ├── SmartBriefApp.tsx # Main application component
│   ├── SummaryDetail.tsx # Summary detail modal
│   └── SummaryHistory.tsx # Summary list and management
├── store/               # Redux store configuration
│   ├── hooks.ts         # Typed Redux hooks
│   ├── index.ts         # Store configuration
│   └── slices/          # Redux slices
│       ├── summarySlice.ts # Summary state management
│       └── userSlice.ts    # User/auth state management
├── App.tsx              # Root application component
└── main.tsx            # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running (see backend README)
- Environment variables configured

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd smartBrief/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

### Environment Configuration

The frontend connects to the backend API at `http://localhost:5000/api` by default. If your backend is running on a different port or URL, update the `API_BASE_URL` in the slice files:

- `src/store/slices/userSlice.ts`
- `src/store/slices/summarySlice.ts`

## Usage Guide

### Authentication

1. **Registration**: New users can create an account and receive 5 initial credits
2. **Login**: Existing users can sign in with email and password
3. **Session Management**: Tokens are automatically managed and persisted

### Creating Summaries

1. **Text Input Mode**:
   - Enter text directly in the textarea
   - Choose AI provider (OpenAI or Gemini)
   - Select model based on provider
   - Add custom prompt (optional)
   - Click "Create Summary"

2. **File Upload Mode**:
   - Upload .txt or .docx files
   - Configure AI settings
   - Submit for processing

### Managing Summaries

1. **View History**: Browse all summaries with pagination and search
2. **View Details**: Click "View" to see full summary with metadata
3. **Edit Summaries**: Modify prompts and regenerate (requires credits)
4. **Delete Summaries**: Remove summaries (role-based permissions)

### Role-Based Permissions

- **User**: Can create, view, edit, and delete their own summaries
- **Editor**: Can manage all summaries (view, edit, delete)
- **Reviewer**: Can view and edit all summaries
- **Admin**: Full access to all features and user management

## API Integration

The frontend integrates with the following backend endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Summaries
- `GET /api/summaries` - Fetch summaries with pagination
- `POST /api/summaries` - Create summary from text
- `POST /api/summaries/upload` - Create summary from file
- `GET /api/summaries/:id` - Get specific summary
- `PUT /api/summaries/:id` - Update summary
- `DELETE /api/summaries/:id` - Delete summary
- `GET /api/summaries/ai/models` - Get available AI models
- `GET /api/summaries/file/types` - Get supported file types

### User Management
- `PATCH /api/users/:id/credit` - Update user credits
- `POST /api/users/:id/deduct-credit` - Deduct user credit

## State Management

### Redux Store Structure

```typescript
{
  user: {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    loading: boolean
    error: string | null
  },
  summary: {
    summaries: Summary[]
    currentSummary: Summary | null
    loading: boolean
    error: string | null
    pagination: PaginationInfo | null
    aiModels: AIModels | null
    supportedFileTypes: FileType[] | null
    aiConfiguration: AIConfig | null
  }
}
```

### Key Actions

- **Authentication**: `loginUser`, `registerUser`, `logout`, `getCurrentUser`
- **Summaries**: `fetchSummaries`, `createSummaryFromText`, `createSummaryFromFile`, `updateSummary`, `deleteSummary`
- **Configuration**: `fetchAIModels`, `fetchFileTypes`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Code Style

- TypeScript strict mode enabled
- ESLint configuration for React and TypeScript
- Prettier formatting (if configured)
- Component-based architecture with hooks

### Testing

To add tests to the application:

1. Install testing dependencies:
   ```bash
   npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
   ```

2. Create test files with `.test.tsx` or `.spec.tsx` extensions

3. Run tests:
   ```bash
   npm test
   ```

## Deployment

### Production Build

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Serve the build**:
   ```bash
   npm run preview
   ```

### Environment Variables

For production deployment, consider setting:

- `VITE_API_BASE_URL` - Backend API URL
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for frontend origin
2. **API Connection**: Verify backend server is running and accessible
3. **Authentication**: Check token storage and API authentication headers
4. **File Upload**: Ensure file size limits and supported formats

### Debug Mode

Enable debug logging by setting `localStorage.debug = 'smartbrief:*'` in browser console.

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for all new features
3. Update documentation for new features
4. Test thoroughly before submitting changes

## License

This project is part of the SmartBrief application. See the main project README for license information.
