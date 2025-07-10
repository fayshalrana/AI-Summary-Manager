// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-summary-manager.onrender.com/api';

// Environment check
export const isDevelopment = import.meta.env.VITE_API_BASE_URL;
export const isProduction = import.meta.env.PROD; 