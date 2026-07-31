const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3131/api';

export const getBackendURL = () => {
  return API_BASE_URL.replace('/api', '');
};

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (typeof window !== 'undefined' && !headers['Authorization'] && !headers['authorization']) {
    const token = localStorage.getItem('user_token');
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = 'Something went wrong';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Response is not JSON
        try {
          const text = await response.text();
          if (text) errorMessage = text;
        } catch (e2) {
          // ignore
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Throw the error to callers but avoid noisy console logs for expected HTTP errors.
    throw error;
  }
}
