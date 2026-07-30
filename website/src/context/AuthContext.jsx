'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/services/api';

const AuthContext = createContext({
  user: null,
  token: null,
  isLoggedIn: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  registerSendOtp: async () => {},
  verifyEmailOtp: async () => {},
  sendOtp: async () => {},
  verifyOtp: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('user_token');
    const savedUser = localStorage.getItem('user_data');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user data:', e);
      }
    } else {
      setToken(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiRequest('/users/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response?.success && response?.data) {
        const { user: userData, token: userToken } = response.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('user_token', userToken);
        localStorage.setItem('user_data', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: response?.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Server error during login' };
    }
  };

  const registerSendOtp = async (data) => {
    try {
      const response = await apiRequest('/users/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response?.success) {
        return { success: true, message: response.message, data: response.data };
      }
      return { success: false, message: response?.message || 'Registration failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Server error during registration' };
    }
  };

  const verifyEmailOtp = async (email, otp) => {
    try {
      const response = await apiRequest('/users/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      if (response?.success && response?.data) {
        const { user: userData, token: userToken } = response.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('user_token', userToken);
        localStorage.setItem('user_data', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: response?.message || 'Verification failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Server error verifying OTP' };
    }
  };

  const register = async (name, email, password, phone) => {
    return registerSendOtp({ name, email, password, phone });
  };

  const sendOtp = async (phone, type = 'login') => {
    try {
      const response = await apiRequest('/users/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, type }),
      });

      if (response?.success) {
        return { success: true, message: response.message, otp: response.data?.otp };
      }
      return { success: false, message: response?.message || 'Failed to send OTP' };
    } catch (error) {
      return { success: false, message: error.message || 'Server error sending OTP' };
    }
  };

  const verifyOtp = async (phone, otp, name) => {
    try {
      const response = await apiRequest('/users/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name }),
      });

      if (response?.success && response?.data) {
        const { user: userData, token: userToken } = response.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('user_token', userToken);
        localStorage.setItem('user_data', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: response?.message || 'Verification failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Server error verifying OTP' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('cart_items');
    localStorage.removeItem('wishlist_items');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!user && !!token,
        loading,
        login,
        register,
        registerSendOtp,
        verifyEmailOtp,
        sendOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
