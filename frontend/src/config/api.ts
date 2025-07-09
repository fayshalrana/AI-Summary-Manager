// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Environment check
export const isDevelopment = import.meta.env.VITE_API_BASE_URL;
export const isProduction = import.meta.env.PROD; 