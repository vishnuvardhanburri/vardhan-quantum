'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  setAuthToken,
  clearAuthToken,
  getAuthToken,
} from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // On mount, check for an existing token (set via env or login)
  useEffect(() => {
    const existing = getAuthToken();
    if (existing && existing.length > 0) {
      setToken(existing);
    }
    setIsReady(true);
  }, []);

  const login = useCallback((newToken) => {
    setAuthToken(newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setToken(null);
  }, []);

  const value = {
    token,
    isAuthenticated: !!token,
    login,
    logout,
    isReady,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
