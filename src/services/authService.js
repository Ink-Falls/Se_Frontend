// src/services/authService.js
import { API_BASE_URL } from '../utils/constants';
import tokenService from './tokenService';
import fetchWithInterceptor from './apiService';
import { handleAuthError } from '../utils/errorHandler';

/**
 * Handles user login.
 *
 * @async
 * @function loginUser
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @param {string} captchaResponse - The reCAPTCHA response token.
 * @returns {Promise<object>} - An object containing the user's authentication token, or an error.
 * @throws {Error} - If the login request fails.
 */
const loginUser = async (email, password, captchaResponse) => {
  console.log('🔑 Attempting login for:', email); 
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, captchaResponse }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'Login failed'
      };
    }

    // Ensure we have both token and user data
    if (!data.token || !data.user) {
      throw new Error('Invalid server response - missing token or user data');
    }

    // Save tokens
    await tokenService.saveTokens(data.token, data.refreshToken);
    tokenService.setupAutoRefresh();
    
    // Save full user data
    localStorage.setItem('user', JSON.stringify(data.user));

    // Verify token storage
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      throw new Error('Failed to save tokens to storage');
    }

    console.log('✅ Login successful, tokens stored');
    return data;
  } catch (error) {
    console.error('❌ Login or token storage failed:', error);
    // Clean up any partial storage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    throw error;
  }
};

/**
 * Handles user logout.
 *
 * @async
 * @function logoutUser
 * @returns {Promise<void>}
 * @throws {Error} - If the logout request fails.
 */
const logoutUser = async () => {
  console.log('🚪 Attempting logout');
  try {
    const token = tokenService.getAccessToken();
    if (!token) {
      throw new Error('No active session');
    }

    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw {
        status: response.status,
        message: 'Logout failed'
      };
    }

    // Clear all auth data even if API call fails
    await tokenService.removeTokens();
    tokenService.clearAutoRefresh();
    localStorage.clear();
    sessionStorage.clear();

    console.log('✅ Logout successful');
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    // Still clear tokens on error
    await tokenService.removeTokens();
    tokenService.clearAutoRefresh();
    localStorage.clear();
    sessionStorage.clear();
    
    console.error('❌ Logout failed:', error);
    const errorMessage = handleAuthError(error);
    throw new Error(errorMessage);
  }
};

/**
 * Handles forgot password request.
 *
 * @async
 * @function forgotPassword
 * @param {string} email - The user's email address.
 * @returns {Promise<object>} - A response message or error.
 * @throws {Error} - If the request fails.
 */
const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData?.error?.message || "Failed to send password reset email.";
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    throw new Error(error.message || "Network error. Please check your connection.");
  }
};

/**
 * Verifies the reset code sent to the user's email.
 *
 * @async
 * @function verifyResetCode
 * @param {string} email - The user's email address.
 * @param {string} code - The verification code sent to the user's email.
 * @returns {Promise<object>} - A success message or error response.
 * @throws {Error} - If the verification fails.
 */
const verifyResetCode = async (email, code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/verify-reset-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData?.error?.message || "Invalid or expired reset code.";
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    throw new Error(error.message || "Network error. Please check your connection.");
  }
};

/**
 * Resets the user's password.
 *
 * @async
 * @function resetPassword
 * @param {string} email - The user's email address.
 * @param {string} password - The new password.
 * @returns {Promise<object>} - A response message or error.
 * @throws {Error} - If the password reset fails.
 */
const resetPassword = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || "Failed to reset password.");
    }

    return responseData;
  } catch (error) {
    throw new Error(error.message || "Network error. Please check your connection.");
  }
};

export { 
  loginUser, 
  logoutUser, 
  forgotPassword, 
  verifyResetCode,
  resetPassword
};