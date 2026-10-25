import axios from 'axios';

// Base API URL configurable via Vite environment variables
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// By default, if backend is not yet started, we provide seamless mock fallbacks
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Synchronously attach existing token to default headers if present
const initialToken = localStorage.getItem('poas_auth_token');
if (initialToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('poas_auth_token');
    if (token) {
      if (config.headers?.set) {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
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
      const status = error.response.status;
      const url = error.config?.url || '';
      const isMeEndpoint = url.includes('/auth/me');

      // Only wipe session if /auth/me explicitly rejects token as expired or invalid
      if (status === 401 && isMeEndpoint) {
        localStorage.removeItem('poas_auth_token');
        localStorage.removeItem('poas_auth_user');
        if (api.defaults?.headers?.common) {
          delete api.defaults.headers.common['Authorization'];
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
