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
   * Saves tokens to local storage
   * @param {string} accessToken 
   * @param {string} refreshToken 
   */
  async saveTokens(accessToken, refreshToken) {
    try {
      if (!accessToken) {
        throw new Error('Access token is required');
      }

      localStorage.setItem('token', accessToken);
      
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Verify storage
      const verifyToken = localStorage.getItem('token');
      if (!verifyToken) {
        throw new Error('Token storage verification failed');
      }

      console.log('✅ Tokens saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Token storage error:', error);
      // Clean up on error
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
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
   * Single source of truth for token expiration checking
   */
  isTokenExpired() {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      // Check if token will expire within next 5 minutes
      return payload.exp * 1000 < Date.now() + (5 * 60 * 1000);
    } catch (e) {
      return true;
    }
  }

  /**
   * Manual token refresh - used when token is explicitly detected as expired
   */
  async refreshToken() {
    console.log('🔄 Attempting token refresh');
    try {
      await this.#checkRateLimit();

      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.removeTokens();
          window.location.href = '/login';
        }
        throw new Error('Failed to refresh token');
      }

      const { token } = await response.json(); // Changed to match API response
      await this.saveTokens(token, refreshToken); // Keep existing refresh token
      console.log('✅ Token refresh successful');
      return token;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      await this.removeTokens();
      throw error;
    }
  }

  /**
   * Sets up automatic background token refresh
   * This runs periodically to prevent token expiration
   */
  setupAutoRefresh() {
    const REFRESH_INTERVAL = 15 * 60 * 1000; // Check every 15 minutes
    
    // Clear any existing refresh interval
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
    }
    
    // Set up new refresh interval
    this._refreshInterval = setInterval(async () => {
      try {
        if (this.isTokenExpired()) {
          await this.refreshToken();
        }
      } catch (error) {
        console.error('Auto refresh failed:', error);
        // If auto-refresh fails multiple times, could trigger re-login
      }
    }, REFRESH_INTERVAL);

    // Initial check
    if (this.isTokenExpired()) {
      this.refreshToken().catch(console.error);
    }
  }

  // Clean up refresh interval when needed
  clearAutoRefresh() {
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
      this._refreshInterval = null;
    }
  }

  /**
   * Validates the current authentication status
   * @returns {Promise<{valid: boolean, user: object|null}>}
   */
  async validateAuth() {
    console.log('🔍 Validating authentication');
    try {
      const token = this.getAccessToken();
      if (!token) {
        console.log('No token found during validation');
        return { valid: false, user: null };
      }

      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Validation response:', data);

      return {
        valid: response.ok,
        user: data.user || null
      };
    } catch (error) {
      console.error('❌ Auth validation failed:', error);
      return { valid: false, user: null };
    }
  }
}

export default new TokenService();
