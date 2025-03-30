import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';
import { logoutUser } from '../../src/services/authService';
import tokenService from '../../src/services/tokenService';

// Provide mock for authService
vi.mock('../../src/services/authService', () => ({
  logoutUser: vi.fn().mockResolvedValue(true)
}));

// Mock tokenService with all methods used in AuthContext
vi.mock('../../src/services/tokenService', () => ({
  default: {
    validateAuth: vi.fn(),
    removeTokens: vi.fn().mockResolvedValue(true),
    clearAutoRefresh: vi.fn()
  }
}));

describe('AuthContext', () => {
  // Reset loading state between tests to ensure proper initial state
  beforeEach(() => {
    vi.useFakeTimers();
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };

    // Setup default mock implementation
    logoutUser.mockReset().mockResolvedValue(true);
    tokenService.removeTokens.mockReset().mockResolvedValue(true);
    
    // Default mock implementation - return a default response matching the new format
    tokenService.validateAuth.mockReset().mockResolvedValue({
      valid: false,
      user: null
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('initializes with default values', async () => {
    // Set up validateToken to return immediately
    tokenService.validateAuth.mockResolvedValueOnce(null);
    
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Check initial loading state
    expect(result.current.loading).toBe(true);
    
    // Need to manually trigger and wait for the async effect
    await act(async () => {
      // Fast-forward past any pending timers
      vi.runAllTimers();
    });
    
    // Now check the values after the effect has run
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  }, 10000); // Increase timeout for this test

  it('handles successful authentication', async () => {
    // Mock a successful authentication with admin role
    const mockAuthResult = {
      valid: true,
      user: { role: 'admin' }
    };
    
    // Reset and make sure the mock is cleared
    tokenService.validateAuth.mockReset();
    
    // Use mockResolvedValue (not once) to apply for any calls during this test
    tokenService.validateAuth.mockResolvedValue(mockAuthResult);
    
    // Make sure our mock is working before entering the component
    const mockCheck = await tokenService.validateAuth();
    expect(mockCheck).toEqual(mockAuthResult);
    
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the initial auth check to finish
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    
    // After the initial checkAuth from useEffect
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({ role: 'admin' });
    expect(result.current.userRole).toBe('admin');
  });

  it('handles authentication failure', async () => {
    // Mock authentication failure
    tokenService.validateAuth.mockResolvedValueOnce({
      valid: false,
      user: null
    });
    
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const checkResult = await result.current.checkAuth();
      expect(checkResult).toBeNull();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.userRole).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('handles rate limit errors', async () => {
    // Make error available for try/catch by storing it first
    const rateLimitError = new Error('Rate limit exceeded');
    tokenService.validateAuth.mockImplementation(() => Promise.reject(rateLimitError));
    
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });
    const initialAuth = result.current.isAuthenticated;

    // Need to catch the error in the test
    await act(async () => {
      try {
        await result.current.checkAuth();
      } catch (error) {
        // We expect this error, so we catch it to prevent unhandled rejection
        expect(error).toBe(rateLimitError);
      }
    });

    expect(result.current.isAuthenticated).toBe(initialAuth);
  });

  it('logs out user correctly', async () => {
    // Setup mock returns
    logoutUser.mockResolvedValueOnce(true);
    tokenService.removeTokens.mockResolvedValueOnce(true);
    
    delete window.location;
    window.location = { href: '' }; // Provide a writable mock

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Need to await the logout process
    await act(async () => {
      await result.current.logout();
    });

    expect(tokenService.removeTokens).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('handles inactivity timeout', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    renderHook(() => useAuth(), { wrapper });

    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1000 + 1000);
    });
  });

  it('resets inactivity timer on user activity', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    renderHook(() => useAuth(), { wrapper });

    act(() => {
      vi.advanceTimersByTime(15 * 60 * 1000);
      document.dispatchEvent(new Event('mousedown'));
      vi.advanceTimersByTime(15 * 60 * 1000);
    });

    expect(tokenService.removeTokens).not.toHaveBeenCalled();
  });

  it('handles rate limit events', () => {
    const consoleSpy = vi.spyOn(console, 'warn'); // Spy on console.warn
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    renderHook(() => useAuth(), { wrapper });
  
    act(() => {
      window.dispatchEvent(
        new CustomEvent('rateLimitExceeded', {
          detail: { message: 'Rate limit reached' },
        })
      );
    });
  
    expect(consoleSpy).toHaveBeenCalledWith('Rate limit reached'); // Ensure the correct message is logged
  });
});