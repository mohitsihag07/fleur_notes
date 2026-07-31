import axios from 'axios';
import toast from 'react-hot-toast';


export const getBackendURL = () => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocal) {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl) {
      return envUrl.replace('/api/admin', '');
    }
    return 'http://localhost:3131';
  }
  // return 'http://13.134.3.37:5000';
};

const getBaseURL = () => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocal) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3131/api/admin';
  }
  // return 'http://13.134.3.37:5000/api/admin';
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

