import { useState, useEffect } from 'react';
import axios from 'axios';

const ConnectionTest = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [apiUrl] = useState('http://localhost:5000/api');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('loading');
      setMessage('Testing connection to backend...');

      // Test health endpoint first
      const healthResponse = await axios.get(`${apiUrl}/health`);
      
      if (healthResponse.status === 200) {
        setStatus('success');
        setMessage('✅ Backend is running and accessible! Health check passed.');
      } else {
        setStatus('error');
        setMessage(`❌ Backend health check failed: ${healthResponse.status}`);
      }
    } catch (error: any) {
      setStatus('error');
      if (error.code === 'ECONNREFUSED') {
        setMessage('❌ Backend server is not running. Please start the backend server first.');
      } else if (error.response) {
        setMessage(`❌ Backend responded with error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        setMessage('❌ No response from backend. Check if server is running on http://localhost:5000');
      } else {
        setMessage(`❌ Connection error: ${error.message}`);
      }
    }
  };

  const testAuthEndpoints = async () => {
    try {
      setMessage('Testing authentication endpoints...');
      
      // Test registration endpoint
      const registerResponse = await axios.post(`${apiUrl}/auth/register`, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123'
      });
      
      setMessage('✅ Registration endpoint working!');
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
        setMessage('✅ Registration endpoint working! (User already exists error is expected)');
      } else {
        setMessage(`❌ Registration endpoint error: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  const testSummaryEndpoints = async () => {
    try {
      setMessage('Testing summary endpoints...');
      
      // Test AI models endpoint (requires authentication)
      const modelsResponse = await axios.get(`${apiUrl}/summaries/ai/models`);
      
      if (modelsResponse.status === 200) {
        setMessage('✅ Summary endpoints working! AI models endpoint accessible.');
      } else {
        setMessage(`❌ Summary endpoints error: ${modelsResponse.status}`);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setMessage('✅ Summary endpoints properly protected! (401 Unauthorized is expected without authentication)');
      } else {
        setMessage(`❌ Summary endpoints error: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Backend Connection Test</h2>
      
      <div className="space-y-4">
        {/* Connection Status */}
        <div className={`p-4 rounded-lg border ${
          status === 'loading' ? 'bg-blue-50 border-blue-200' :
          status === 'success' ? 'bg-green-50 border-green-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Connection Status</h3>
              <p className="text-sm text-gray-600 mt-1">{message}</p>
            </div>
            <div className="text-2xl">
              {status === 'loading' && '⏳'}
              {status === 'success' && '✅'}
              {status === 'error' && '❌'}
            </div>
          </div>
        </div>

        {/* API URL */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">API Configuration</h3>
          <p className="text-sm text-gray-600">
            <strong>Backend URL:</strong> {apiUrl}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Make sure your backend is running on this URL
          </p>
        </div>

        {/* Test Buttons */}
        <div className="space-y-3">
          <button
            onClick={testConnection}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Test Basic Connection
          </button>
          
          <button
            onClick={testAuthEndpoints}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Test Authentication Endpoints
          </button>
          
          <button
            onClick={testSummaryEndpoints}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Test Summary Endpoints
          </button>
        </div>

        {/* Troubleshooting */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Make sure backend server is running on port 5000</li>
            <li>• Check if CORS is properly configured in backend</li>
            <li>• Verify environment variables are set correctly</li>
            <li>• Check browser console for detailed error messages</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest; 