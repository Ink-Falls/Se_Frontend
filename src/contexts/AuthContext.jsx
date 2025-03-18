import React, { createContext, useState, useContext, useEffect } from 'react';
import { validateAuth } from '../services/authService';
import tokenService from '../services/tokenService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  const checkAuth = async () => {
    try {
      // First check if we have user data in localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (!token || !storedUser) {
        setAuthState({ isAuthenticated: false, user: null, loading: false });
        return;
      }

      const result = await validateAuth();
      setAuthState({
        isAuthenticated: true,
        user: storedUser,
        loading: false
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      await tokenService.removeTokens();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Ensure state is cleared even if server request fails
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      ...authState,
      checkAuth,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);