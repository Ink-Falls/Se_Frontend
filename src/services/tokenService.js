/**
 * @module tokenService
 * @description Service for managing authentication tokens
 */
import { API_BASE_URL } from '../utils/constants';

const REFRESH_THRESHOLD_MINUTES = 15; // Update to match token expiration time

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

  // Add refresh lock mechanism
  #isRefreshing = false;
  #refreshSubscribers = [];

  #onRefreshComplete(error, token) {
    this.#refreshSubscribers.forEach(callback => callback(error, token));
    this.#refreshSubscribers = [];
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

      // Save access token
      localStorage.setItem('token', accessToken);
      
      // Only update refresh token if provided
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Verify token was saved
      const verifyToken = localStorage.getItem('token');
      if (!verifyToken) {
        throw new Error('Token storage verification failed');
      }

      // console.log('🔑 Tokens saved successfully:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
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
      
      const token = this.getAccessToken();
      // Only attempt server logout if we have a valid token
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
        } catch (error) {
          console.warn('Server logout failed:', error);
        }
      }

      // Always clear local storage
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear storage on error
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
    if (!token) {
      // console.log('⚠️ No token found during expiration check');
      return true;
    }

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      const expiresIn = (payload.exp * 1000) - Date.now();
      const expired = expiresIn < (5 * 60 * 1000);
      
      if (expired) {
        // console.log('🕒 Token will expire in', Math.round(expiresIn/1000), 'seconds');
      }
      
      return expired;
    } catch (e) {
      console.error('❌ Error checking token expiration:', e);
      return true;
    }
  }

  /**
   * Manual token refresh - used when token is explicitly detected as expired
   */
  async refreshToken() {
    // console.log('🔄 Attempting token refresh...');
    try {
      // If already refreshing, wait for completion
      if (this.#isRefreshing) {
        // console.log('⏳ Token refresh already in progress, waiting...');
        return new Promise((resolve, reject) => {
          this.#refreshSubscribers.push((error, token) => {
            if (error) reject(error);
            else resolve(token);
          });
        });
      }

      this.#isRefreshing = true;
      await this.#checkRateLimit();

      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      await this.saveTokens(data.accessToken, data.refreshToken || refreshToken);
      
      this.#onRefreshComplete(null, data.accessToken);
      // console.log('✅ Token refresh successful');
      return data.accessToken;

    } catch (error) {
      this.#onRefreshComplete(error, null);
      console.error('❌ Token refresh failed:', error);
      throw error;
    } finally {
      this.#isRefreshing = false;
    }
  }

  /**
   * Sets up automatic background token refresh
   * This runs periodically to prevent token expiration
   */
  setupAutoRefresh() {
    // console.log('🎯 Setting up auto refresh');
    const REFRESH_INTERVAL = 5 * 60 * 1000; // Check every 12 minutes to refresh before expiration
    // console.log('🔄 Setting up auto refresh every 12 minutes');
    
    // Clear any existing refresh interval
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
    }
    
    // Set up new refresh interval
    this._refreshInterval = setInterval(async () => {
      try {
        const currentTime = new Date().toLocaleTimeString();
        // console.log(`⏰ Auto refresh check at ${currentTime}`);
        
        // Only proceed if there's a valid refresh token
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
          // console.log('⚠️ No refresh token found, clearing auto refresh');
          this.clearAutoRefresh();
          return;
        }

        // Use validateAuth to check token validity
        const validationResult = await this.validateAuth();
        if (!validationResult.valid) {
          // console.log('🔑 Token invalid, initiating refresh...');
          await this.refreshToken();
          // console.log('✅ Auto refresh completed successfully');
        } else {
          // console.log('✨ Token is still valid, no refresh needed');
        }
      } catch (error) {
        console.error('❌ Auto refresh failed:', error);
        if (error.message.includes('token')) {
          this.clearAutoRefresh();
        }
      }
    }, REFRESH_INTERVAL);

    // Initial validation check
    this.validateAuth().then(({ valid }) => {
      if (!valid) {
        // console.log('🚀 Performing initial token refresh');
        this.refreshToken().catch(error => {
          console.error('Initial refresh failed:', error);
          if (error.message.includes('token')) {
            this.clearAutoRefresh();
          }
        });
      }
    });
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
    // console.log('🔍 Validating authentication state...');
    try {
      const token = this.getAccessToken();
      if (!token) {
        // console.log('⚠️ No token found during validation');
        return { valid: false, user: null };
      }

      await this.#checkRateLimit();
      
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Add credentials support
      });

      if (response.status === 401) {
        // Try to refresh the token if unauthorized
        try {
          await this.refreshToken();
          // Retry validation with new token
          const newToken = this.getAccessToken();
          const retryResponse = await fetch(`${API_BASE_URL}/auth/validate`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          
          if (!retryResponse.ok) {
            throw new Error('Validation failed after token refresh');
          }
          
          const retryData = await retryResponse.json();
          return {
            valid: retryData.isValid || false,
            user: retryData.user || null
          };
        } catch (refreshError) {
          await this.removeTokens();
          return { valid: false, user: null };
        }
      }

      if (!response.ok) {
        throw new Error('Token validation failed');
      }

      const data = await response.json();
      // console.log('✅ Auth validation successful');
      return {
        valid: data.isValid || false,
        user: data.user || null
      };
    } catch (error) {
      console.error('❌ Auth validation failed:', error);
      if (error.message.includes('token')) {
        await this.removeTokens();
      }
      return { valid: false, user: null };
    }
  }
}

export default new TokenService();
