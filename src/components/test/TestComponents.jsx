import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import tokenService from '../../services/tokenService';
import { loginUser, logoutUser } from '../../services/authService';
import fetchWithInterceptor from '../../services/apiService';

const BuggyComponent = () => {
  const [throwError, setThrowError] = useState(false);

  if (throwError) {
    throw new Error('Test error from BuggyComponent');
  }

  return (
    <button
      onClick={() => setThrowError(true)}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Throw Error
    </button>
  );
};

const AuthTester = () => {
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    try {
      // 1. Test Login
      setStatus(prev => ({ ...prev, login: 'Testing login...' }));
      const loginResponse = await loginUser('maggie@example.com', 'password@123', 'test-captcha');
      
      // Log full response for debugging
      console.log('Raw login response:', loginResponse);

      // Validate login response
      if (!loginResponse || typeof loginResponse !== 'object') {
        throw new Error('Invalid response from login');
      }

      const { token, refreshToken, user } = loginResponse;

      if (!token) {
        throw new Error('No access token in response');
      }

      // Store tokens and user data
      await tokenService.saveTokens(token, refreshToken);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      setStatus(prev => ({ ...prev, login: 'Login successful' }));

      // Rest of test steps...
      // 2. Verify token storage
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify tokens stored correctly
      const accessToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!accessToken || !storedUser) {
        throw new Error(`Token storage verification failed: ${!accessToken ? 'No token' : 'No user data'}`);
      }

      // Update status with verification results
      setStatus(prev => ({
        ...prev,
        login: 'Login successful',
        tokenStorage: 'Token and user data stored successfully'
      }));

      // 3. Test Token Validation
      const validationResult = await tokenService.validateAuth();
      console.log('Validation result:', validationResult);
      
      setStatus(prev => ({
        ...prev,
        tokenValidation: validationResult.valid ? 'Token valid' : 'Token invalid'
      }));

      // 4. Test Token Refresh
      setStatus(prev => ({ ...prev, tokenRefresh: 'Testing token refresh...' }));
      
      // Simulate expired token but keep refresh token
      const expiredToken = await simulateExpiredToken(accessToken);
      localStorage.setItem('token', expiredToken);

      // Try refresh with both tokens
      const newToken = await tokenService.refreshToken();
      
      if (newToken && newToken !== expiredToken) {
        setStatus(prev => ({ ...prev, tokenRefresh: 'Token refresh successful' }));
      } else {
        throw new Error('Token refresh failed');
      }

      // 5. Test Logout
      const logoutResult = await logoutUser();
      setStatus(prev => ({ ...prev, logout: 'Logout successful' }));

    } catch (error) {
      console.error('Test failed:', error);
      setStatus(prev => ({ 
        ...prev, 
        error: `${error.message} (${error.cause || 'unknown cause'})`
      }));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to simulate expired token
  const simulateExpiredToken = async (token) => {
    const [header, payload, signature] = token.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    decodedPayload.exp = Math.floor(Date.now() / 1000) - 60; // Set to 1 minute ago
    const expiredPayload = btoa(JSON.stringify(decodedPayload))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    return `${header}.${expiredPayload}.${signature}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Auth Services Tester</h2>
      
      <button
        onClick={runTests}
        disabled={loading}
        className="px-4 py-2 bg-[#212529] text-white rounded hover:bg-[#F6BA18] hover:text-black mb-4"
      >
        {loading ? 'Testing...' : 'Run Auth Tests'}
      </button>

      <div className="space-y-2">
        {Object.entries(status).map(([key, value]) => (
          <div key={key} className="flex items-center space-x-2">
            <span className="font-semibold">{key}:</span>
            <span className={value.includes('error') ? 'text-red-500' : 'text-green-500'}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const NetworkTester = () => {
  const [status, setStatus] = useState({});

  // Test rate limiting
  const testRateLimit = async () => {
    setStatus(prev => ({ ...prev, rateLimit: 'Testing rate limit...' }));
    try {
      // Make 60 rapid requests to trigger rate limit
      const requests = Array.from({ length: 60 }, (_, i) => 
        fetch('/api/test/rate-limit', {
          headers: { 'Authorization': `Bearer ${tokenService.getAccessToken()}` }
        })
        .then(res => {
          if (res.status === 429) {
            throw new Error('Rate limit hit');
          }
          return res;
        })
        .catch(error => {
          console.log(`Request ${i + 1}: ${error.message}`);
          return error;
        })
      );
      
      await Promise.all(requests);
      setStatus(prev => ({ ...prev, rateLimit: 'Rate limit test completed' }));
    } catch (error) {
      setStatus(prev => ({ ...prev, rateLimit: `Error: ${error.message}` }));
    }
  };

  // Test circuit breaker
  const testCircuitBreaker = async () => {
    setStatus(prev => ({ ...prev, circuitBreaker: 'Testing circuit breaker...' }));
    try {
      // Make 10 requests to a failing endpoint
      const requests = Array.from({ length: 10 }, () => 
        fetch('/api/test/circuit-breaker', {
          headers: { 'Authorization': `Bearer ${tokenService.getAccessToken()}` }
        })
        .catch(error => {
          if (error.message.includes('Circuit breaker')) {
            throw new Error('Circuit breaker opened');
          }
          return error;
        })
      );
      
      await Promise.all(requests);
      setStatus(prev => ({ ...prev, circuitBreaker: 'Circuit breaker test completed' }));
    } catch (error) {
      setStatus(prev => ({ ...prev, circuitBreaker: `Error: ${error.message}` }));
    }
  };

  // Test token refresh
  const testTokenRefresh = async () => {
    setStatus(prev => ({ ...prev, tokenRefresh: 'Testing token refresh...' }));
    try {
      // Simulate expired token
      const token = tokenService.getAccessToken();
      if (!token) throw new Error('No token found');

      // Create expired token by modifying expiration
      const [header, payload, signature] = token.split('.');
      const decodedPayload = JSON.parse(atob(payload));
      decodedPayload.exp = Math.floor(Date.now() / 1000) - 1000; // Set to expired
      const expiredPayload = btoa(JSON.stringify(decodedPayload));
      const expiredToken = `${header}.${expiredPayload}.${signature}`;

      // Save expired token
      localStorage.setItem('token', expiredToken);

      // Make request that should trigger refresh
      const response = await fetch('/api/test/protected', {
        headers: { 'Authorization': `Bearer ${expiredToken}` }
      });

      // Check if new token was issued
      const newToken = tokenService.getAccessToken();
      if (newToken !== expiredToken) {
        setStatus(prev => ({ ...prev, tokenRefresh: 'Token refresh successful' }));
      } else {
        throw new Error('Token not refreshed');
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, tokenRefresh: `Error: ${error.message}` }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Network Features Tester</h2>
      <div className="space-y-4">
        <div>
          <button
            onClick={testRateLimit}
            className="px-4 py-2 bg-[#212529] text-white rounded hover:bg-[#F6BA18] hover:text-black transition-colors"
          >
            Test Rate Limit
          </button>
          <p className="mt-2 text-sm">{status.rateLimit || 'Not tested'}</p>
        </div>

        <div>
          <button
            onClick={testCircuitBreaker}
            className="px-4 py-2 bg-[#212529] text-white rounded hover:bg-[#F6BA18] hover:text-black transition-colors"
          >
            Test Circuit Breaker
          </button>
          <p className="mt-2 text-sm">{status.circuitBreaker || 'Not tested'}</p>
        </div>

        <div>
          <button
            onClick={testTokenRefresh}
            className="px-4 py-2 bg-[#212529] text-white rounded hover:bg-[#F6BA18] hover:text-black transition-colors"
          >
            Test Token Refresh
          </button>
          <p className="mt-2 text-sm">{status.tokenRefresh || 'Not tested'}</p>
        </div>
      </div>
    </div>
  );
};

const TestComponents = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleTestLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000); // Simulates a 3-second loading state
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <NetworkTester />
        <AuthTester />
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Test Error Boundary</h2>
          <p className="text-gray-600 mb-4">
            Click the button below to simulate an error that will be caught by ErrorBoundary
          </p>
          <BuggyComponent />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Test Loading Spinner</h2>
          <p className="text-gray-600 mb-4">
            Click the button below to simulate a loading state for 3 seconds
          </p>
          <button
            onClick={handleTestLoading}
            className="px-4 py-2 bg-[#212529] text-white rounded hover:bg-[#F6BA18] hover:text-black"
          >
            Show Loading Spinner
          </button>
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default TestComponents;
