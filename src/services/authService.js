// src/services/authService.js
import { API_BASE_URL } from '../utils/constants';
import tokenService from './tokenService';
import fetchWithInterceptor from './apiService';

const handleAuthErrors = (status, data) => {
  switch (status) {
    case 401:
      return 'Invalid credentials. Please check your email and password.';
    case 402:
      return 'Payment required. Please update your subscription.';
    case 403:
      return 'Account locked or inactive. Please contact support.';
    case 404:
      return 'Account not found. Please check your email or register.';
    case 429:
      return 'Too many login attempts. Please try again later.';
    default:
      return data.message || 'Login failed. Please try again.';
  }
};

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
  // console.log('🔑 Attempting login for:', email);
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, captchaResponse })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(handleAuthErrors(response.status, data));
    }

    if (!data.token || !data.user) {
      throw new Error('Invalid server response');
    }

    // Save tokens first
    await tokenService.saveTokens(data.token, data.refreshToken);
    
    // Save user data only after tokens are saved
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Setup auto refresh only after successful login
    tokenService.setupAutoRefresh();

    // console.log('✅ Login successful:', { hasToken: !!data.token, hasUser: !!data.user });
    return data;
  } catch (error) {
    console.error('❌ Login failed:', error);
    await tokenService.removeTokens();
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
  try {
    // Clear auto refresh first
    tokenService.clearAutoRefresh();

    // Get token before clearing storage
    const token = tokenService.getAccessToken();
    
    // Clear all storage 
    localStorage.clear();
    sessionStorage.clear();

    // Only attempt server logout if token exists and appears valid
    if (token && token.split('.').length === 3) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
      } catch (serverError) {
        // Ignore server errors during logout since local cleanup is done
        console.warn('Server logout notification failed:', serverError);
      }
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Ensure storage is cleared even if there's an error
    localStorage.clear();
    sessionStorage.clear();
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
const resetPassword = async (email, newPassword, confirmPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, newPassword, confirmPassword }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData?.error?.message || "Failed to reset password.";
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    throw new Error(error.message || "Network error. Please check your connection.");
  }
};

/**
 * Changes the user's password.
 *
 * @async
 * @function changePassword
 * @param {string} userId - The user's ID.
 * @param {string} oldPassword - The current password.
 * @param {string} newPassword - The new password.
 * @param {string} confirmPassword - The new password confirmation.
 * @returns {Promise<object>} - A response message or error.
 * @throws {Error} - If the password change fails.
 */
const changePassword = async (userId, oldPassword, newPassword, confirmPassword) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}/change-password`, {
      method: 'PUT', // Use PUT since the route is defined as PUT
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData?.error?.message || "Failed to change password.";
      throw new Error(errorMessage);
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
  resetPassword,
  changePassword,
};