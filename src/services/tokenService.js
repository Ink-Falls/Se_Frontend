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
  // Add rate limiting protection
  #lastRequestTime = 0;
  #minRequestInterval = 1000; // 1 second minimum between requests

  async #checkRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.#lastRequestTime;
    
    if (timeSinceLastRequest < this.#minRequestInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.#minRequestInterval - timeSinceLastRequest)
      );
    }
    
    this.#lastRequestTime = Date.now();
  }

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

  // Secure token storage
  /**
   * Saves tokens to both HTTP-only cookies and local storage
   * @param {string} accessToken 
   * @param {string} refreshToken 
   */
  async saveTokens(accessToken, refreshToken) {
    try {
      // Store tokens in HTTP-only cookies via backend
      await fetch(`${API_BASE_URL}/auth/cookies`, {
        method: 'POST',
        credentials: 'include', // Enables HTTP-only cookie handling
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken, refreshToken }),
      });

      // Also store in localStorage as backup
      localStorage.setItem('token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    } catch (error) {
      console.error('Error setting tokens:', error);
      throw error;
    }
  }

  // Proper token cleanup
  /**
   * Removes all tokens from storage
   */
  async removeTokens() {
    try {
      await this.#checkRateLimit();
      
      // Clear server-side session
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      // Clear client-side storage
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error('Error removing tokens:', error);
      // Still clear local storage even if server request fails
      localStorage.clear();
      sessionStorage.clear();
    }
  }
  
  // Token expiration checking
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
    try {
      await this.#checkRateLimit();

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After')) || 60;
        throw new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
      }

      if (!response.ok) throw new Error('Token refresh failed');

      const data = await response.json();
      await this.saveTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }
}

export default new TokenService();
