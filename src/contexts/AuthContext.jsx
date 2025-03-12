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
      const result = await validateToken();
      setIsAuthenticated(true);
      setUserRole(result.role);
    } catch (error) {
      if (error.message?.includes('Rate limit exceeded')) {
        // Don't change authentication state if rate limited
        console.warn('Rate limit reached during auth check');
        return;
      }
      setIsAuthenticated(false);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    tokenService.removeTokens();
    setIsAuthenticated(false);
    setUserRole(null);
    window.location.href = '/login';
  };

  useEffect(() => {
    checkAuth();

    // Set up activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) =>
      document.addEventListener(event, resetInactivityTimer)
    );

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach((event) =>
        document.removeEventListener(event, resetInactivityTimer)
      );
    };
  }, []);

  // Add rate limit event listener
  useEffect(() => {
    const handleRateLimit = (event) => {
      console.warn(event.detail.message);
      // Optionally show a user-friendly notification
    };

    window.addEventListener('rateLimitExceeded', handleRateLimit);
    return () =>
      window.removeEventListener('rateLimitExceeded', handleRateLimit);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        loading,
        checkAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
