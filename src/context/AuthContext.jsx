import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('poas_auth_token');
        const storedUser = localStorage.getItem('poas_auth_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Optionally fetch fresh user data
          try {
            const freshUser = await authService.getCurrentUser();
            if (freshUser) {
              setUser(freshUser);
              localStorage.setItem('poas_auth_user', JSON.stringify(freshUser));
            }
          } catch {
            // If token invalid, session will be cleared by interceptor
          }
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const result = await authService.login({ email, password });
      setUser(result.user);
      setToken(result.token);
      localStorage.setItem('poas_auth_token', result.token);
      localStorage.setItem('poas_auth_user', JSON.stringify(result.user));
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setIsLoading(true);
    try {
      const result = await authService.register(formData);
      setUser(result.user);
      setToken(result.token);
      localStorage.setItem('poas_auth_token', result.token);
      localStorage.setItem('poas_auth_user', JSON.stringify(result.user));
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedUserData };
      localStorage.setItem('poas_auth_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
