import tokenService from './tokenService';

let isRefreshing = false;
let failedQueue = [];

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

const fetchWithInterceptor = async (url, options = {}) => {
  try {
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

    // Handle 401 responses
    if (response.status === 401 && !options._retry) {
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
    }

    return response;
  } catch (error) {
    throw error;
  }
};

export default fetchWithInterceptor;
