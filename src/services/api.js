import axios from 'axios';

// Base API URL configurable via Vite environment variables
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// By default, if backend is not yet started, we provide seamless mock fallbacks
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('poas_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      if (status === 401) {
        // Token expired or invalid
        localStorage.removeItem('poas_auth_token');
        localStorage.removeItem('poas_auth_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?session_expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
