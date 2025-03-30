import React, { createContext, useState, useContext, useEffect } from 'react';
import tokenService from '../services/tokenService';
import { logoutUser } from '../services/authService'; // Add this import

const AuthContext = createContext(null);

// Main component as named export
export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    userRole: null,
    loading: true
  });

  const checkAuth = async () => {
    try {
      const result = await tokenService.validateAuth();
  
      // Handle both object and boolean responses
      const isValid = typeof result === 'object' ? result.valid : result;
      const userData = typeof result === 'object' ? result.user : null;
  
      // Update auth state
      setAuthState({
        isAuthenticated: !!isValid,
        user: userData,
        loading: false,
      });
  
      return {
        valid: !!isValid,
        user: userData,
      };
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
      return { valid: false, user: null };
    }
  };

  const logout = async () => {
    try {
      // Don't set loading state for logout
      await logoutUser();
      await tokenService.removeTokens();
      tokenService.clearAutoRefresh();
      localStorage.clear();
      sessionStorage.clear();
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
      
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear everything on error
      await tokenService.removeTokens();
      tokenService.clearAutoRefresh();
      localStorage.clear();
      sessionStorage.clear();
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
      
      throw error;
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
}

// Hook as named export
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// No default export