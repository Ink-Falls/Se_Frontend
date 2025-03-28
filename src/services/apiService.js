/**
 * @module apiService
 * @description Handles API requests with automatic token refresh, request queue management,
 * rate limiting, circuit breaking, and request batching.
 */

import tokenService from './tokenService';

/**
 * @typedef {Object} RateLimit
 * @property {number} WINDOW - Time window for rate limiting in milliseconds (15 minutes)
 * @property {number} MAX_REQUESTS - Maximum regular requests allowed per window
 * @property {number} AUTH_MAX_REQUESTS - Maximum authentication requests allowed per window
 * @property {number} COOLDOWN_PERIOD - Delay between batch processing in milliseconds
 * @property {number} REQUEST_DELAY - Delay between individual requests in milliseconds
 * @property {number} BATCH_SIZE - Maximum number of requests to process in one batch
 * @property {Map} QUEUED_REQUESTS - Map of queued requests waiting to be processed
 */

const RATE_LIMIT = {
  WINDOW: 900000, // 15 minutes in milliseconds
  MAX_REQUESTS: 5000, // Maximum requests per window
  AUTH_MAX_REQUESTS: 50, // Maximum auth requests per window
  COOLDOWN_PERIOD: 2000, // Keep existing cooldown
  REQUEST_DELAY: 100, // Keep existing delay
  BATCH_SIZE: 10, // Keep existing batch size
  QUEUED_REQUESTS: new Map() // Keep existing queue
};

/**
 * @typedef {Object} BackoffStrategy
 * @property {number} INITIAL_DELAY - Initial delay for exponential backoff in milliseconds
 * @property {number} MAX_DELAY - Maximum delay cap for exponential backoff in milliseconds
 * @property {number} JITTER - Random jitter range to prevent thundering herd
 */

const BACKOFF_STRATEGY = {
  INITIAL_DELAY: 1000,       // Start with 1 second
  MAX_DELAY: 32000,         // Maximum delay of 32 seconds
  JITTER: 300               // Random jitter to prevent thundering herd
};

/**
 * @typedef {Object} CircuitBreaker
 * @property {number} FAILURE_THRESHOLD - Number of failures before opening circuit
 * @property {number} RESET_TIMEOUT - Time in milliseconds before attempting to close circuit
 */

const CIRCUIT_BREAKER = {
  FAILURE_THRESHOLD: 5,
  RESET_TIMEOUT: 30000
};

let requestCount = 0;
let requestTimestamp = Date.now();
let failureCount = 0;
let circuitOpen = false;
let circuitTimer = null;

/**
 * @function showAlert
 * @param {string} message - Alert message to display
 * @param {number} retryAfter - Time in milliseconds before retry is allowed
 * @description Displays a toast notification for rate limit alerts
 */
const showAlert = (message, retryAfter) => {
  const div = document.createElement('div');
  div.className = 'fixed bottom-4 right-4 max-w-md w-full bg-white rounded-lg shadow-lg border-l-4 border-[#F6BA18] p-4 z-50';
  div.innerHTML = `
    <div class="flex items-start">
      <div class="ml-3 w-full">
        <h3 class="text-sm font-medium text-gray-800">Rate Limit Exceeded</h3>
        <div class="mt-1">
          <p class="text-sm text-gray-600">${message}</p>
          <p class="text-xs text-[#F6BA18] mt-1">Try again in ${Math.ceil(retryAfter/1000)} seconds</p>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(div);
  setTimeout(() => div.remove(), retryAfter);
};

/**
 * @enum {number} REQUEST_PRIORITIES
 * @readonly
 * @description Priority levels for request queuing
 */
const REQUEST_PRIORITIES = {
  HIGH: 0,    // Auth requests - highest priority
  MEDIUM: 1,  // User data - medium priority
  LOW: 2      // Non-critical requests - lowest priority
};

/**
 * @function queueRequest
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @param {number} [priority=REQUEST_PRIORITIES.LOW] - Request priority level
 * @returns {Promise} Promise that resolves when request is processed
 * @description Queues a request with priority for later processing
 */
const queueRequest = (url, options, priority = REQUEST_PRIORITIES.LOW) => {
  const requestId = Math.random().toString(36).substring(7);
  
  return new Promise((resolve, reject) => {
    RATE_LIMIT.QUEUED_REQUESTS.set(requestId, {
      url,
      options,
      priority,
      resolve,
      reject,
      timestamp: Date.now()
    });
  });
};

/**
 * @function processQueue
 * @returns {Promise<void>}
 * @description Processes queued requests in batches based on priority and timestamp
 */
const processQueue = async () => {
  if (RATE_LIMIT.QUEUED_REQUESTS.size === 0) return;

  // Sort requests by priority and timestamp
  const sortedRequests = Array.from(RATE_LIMIT.QUEUED_REQUESTS.entries())
    .sort(([, a], [, b]) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.timestamp - b.timestamp;
    });

  // Process requests in batches
  for (let i = 0; i < Math.min(RATE_LIMIT.BATCH_SIZE, sortedRequests.length); i++) {
    const [requestId, request] = sortedRequests[i];
    
    try {
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT.REQUEST_DELAY * i));
      
      const response = await fetch(request.url, request.options);
      request.resolve(response);
    } catch (error) {
      request.reject(error);
    } finally {
      RATE_LIMIT.QUEUED_REQUESTS.delete(requestId);
    }
  }

  // Schedule next batch if there are remaining requests
  if (RATE_LIMIT.QUEUED_REQUESTS.size > 0) {
    setTimeout(processQueue, RATE_LIMIT.COOLDOWN_PERIOD);
  }
};

/**
 * @function calculateBackoff
 * @param {number} retryCount - Number of retry attempts
 * @returns {number} Calculated delay in milliseconds
 * @description Calculates exponential backoff with jitter
 */
const calculateBackoff = (retryCount) => {
  const delay = Math.min(
    BACKOFF_STRATEGY.INITIAL_DELAY * Math.pow(2, retryCount),
    BACKOFF_STRATEGY.MAX_DELAY
  );
  
  // Add jitter to prevent thundering herd
  return delay + Math.random() * BACKOFF_STRATEGY.JITTER;
};

/**
 * @function checkRateLimit
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @returns {Promise<boolean>} Whether request can proceed
 * @description Checks rate limits and handles request queueing
 */
const checkRateLimit = async (url, options) => {
  const now = Date.now();
  const isAuthRequest = url.includes('/auth/');
  
  // Reset counters if time window has passed
  if (now - requestTimestamp > RATE_LIMIT.WINDOW) {
    requestCount = 0;
    requestTimestamp = now;
    return true;
  }

  // Check against appropriate limit
  const maxRequests = isAuthRequest ? RATE_LIMIT.AUTH_MAX_REQUESTS : RATE_LIMIT.MAX_REQUESTS;

  // Handle burst and regular requests
  if (requestCount >= maxRequests) {
    if (RATE_LIMIT.QUEUED_REQUESTS.size < RATE_LIMIT.BURST_LIMIT) {
      // Queue the request instead of rejecting
      return await queueRequest(url, options, isAuthRequest ? REQUEST_PRIORITIES.HIGH : REQUEST_PRIORITIES.LOW);
    }
    return false;
  }

  requestCount++;
  return true;
};

const PUBLIC_ROUTES = [
  "/login",
  "/Enrollment",
  "/Enrollment/New",
  "/ForgotPassword",
  "/EnrollConfirm",
  "/VerifyCode",
  "/ChangePassword",
  "/PasswordConfirm",
];

/**
 * @function fetchWithInterceptor
 * @param {string} url - Request URL
 * @param {Object} [options={}] - Fetch options
 * @param {number} [retryCount=0] - Number of retry attempts
 * @returns {Promise<Response>} Fetch response
 * @throws {Error} Various error types based on response status
 * @description Main request handler with token refresh, rate limiting, and error handling
 */
const fetchWithInterceptor = async (url, options = {}, retryCount = 0) => {
  // Skip token checks for public routes
  const isPublicRoute = PUBLIC_ROUTES.some(route => url.includes(route));
  const isLoginRequest = url.includes('/auth/login');

  try {
    // Skip token refresh for logout requests
    const isLogoutRequest = url.includes('/auth/logout');

    // Add token to headers
    const token = tokenService.getAccessToken();
    options.headers = {
      ...options.headers,
      'Authorization': token ? `Bearer ${token}` : ''
    };

    const response = await fetch(url, options);

    // Special handling for login failures
    if (response.status === 401 && isLoginRequest) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Invalid credentials');
    }

    // Handle 401 with proper queueing (only for non-login requests)
    if (response.status === 401 && !isLogoutRequest && !url.includes('/auth/refresh')) {
      try {
        const newToken = await tokenService.refreshToken();
        options.headers['Authorization'] = `Bearer ${newToken}`;
        return fetchWithInterceptor(url, options);
      } catch (error) {
        if (!url.includes('/auth/login')) {
          window.location.href = '/login';
        }
        throw error;
      }
    }

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
          // Already handled above
          throw new Error(errorData.message || 'Unauthorized');
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
          const retryAfter = parseInt(response.headers.get('Retry-After')) * 1000 || 
                            calculateBackoff(retryCount);
          
          if (retryCount < RATE_LIMIT.MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, retryAfter));
            return fetchWithInterceptor(url, options, retryCount + 1);
          }
          showAlert(
            errorData.message || 'Too many requests. Please wait before trying again.',
            retryAfter
          );
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

    // Process queued requests when successful
    if (response.ok && RATE_LIMIT.QUEUED_REQUESTS.size > 0) {
      setTimeout(() => {
        const nextRequest = RATE_LIMIT.QUEUED_REQUESTS.values().next().value;
        if (nextRequest) {
          fetchWithInterceptor(nextRequest.url, nextRequest.options)
            .then(nextRequest.resolve)
            .catch(nextRequest.reject);
        }
      }, RATE_LIMIT.COOLDOWN_PERIOD);
    }

    return response;
  } catch (error) {
    // Don't retry login failures
    if (isLoginRequest || error.message.includes('Invalid credentials')) {
      throw error;
    }

    // Only retry non-login requests
    if (error.status === 429 && retryCount < RATE_LIMIT.MAX_RETRIES) {
      const backoff = calculateBackoff(retryCount);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithInterceptor(url, options, retryCount + 1);
    }
    if (error.status === 429) {
      const retryAfter = parseInt(error.response?.headers?.get('Retry-After')) * 1000 || RATE_LIMIT.RETRY_AFTER;
      showAlert(error.message || 'Rate limit exceeded', retryAfter);
      return;
    }
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

/**
 * @function resetRequestCount
 * @description Resets rate limiting counters
 */
const resetRequestCount = () => {
  requestCount = 0;
  requestTimestamp = Date.now();
};

/**
 * @function resetCircuitBreaker
 * @description Resets circuit breaker state
 */
const resetCircuitBreaker = () => {
  circuitOpen = false;
  failureCount = 0;
  if (circuitTimer) clearTimeout(circuitTimer);
};

/**
 * @function debounce
 * @param {Function} func - Function to debounce
 * @param {number} wait - Debounce delay in milliseconds
 * @returns {Function} Debounced function
 * @description Creates a debounced version of a function
 */
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    return new Promise((resolve) => {
      timeout = setTimeout(() => resolve(func(...args)), wait);
    });
  };
};

/**
 * @function debouncedFetch
 * @type {Function}
 * @description Debounced version of fetchWithInterceptor for non-critical requests
 */
export const debouncedFetch = debounce(fetchWithInterceptor, 300);

// Start queue processor
setInterval(processQueue, RATE_LIMIT.COOLDOWN_PERIOD);

export default fetchWithInterceptor;
