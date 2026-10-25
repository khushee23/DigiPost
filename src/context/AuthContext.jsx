import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Synchronous initialization from localStorage prevents race conditions on page load and redirects
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('poas_auth_user');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed) {
        if (!parsed._id && parsed.id) parsed._id = parsed.id;
        if (!parsed.id && parsed._id) parsed.id = parsed._id;
        if (parsed.role) parsed.role = parsed.role.toString().toLowerCase();
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('poas_auth_token') || null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Initialize session on mount and ensure headers
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('poas_auth_token');
        const storedUser = localStorage.getItem('poas_auth_user');

        if (storedToken && storedUser) {
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          // Optionally fetch fresh user data
          try {
            const freshUser = await authService.getCurrentUser();
            if (freshUser) {
              const normalized = {
                ...freshUser,
                _id: freshUser._id || freshUser.id,
                id: freshUser.id || freshUser._id,
                role: (freshUser.role || 'customer').toString().toLowerCase(),
              };
              setUser(normalized);
              localStorage.setItem('poas_auth_user', JSON.stringify(normalized));
            }
          } catch {
            // Handled by interceptor if invalid
          }
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const result = await authService.login({ email, password });
      const normalizedUser = {
        ...result.user,
        _id: result.user._id || result.user.id,
        id: result.user.id || result.user._id,
        role: (result.user?.role || 'customer').toString().toLowerCase(),
      };
      setUser(normalizedUser);
      setToken(result.token);
      localStorage.setItem('poas_auth_token', result.token);
      localStorage.setItem('poas_auth_user', JSON.stringify(normalizedUser));
      if (api.defaults?.headers?.common) {
        api.defaults.headers.common['Authorization'] = `Bearer ${result.token}`;
      }
      return { ...result, user: normalizedUser };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setIsLoading(true);
    try {
      const result = await authService.register(formData);
      const normalizedUser = {
        ...result.user,
        _id: result.user._id || result.user.id,
        id: result.user.id || result.user._id,
        role: (result.user?.role || 'customer').toString().toLowerCase(),
      };
      setUser(normalizedUser);
      setToken(result.token);
      localStorage.setItem('poas_auth_token', result.token);
      localStorage.setItem('poas_auth_user', JSON.stringify(normalizedUser));
      if (api.defaults?.headers?.common) {
        api.defaults.headers.common['Authorization'] = `Bearer ${result.token}`;
      }
      return { ...result, user: normalizedUser };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        ...updatedUserData,
        _id: updatedUserData._id || updatedUserData.id || prev?._id || prev?.id,
        id: updatedUserData.id || updatedUserData._id || prev?.id || prev?._id,
      };
      localStorage.setItem('poas_auth_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!(user || localStorage.getItem('poas_auth_user')) && !!(token || localStorage.getItem('poas_auth_token')),
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
    try {
      const storedToken = localStorage.getItem('poas_auth_token');
      const storedUser = localStorage.getItem('poas_auth_user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      return {
        user: parsedUser,
        token: storedToken,
        role: parsedUser?.role || null,
        isAuthenticated: !!(storedToken && parsedUser),
        isLoading: false,
        login: async () => {},
        register: async () => {},
        logout: () => {},
        updateUser: () => {},
      };
    } catch {
      return {
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
        login: async () => {},
        register: async () => {},
        logout: () => {},
        updateUser: () => {},
      };
    }
  }
  return context;
};
