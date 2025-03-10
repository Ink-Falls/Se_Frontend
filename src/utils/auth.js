import { API_BASE_URL } from './constants';

// Simple cache duration
const CACHE_DURATION = 10000; // 10 seconds

const validateAuthStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    // Check cache
    const cached = sessionStorage.getItem('auth_validation');
    if (cached) {
      const { value, expiry } = JSON.parse(cached);
      if (expiry > Date.now()) {
        return value;
      }
      sessionStorage.removeItem('auth_validation');
    }

    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      return false;
    }

    const isValid = response.ok;
    
    // Cache the result
    sessionStorage.setItem('auth_validation', JSON.stringify({
      value: isValid,
      expiry: Date.now() + CACHE_DURATION
    }));

    return isValid;
  } catch (error) {
    console.error('Auth validation error:', error);
    return false;
  }
};

// Simplified to just use the validation function
const isAuthenticated = async () => {
  try {
    return await validateAuthStatus();
  } catch {
    return false;
  }
};

const clearAuthData = async () => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const getUserRole = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const validateAuth = async () => {
  console.log('validateAuth called', {
    timestamp: new Date().toISOString(),
    hasToken: !!localStorage.getItem('token')
  });

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in validateAuth');
      return { valid: false, user: null };
    }

    // Check cache
    const cached = sessionStorage.getItem('auth_validation');
    if (cached) {
      const { data, expiry } = JSON.parse(cached);
      console.log('Cache check:', { 
        hasCachedData: !!data,
        expired: expiry < Date.now()
      });
      
      if (expiry > Date.now()) {
        console.log('Returning cached validation result');
        return data;
      }
      sessionStorage.removeItem('auth_validation');
    }

    console.log('Making validation API call');
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Validation response:', {
      status: response.status,
      ok: response.ok
    });

    if (response.status === 429) {
      return { valid: false, user: null };
    }

    const data = await response.json();
    
    if (response.ok) {
      const result = {
        valid: true,
        user: data.user
      };

      // Cache successful response
      sessionStorage.setItem('auth_validation', JSON.stringify({
        data: result,
        expiry: Date.now() + CACHE_DURATION
      }));

      return result;
    }

    return { valid: false, user: null };
  } catch (error) {
    console.error('Validate auth error:', error);
    return { valid: false, user: null };
  }
};

export { isAuthenticated, clearAuthData };
