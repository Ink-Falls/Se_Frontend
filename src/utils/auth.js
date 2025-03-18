import { API_BASE_URL } from './constants';
import tokenService from '../services/tokenService';

// Simple cache duration
const CACHE_DURATION = 10000; // 10 seconds

const validateAuthStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    // Check cache
    const cached = sessionStorage.getItem('auth_validation');
    if (cached) {
      const { value, expiry } = JSON.parse(cached);
      if (expiry > Date.now()) {
        return value;
      }
      sessionStorage.removeItem('auth_validation');
    }

    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      return false;
    }

    const isValid = response.ok;

    // Cache the result
    sessionStorage.setItem('auth_validation', JSON.stringify({
      value: isValid,
      expiry: Date.now() + CACHE_DURATION
    }));

    return isValid;
  } catch (error) {
    console.error('Auth validation error:', error);
    return false;
  }
};

// Simplified to just use the validation function
const isAuthenticated = async () => {
  try {
    return await validateAuthStatus();
  } catch {
    return false;
  }
};

const clearAuthData = async () => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
};

const getUserRole = () => {
  try {
    const token = tokenService.getAccessToken();
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Export all functions together in one statement
export {
  isAuthenticated, clearAuthData,
  getUserRole
};
