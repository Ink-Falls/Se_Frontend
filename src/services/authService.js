// src/services/authService.js
import { API_BASE_URL } from '../utils/constants';

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
    const response = await fetch(`${API_BASE_URL}/auth/login`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

    return await response.json();
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
    if (!token) {
      // No token?  They're already logged out (in a sense).  Don't throw an error.
      return;
    }

    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the token for authentication
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Logout failed");
    }
    // Server should invalidate the token on its end.  We don't need to return anything.

  } catch (error) {
      if (error.message) {
        throw error; //re-throw error caught from response
     }
     else{
        throw new Error("Network error.  Please check your connection."); // Network or other error
     }
  }
};

export { loginUser, logoutUser };