// src/services/authService.js
import { API_BASE_URL } from '../utils/constants';
import tokenService from './tokenService';
import fetchWithInterceptor from './apiService';

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
  try {
    // CAPTCHA verification prevents automated attacks
    // Rate limiting protection (from backend)
    // Proper error handling for invalid credentials
    const response = await fetch(`${API_BASE_URL}/auth/login`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({ email, password, captchaResponse }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 400) {
        throw new Error("Invalid credentials");
      } else if (response.status === 401) {
        throw new Error("Unauthorized");
      } else if (response.status === 403) {
          throw new Error("Captcha verification failed")
      }
      else {
        throw new Error(errorData.message || "Server error");
      }
    }

    const data = await response.json();
    
    // Use the new saveTokens method
    await tokenService.saveTokens(
      data.token || data.accessToken, 
      data.refreshToken
    );
    
    return data;
  } catch (error) {
      if (error.message) {
        throw error; //re-throw error caught from response
     }
     else{
        throw new Error("Network error.  Please check your connection."); // Network or other error
     }
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
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Logout failed');
    }

    await response.json(); // Consume the response
  } catch (error) {
    console.error('Logout error:', error);
    throw error; // Re-throw to handle in UI if needed
  } finally {
    // Always clear tokens locally
    tokenService.removeTokens();
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
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

/**
 * Validates the current token.
 * 
 * @async
 * @function validateToken
 * @returns {Promise<object>} - Validation response
 * @throws {Error} - If validation fails
 */
const validateToken = async () => {
  try {
    const response = await fetchWithInterceptor(`${API_BASE_URL}/auth/validate`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error('Token validation failed');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Token validation failed');
  }
};

/**
 * Refreshes the user's token.
 * 
 * @async
 * @function refreshUserToken
 * @param {string} refreshToken - The refresh token
 * @returns {Promise<object>} - New tokens
 * @throws {Error} - If refresh fails
 */
const refreshUserToken = async (refreshToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    tokenService.saveTokens(data.accessToken, data.refreshToken);
    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to refresh token');
  }
};

export { loginUser, logoutUser, forgotPassword, verifyResetCode, resetPassword, validateToken, refreshUserToken };