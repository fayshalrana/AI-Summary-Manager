# Deploy SmartBrief Backend to Render

## Prerequisites
- GitHub repository with your backend code
- MongoDB Atlas account (or other MongoDB service)
- Gemini API key

## Step 1: Prepare Your Repository

1. Make sure your code is pushed to GitHub
2. Ensure all environment variables are properly configured
3. Verify your `package.json` has the correct start script

## Step 2: Deploy on Render

### Option A: Using Render Dashboard (Recommended)

1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. **Click "New +" and select "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `smartbrief-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose paid plan)

### Option B: Using render.yaml (Blueprints)

1. **Push your code with `render.yaml` to GitHub**
2. **Go to [Render Dashboard](https://dashboard.render.com)**
3. **Click "New +" and select "Blueprint"**
4. **Connect your GitHub repository**
5. **Render will automatically detect and use the `render.yaml` configuration**

## Step 3: Configure Environment Variables

In your Render service dashboard, go to **Environment** tab and add:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/smartBrief
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GEMINI_API_KEY=your-gemini-api-key-here
```

## Step 4: Deploy

1. **Click "Create Web Service"**
2. **Wait for the build to complete**
3. **Your API will be available at**: `https://your-service-name.onrender.com`

## Step 5: Update Frontend

Update your frontend's API base URL to point to your Render deployment:

```typescript
// In frontend/src/config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-service-name.onrender.com/api';
```

## Troubleshooting

### Common Issues:

1. **Build fails**: Check if all dependencies are in `package.json`
2. **Environment variables not working**: Verify they're set in Render dashboard
3. **MongoDB connection fails**: Check your MongoDB Atlas connection string
4. **CORS errors**: Your server already has CORS configured

### Useful Commands:

- **View logs**: Go to your service dashboard and click "Logs"
- **Redeploy**: Click "Manual Deploy" in your service dashboard
- **Check health**: Visit `https://your-service-name.onrender.com/api/health`

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (production/development) | Yes |
| `PORT` | Port for the server (Render sets this) | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes | 