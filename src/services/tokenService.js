/**
 * @module tokenService
 * @description Service for managing authentication tokens
 */

import { API_BASE_URL } from '../utils/constants';

const REFRESH_THRESHOLD_MINUTES = 5;

/**
 * Service class for managing authentication tokens
 * @class TokenService
 */
class TokenService {
  /**
   * Gets the current access token from storage
   * @returns {string|null} The access token or null if not found
   */
  getAccessToken() {
    return localStorage.getItem('token');
  }

  /**
   * Gets the current refresh token from storage
   * @returns {string|null} The refresh token or null if not found
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Saves both access and refresh tokens to storage
   * @param {string} accessToken - The access token to save
   * @param {string} [refreshToken] - The refresh token to save
   */
  saveTokens(accessToken, refreshToken) {
    localStorage.setItem('token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  /**
   * Removes all tokens from storage
   */
  removeTokens() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Checks if the current access token is expired or will expire soon
   * @returns {boolean} True if token is expired or will expire within threshold
   */
  isTokenExpired() {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      // Parse the JWT payload
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));

      // Check if token will expire within REFRESH_THRESHOLD_MINUTES
      return payload.exp * 1000 < Date.now() + (REFRESH_THRESHOLD_MINUTES * 60 * 1000);
    } catch (e) {
      return true;
    }
  }

  /**
   * Attempts to refresh the access token using the refresh token
   * @async
   * @returns {Promise<string>} The new access token
   * @throws {Error} If refresh token is missing or refresh fails
   */
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    this.saveTokens(data.accessToken, data.refreshToken); 
    return data.accessToken;
  }
}

export default new TokenService();
