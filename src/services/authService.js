import { API_BASE_URL } from '../utils/constants';
import tokenService from './tokenService';
import { apiClient } from './apiClient';

const loginUser = async (email, password, captchaResponse) => {
  try {
    const data = await apiClient.request('/auth/login', {
      method: 'POST',
      body: { email, password, captchaResponse },
      requiresAuth: false,
      credentials: 'include' // For session cookies if used by backend
    });
    
    // Directly save tokens without the cookies endpoint
    if (data.token || data.accessToken) {
      await tokenService.saveTokens(
        data.token || data.accessToken,
        data.refreshToken
      );
    } else {
      throw new Error('No token received from server');
    }
    
    return data;
  } catch (error) {
    if (error.message === 'Unauthorized') {
      throw new Error('Invalid credentials');
    } else if (error.message === 'Forbidden') {
      throw new Error('Captcha verification failed');
    }
    throw error;
  }
};

const logoutUser = async () => {
  try {
    await apiClient.request('/auth/logout', {
      method: 'POST',
      headers: {
        credentials: 'include'
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  } finally {
    // Always clear tokens locally
    tokenService.removeTokens();
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
};

const forgotPassword = async (email) => {
  try {
    return await apiClient.request('/users/forgot-password', {
      method: 'POST',
      body: { email },
      requiresAuth: false
    });
  } catch (error) {
    throw new Error(error.message || "Failed to send password reset email.");
  }
};

const verifyResetCode = async (email, code) => {
  try {
    return await apiClient.request('/users/verify-reset-code', {
      method: 'POST',
      body: { email, code },
      requiresAuth: false
    });
  } catch (error) {
    throw new Error(error.message || "Invalid or expired reset code.");
  }
};

const resetPassword = async (email, password) => {
  try {
    return await apiClient.request('/users/reset-password', {
      method: 'POST',
      body: { email, password },
      requiresAuth: false
    });
  } catch (error) {
    throw new Error(error.message || "Failed to reset password.");
  }
};

const validateToken = async () => {
  try {
    return await apiClient.request('/auth/validate', {
      method: 'GET'
    });
  } catch (error) {
    throw new Error(error.message || 'Token validation failed');
  }
};

const refreshUserToken = async (refreshToken) => {
  try {
    const data = await apiClient.request('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      requiresAuth: false
    });

    tokenService.saveTokens(data.accessToken, data.refreshToken);
    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to refresh token');
  }
};

export { 
  loginUser, 
  logoutUser, 
  forgotPassword, 
  verifyResetCode, 
  resetPassword, 
  validateToken, 
  refreshUserToken 
};