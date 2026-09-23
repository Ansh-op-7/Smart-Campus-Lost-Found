import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.trim() : '';

// Base URL normalized to include /api, e.g. "http://localhost:8080/api" or "/api"
const getBaseUrl = () => {
  if (!rawApiUrl) return '/api';
  let url = rawApiUrl;
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url.endsWith('/api') ? url : `${url}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT Token & normalize path so "/api/..." is never doubled
api.interceptors.request.use(
  (config) => {
    // If URL starts with "/api/", strip it because baseURL already includes "/api"
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.substring(4);
    } else if (config.url === '/api') {
      config.url = '';
    }

    const token = localStorage.getItem('findit_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const originalRequestUrl = error.config ? error.config.url : '';
      const isAuthEndpoint = originalRequestUrl.includes('/auth/login') || originalRequestUrl.includes('/auth/register');

      if (!isAuthEndpoint) {
        localStorage.removeItem('findit_token');
        localStorage.removeItem('findit_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Failed to connect to backend API:', error);
    throw error;
  }
};

export default api;
