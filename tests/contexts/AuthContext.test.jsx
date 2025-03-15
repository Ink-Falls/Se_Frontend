import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';
import { validateToken } from '../../src/services/authService';
import tokenService from '../../src/services/tokenService';

vi.mock('../../src/services/authService', () => ({
  validateToken: vi.fn(),
}));

vi.mock('../../src/services/tokenService', () => ({
  default: {
    removeTokens: vi.fn(),
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('initializes with default values', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.userRole).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('handles successful authentication', async () => {
    validateToken.mockResolvedValueOnce({ role: 'admin' });
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.checkAuth();
    });
  });

  it('handles authentication failure', async () => {
    validateToken.mockRejectedValueOnce(new Error('Auth failed'));
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.checkAuth();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.userRole).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('handles rate limit errors', async () => {
    validateToken.mockRejectedValueOnce(new Error('Rate limit exceeded'));
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

    const { result } = renderHook(() => useAuth(), { wrapper });
    const initialAuth = result.current.isAuthenticated;

    await act(async () => {
      await result.current.checkAuth();
    });

    expect(result.current.isAuthenticated).toBe(initialAuth);
  });

  it('logs out user correctly', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(tokenService.removeTokens).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.userRole).toBeNull();
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
    const consoleSpy = vi.spyOn(console, 'warn');
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    renderHook(() => useAuth(), { wrapper });

    act(() => {
      window.dispatchEvent(
        new CustomEvent('rateLimitExceeded', {
          detail: { message: 'Rate limit reached' },
        })
      );
    });

    expect(consoleSpy).toHaveBeenCalledWith('Rate limit reached');
  });
});
