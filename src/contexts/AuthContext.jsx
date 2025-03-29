import React, { createContext, useState, useContext, useEffect } from 'react';
import tokenService from '../services/tokenService';
import { logoutUser } from '../services/authService';

const AuthContext = createContext(null);

// Main component as named export
export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    userRole: null,
    loading: true
  });
  
  // Handle rate limit events 
  useEffect(() => {
    const handleRateLimit = (event) => {
      console.warn(event.detail.message);
    };
    
    window.addEventListener('rateLimitExceeded', handleRateLimit);
    return () => {
      window.removeEventListener('rateLimitExceeded', handleRateLimit);
    };
  }, []);

  const checkAuth = async () => {
    try {
      // Using tokenService.validateAuth instead of validateToken
      const result = await tokenService.validateAuth();
      
      // Handle null or undefined result
      if (result && result.valid && result.user) {
        setAuthState({
          isAuthenticated: true,
          user: result.user,
          userRole: result.user.role,
          loading: false
        });
        
        // Return the result directly
        return result;
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          userRole: null,
          loading: false
        });
        // Return null for invalid authentication
        return null;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        userRole: null,
        loading: false
      });
      throw error; // Re-throw the error to let caller handle it
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
        userRole: null,
        loading: false
      });
      
      window.location.href = '/login';
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
        userRole: null,
        loading: false
      });
      
      window.location.href = '/login';
      throw error;
    }
  };

  // Setup inactivity timer
  useEffect(() => {
    let inactivityTimer;
    
    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      
      // Logout after 30 minutes of inactivity
      inactivityTimer = setTimeout(() => {
        if (authState.isAuthenticated) {
          logout();
        }
      }, 30 * 60 * 1000); // 30 minutes
    };
    
    // Listen for user activity
    const userActivityHandler = () => {
      resetTimer();
    };
    
    // Set initial timer
    resetTimer();
    
    // Add event listeners for user activity
    document.addEventListener('mousedown', userActivityHandler);
    document.addEventListener('keypress', userActivityHandler);
    document.addEventListener('touchstart', userActivityHandler);
    
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      document.removeEventListener('mousedown', userActivityHandler);
      document.removeEventListener('keypress', userActivityHandler);
      document.removeEventListener('touchstart', userActivityHandler);
    };
  }, [authState.isAuthenticated]);

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