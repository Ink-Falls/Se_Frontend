// src/services/authService.js
import { API_BASE_URL } from "../utils/constants";
import tokenService from "./tokenService";
import fetchWithInterceptor from "./apiService";

const handleAuthErrors = (status, data) => {
  switch (status) {
    case 401:
      return "Invalid credentials. Please check your email and password.";
    case 402:
      return "Payment required. Please update your subscription.";
    case 403:
      return "Account locked or inactive. Please contact support.";
    case 404:
      return "Account not found. Please check your email or register.";
    case 429:
      return "Too many login attempts. Please try again later.";
    default:
      return data.message || "Login failed. Please try again.";
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
    const response = await fetchWithInterceptor(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, captchaResponse }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(handleAuthErrors(response.status, data));
    }

    if (!data.token || !data.user) {
      throw new Error("Invalid server response");
    }

    // Save tokens first
    await tokenService.saveTokens(data.token, data.refreshToken);

    // Save user data only after tokens are saved
    localStorage.setItem("user", JSON.stringify(data.user));

    // Setup auto refresh only after successful login
    tokenService.setupAutoRefresh();

    // console.log('✅ Login successful:', { hasToken: !!data.token, hasUser: !!data.user });
    return data;
  } catch (error) {
    console.error("❌ Login failed:", error);
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
    const token = localStorage.getItem("token");

    // Clear storage immediately
    localStorage.clear();
    sessionStorage.clear();

    // Clear all ongoing assessment data
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("ongoing_assessment_")) {
        localStorage.removeItem(key);
      }
    });

    // Skip server logout if no token
    if (!token) {
      return true;
    }

    // Try server logout but don't retry on failure
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      // Ignore server errors since we've already cleared local storage
      console.warn("Server logout failed:", error);
    }

    return true;
  } catch (error) {
    // Ensure storage is cleared even if there's an error
    localStorage.clear();
    sessionStorage.clear();
    return true;
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
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/users/forgot-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage =
        responseData?.error?.message || "Failed to send password reset email.";
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    throw new Error(
      error.message || "Network error. Please check your connection."
    );
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
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/users/verify-reset-code`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage =
        responseData?.error?.message || "Invalid or expired reset code.";
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    throw new Error(
      error.message || "Network error. Please check your connection."
    );
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
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/users/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword, confirmPassword }),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage =
        responseData?.error?.message || "Failed to reset password.";
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    throw new Error(
      error.message || "Network error. Please check your connection."
    );
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
const changePassword = async (
  userId,
  oldPassword,
  newPassword,
  confirmPassword
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/users/${userId}/change-password`,
      {
        method: "PUT", // Use PUT since the route is defined as PUT
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage =
        responseData?.error?.message || "Failed to change password.";
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    throw new Error(
      error.message || "Network error. Please check your connection."
    );
  }
};

/**
 * Requests a magic link to be sent to the user's email.
 *
 * @async
 * @function requestMagicLink
 * @param {string} email - The user's email address
 * @returns {Promise<object>} - A success message
 * @throws {Error} - If the request fails
 */
const requestMagicLink = async (email) => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/auth/passwordless/magic-link`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage =
        responseData?.error?.message || "Failed to send magic link";
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    throw new Error(
      error.message || "Network error. Please check your connection."
    );
  }
};

/**
 * Requests a numeric code for student login.
 *
 * @async
 * @function requestNumericCode
 * @param {string} studentEmail - The student's email address
 * @returns {Promise<object>} - Response with numeric code and QR code data
 * @throws {Error} - If the request fails
 */
const requestNumericCode = async (studentEmail) => {
  try {
    const token = tokenService.getAccessToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/auth/passwordless/numeric-code`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: studentEmail }),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage =
        responseData?.error?.message || "Failed to generate student login code";
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    throw new Error(
      error.message || "Network error. Please check your connection."
    );
  }
};

/**
 * Requests a picture code sequence for very young student login.
 *
 * @async
 * @function requestPictureCode
 * @param {string} studentEmail - The student's email address
 * @returns {Promise<object>} - Response with picture code sequence data
 * @throws {Error} - If the request fails
 */
const requestPictureCode = async (studentEmail) => {
  try {
    const token = tokenService.getAccessToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/auth/passwordless/picture-code`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: studentEmail }),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage =
        responseData?.error?.message || "Failed to generate picture login code";
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    throw new Error(
      error.message || "Network error. Please check your connection."
    );
  }
};

/**
 * Verifies a magic link token and logs the user in.
 *
 * @async
 * @function verifyMagicLinkToken
 * @param {string} token - The token from the magic link
 *  * @param {string} [tokenType="magic_link"] - The type of token being verified
 * @returns {Promise<object>} - User data and tokens
 * @throws {Error} - If the verification fails
 */
const verifyMagicLinkToken = async (token, tokenType = "magic_link") => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/auth/passwordless/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          tokenType,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Token verification failed");
    }

    if (!data.token || !data.user) {
      throw new Error("Invalid server response");
    }

    // Save tokens
    await tokenService.saveTokens(data.token, data.refreshToken);

    // Save user data
    localStorage.setItem("user", JSON.stringify(data.user));

    // Setup auto refresh
    tokenService.setupAutoRefresh();

    return data;
  } catch (error) {
    await tokenService.removeTokens();
    throw error;
  }
};

export {
  loginUser,
  logoutUser,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  changePassword,
  requestMagicLink,
  verifyMagicLinkToken,
  requestNumericCode,
  requestPictureCode,
};
