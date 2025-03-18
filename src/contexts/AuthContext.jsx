import React, { createContext, useState, useContext, useEffect } from 'react';
import tokenService from '../services/tokenService';
import { validateToken } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimeout = 30 * 60 * 1000; // 30 minutes
  let inactivityTimer;

  const resetInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(handleInactivity, inactivityTimeout);
  };

  const handleInactivity = () => {
    logout();
  };

  const checkAuth = async () => {
    try {
      const result = await validateAuth();
      if (result.valid) {
        setIsAuthenticated(true);
        setUserRole(result.user?.role);
      } else {
        // Don't change auth state if rate limited
        if (!result.rateLimited) {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      if (!error.message?.includes('Rate limit')) {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Add delay
      await tokenService.removeTokens();
      setIsAuthenticated(false);
      setUserRole(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if server request fails
      tokenService.removeTokens();
      setIsAuthenticated(false);
      setUserRole(null);
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Set up activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetInactivityTimer));

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach(event => document.removeEventListener(event, resetInactivityTimer));
    };
  }, []);

  // Add rate limit event listener
  useEffect(() => {
    const handleRateLimit = (event) => {
      console.warn(event.detail.message);
      // Optionally show a user-friendly notification
    };

    window.addEventListener('rateLimitExceeded', handleRateLimit);
    return () => window.removeEventListener('rateLimitExceeded', handleRateLimit);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole, 
      loading,
      checkAuth,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);