import axios from 'axios';
import toast from 'react-hot-toast';


export const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (isLocal) {
    return 'http://localhost:3131/api/admin';
  }
  return 'https://fleur-notes-backend.onrender.com/api/admin';
};

export const getBackendURL = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  const baseUrl = getBaseURL();
  return baseUrl ? baseUrl.replace('/api/admin', '') : 'https://fleur-notes-backend.onrender.com';
};

const ApiInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT tokens into outbox requests
ApiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fleur_notes_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses to handle authorization failures
ApiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const isLoginRequest = error.config && error.config.url && error.config.url.includes('/login');
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      console.warn('Session expired. Cleared authentication tokens.');
      localStorage.removeItem('fleur_notes_admin_token');
      localStorage.removeItem('fleur_notes_admin_refresh_token');
      // Dispatch custom event to trigger Zustand logout
      window.dispatchEvent(new Event('auth-logout'));
    }
    return Promise.reject(error);
  }
);

export default ApiInstance;

