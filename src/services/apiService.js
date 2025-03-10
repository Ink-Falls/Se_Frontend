/**
 * @module apiService
 * @description Handles API requests with automatic token refresh and request queue management
 */

import tokenService from './tokenService';

const RATE_LIMIT = {
  MAX_REQUESTS: 50,
  TIME_WINDOW: 60000, // 1 minute
  RETRY_AFTER: 5000
};

const CIRCUIT_BREAKER = {
  FAILURE_THRESHOLD: 5,
  RESET_TIMEOUT: 30000
};

let isRefreshing = false;
let failedQueue = [];
let requestCount = 0;
let requestTimestamp = Date.now();
let failureCount = 0;
let circuitOpen = false;
let circuitTimer = null;

/**
 * Process queued requests after token refresh
 * @param {Error|null} error - Error from token refresh attempt
 * @param {string|null} token - New access token if refresh successful
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Handles token refresh and retries the original request
 * @async
 * @param {string} url - The URL to make the request to
 * @param {Object} options - Fetch API options
 * @returns {Promise<Response>} Fetch API Response object
 * @throws {Error} If token refresh fails
 */
const handleTokenRefresh = async (url, options) => {
  if (isRefreshing) {
    // Wait for the ongoing refresh to complete
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then(token => {
      options.headers['Authorization'] = `Bearer ${token}`;
      return fetchWithInterceptor(url, { ...options, _retry: true });
    });
  }

  isRefreshing = true;
  try {
    const newToken = await tokenService.refreshToken();
    isRefreshing = false;
    processQueue(null, newToken);
    options.headers['Authorization'] = `Bearer ${newToken}`;
    return fetchWithInterceptor(url, { ...options, _retry: true });
  } catch (error) {
    isRefreshing = false;
    processQueue(error, null);
    tokenService.removeTokens();
    window.location.href = '/login';
    throw error;
  }
};

/**
 * Makes an HTTP request with automatic token refresh capabilities
 * @async
 * @param {string} url - The URL to make the request to
 * @param {Object} [options={}] - Fetch API options
 * @param {string} [options.method] - HTTP method
 * @param {Object} [options.headers] - Request headers
 * @param {boolean} [options._retry] - Internal flag to prevent infinite refresh loops
 * @returns {Promise<Response>} Fetch API Response object
 * @throws {Error} If request fails or token refresh fails
 */
const fetchWithInterceptor = async (url, options = {}) => {
  // Adds custom Authorization header that same-origin policies prevent other sites from adding
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };
  
  try {
    // Circuit breaker check
    if (circuitOpen) {
      throw new Error('Circuit breaker is open. Too many failed requests.');
    }

    // Rate limiting check
    const now = Date.now();
    if (now - requestTimestamp > RATE_LIMIT.TIME_WINDOW) {
      resetRequestCount();
    }
    
    if (requestCount >= RATE_LIMIT.MAX_REQUESTS) {
      window.dispatchEvent(new CustomEvent('rateLimitExceeded', {
        detail: { message: `Rate limit exceeded. Try again in ${RATE_LIMIT.RETRY_AFTER/1000}s` }
      }));
      throw new Error('Rate limit exceeded');
    }
    
    requestCount++;

    // Add credentials for cookie handling
    options.credentials = 'include';

    // Check if token is expired and refresh if needed
    if (tokenService.isTokenExpired()) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await tokenService.refreshToken();
          isRefreshing = false;
          processQueue(null, newToken);
        } catch (error) {
          isRefreshing = false;
          processQueue(error, null);
          tokenService.removeTokens();
          window.location.href = '/login';
          throw error;
        }
      } else {
        // Wait for the ongoing refresh to complete
        await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      }
    }

    // Add Authorization header
    const token = tokenService.getAccessToken();
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }

    // Make the request
    const response = await fetch(url, options);

    // Enhanced error handling
    if (!response.ok) {
      failureCount++;
      
      if (failureCount >= CIRCUIT_BREAKER.FAILURE_THRESHOLD) {
        circuitOpen = true;
        circuitTimer = setTimeout(() => {
          resetCircuitBreaker();
        }, CIRCUIT_BREAKER.RESET_TIMEOUT);
      }

      const errorData = await response.json();
      
      switch (response.status) {
        case 400:
          throw new Error(errorData.message || 'Invalid request');
        case 401:
          await handleTokenRefresh(url, options);
          break;
        case 403:
          window.dispatchEvent(new CustomEvent('authError', { 
            detail: { type: 'forbidden', message: 'Access denied' }
          }));
          throw new Error('Access forbidden');
        case 404:
          window.dispatchEvent(new CustomEvent('apiError', {
            detail: { type: 'notFound', message: 'Resource not found' }
          }));
          throw new Error('Resource not found');
        case 429:
          const retryAfter = parseInt(response.headers.get('Retry-After')) * 1000 || RATE_LIMIT.RETRY_AFTER;
          window.dispatchEvent(new CustomEvent('rateLimitError', {
            detail: { retryAfter, message: `Rate limit exceeded. Try again in ${retryAfter/1000}s` }
          }));
          
          // Auto-retry after delay
          await new Promise(resolve => setTimeout(resolve, retryAfter));
          return fetchWithInterceptor(url, options);
        case 500:
        case 502:
        case 503:
        case 504:
          window.dispatchEvent(new CustomEvent('serverError', {
            detail: { status: response.status, message: 'Server error' }
          }));
          throw new Error('Server error, please try again later');
        default:
          throw new Error(errorData.message || 'Request failed');
      }
    }

    // Reset failure count on success
    failureCount = 0;
    return response;
  } catch (error) {
    // Network error handling
    if (!navigator.onLine) {
      window.dispatchEvent(new CustomEvent('networkError', {
        detail: { message: 'No internet connection' }
      }));
      throw new Error('No internet connection');
    }

    // Retry logic for certain errors
    if (error.message.includes('Server error') && !options._retryCount) {
      options._retryCount = (options._retryCount || 0) + 1;
      if (options._retryCount <= 3) {
        await new Promise(resolve => setTimeout(resolve, 1000 * options._retryCount));
        return fetchWithInterceptor(url, options);
      }
    }

    throw error;
  }
};

const resetRequestCount = () => {
  requestCount = 0;
  requestTimestamp = Date.now();
};

const resetCircuitBreaker = () => {
  circuitOpen = false;
  failureCount = 0;
  if (circuitTimer) clearTimeout(circuitTimer);
};

// Add request debouncing helper
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    return new Promise((resolve) => {
      timeout = setTimeout(() => resolve(func(...args)), wait);
    });
  };
};

// Export debounced version for non-critical requests
export const debouncedFetch = debounce(fetchWithInterceptor, 300);

export default fetchWithInterceptor;
