import fetchWithInterceptor from '../../src/services/apiService';
import tokenService from '../../src/services/tokenService';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock tokenService
vi.mock('../../src/services/tokenService', () => ({
  default: {
    getAccessToken: vi.fn(),
    isTokenExpired: vi.fn(),
    refreshToken: vi.fn(),
    removeTokens: vi.fn()
  }
}));

// Mock fetch
global.fetch = vi.fn();

// Expose resetCircuitBreaker for testing
const resetCircuitBreaker = () => {
  // Direct access to internal state via function call
  if (typeof fetchWithInterceptor.resetCircuitBreaker === 'function') {
    fetchWithInterceptor.resetCircuitBreaker();
  }
};

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockClear();
    
    // Reset circuit breaker state before each test
    resetCircuitBreaker();
    
    // Setup mock implementations correctly
    tokenService.getAccessToken.mockReturnValue('test-token');
    tokenService.isTokenExpired.mockReturnValue(false);
    tokenService.refreshToken.mockResolvedValue('new-test-token');
    
    // Reset fetch mock behavior
    global.fetch.mockReset();
  });

  it('should add authorization header when token exists', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    });

    await fetchWithInterceptor('test-url');

    expect(global.fetch).toHaveBeenCalledWith('test-url', expect.objectContaining({
      headers: expect.objectContaining({
        'Authorization': 'Bearer test-token'
      })
    }));
  });

  it('should handle rate limiting', async () => {
    const responses = Array(6).fill({
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    });
    global.fetch.mockImplementation(() => Promise.resolve(responses.shift()));

    const promises = Array(6).fill(null).map(() => 
      fetchWithInterceptor('test-url')
    );

    await Promise.all(promises);
    expect(global.fetch).toHaveBeenCalledTimes(6);
  });

  it('should handle token refresh on 401', async () => {
    const newToken = 'new-test-token';
    global.fetch
      .mockResolvedValueOnce({ ok: false, status: 401 })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: 'test' }) });
    
    tokenService.refreshToken.mockResolvedValueOnce(newToken);

    await fetchWithInterceptor('test-url');

    expect(tokenService.refreshToken).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should handle network errors', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    Object.defineProperty(navigator, 'onLine', { value: false });

    await expect(fetchWithInterceptor('test-url')).rejects.toThrow('No internet connection');
  });

  describe('Rate Limiting', () => {
    it('should queue requests when near rate limit', async () => {
      // Setup multiple responses
      const responses = Array(6).fill({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      });
      global.fetch.mockImplementation(() => Promise.resolve(responses.shift()));

      // Make concurrent requests
      const requests = Array(6).fill(null).map(() => 
        fetchWithInterceptor('test-url')
      );

      await Promise.all(requests);
      expect(global.fetch).toHaveBeenCalledTimes(6);
    });

    it('should prioritize auth requests', async () => {
      const requests = [
        fetchWithInterceptor('/auth/login', { priority: 'high' }),
        fetchWithInterceptor('/users', { priority: 'medium' }),
        fetchWithInterceptor('/data', { priority: 'low' })
      ];

      await Promise.all(requests);
      
      // Verify auth request was processed first
      expect(global.fetch).toHaveBeenNthCalledWith(1, 
        expect.stringContaining('/auth/login'),
        expect.any(Object)
      );
    });
  });

  describe('Circuit Breaker', () => {
    it('should open circuit after consecutive failures', async () => {
      global.fetch.mockRejectedValue(new Error('Server error'));

      // Make multiple failing requests
      for (let i = 0; i < 5; i++) {
        await expect(fetchWithInterceptor('test-url'))
          .rejects.toThrow();
      }

      // Next request should fail immediately with circuit breaker error
      await expect(fetchWithInterceptor('test-url'))
        .rejects.toThrow('Circuit breaker is open');
    });
  });

  describe('Error Handling', () => {
    it('should handle 400 errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Invalid request' })
      });

      await expect(fetchWithInterceptor('test-url'))
        .rejects.toThrow('Invalid request');
    });

    it('should handle 403 errors with custom event', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ message: 'Access denied' })
      });

      const eventSpy = vi.fn();
      window.addEventListener('authError', eventSpy);

      await expect(fetchWithInterceptor('test-url'))
        .rejects.toThrow('Access forbidden');
      
      expect(eventSpy).toHaveBeenCalled();
    });

    it('should handle server errors (500 range)', async () => {
      // Reset circuit breaker state
      fetchWithInterceptor.resetCircuitBreaker();
      
      // Create a mock response for a 500 server error
      const mockResponse = {
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Internal server error' })
      };
      
      // Setup the mock implementation
      global.fetch.mockReset();
      global.fetch.mockResolvedValue(mockResponse);
      
      // Spy on the custom event dispatch
      const eventSpy = vi.fn();
      window.addEventListener('serverError', eventSpy);
      
      // Execute the test
      await expect(fetchWithInterceptor('test-url')).rejects.toThrow('Server error');
      
      // Verify the event was triggered
      expect(eventSpy).toHaveBeenCalled();
      
      // Cleanup
      window.removeEventListener('serverError', eventSpy);
    });
  });

  describe('Request Debouncing', () => {
    it('should debounce non-critical requests', async () => {
      // Reset circuit breaker
      fetchWithInterceptor.resetCircuitBreaker();
      
      // Use fake timers to control setTimeout behavior
      vi.useFakeTimers();
      
      // Mock successful response
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      });
      
      // Track fetch calls
      const fetchSpy = vi.spyOn(global, 'fetch');
      
      // Call debounced function multiple times
      const debouncedFetch = fetchWithInterceptor.debouncedFetch;
      debouncedFetch('test-url');
      debouncedFetch('test-url');
      debouncedFetch('test-url');
      
      // Advance timer past the debounce delay (300ms)
      vi.advanceTimersByTime(350);
      
      // Need to flush promises to allow async resolution
      await vi.runAllTimersAsync();
      
      // Verify fetch was only called once
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith('test-url', expect.anything());
      
      // Restore real timers
      vi.useRealTimers();
    });
  });
});
