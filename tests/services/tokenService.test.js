import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { server, rest, API_BASE_URL } from '../setup/mswSetup';
import tokenService from '../../src/services/tokenService';

describe('TokenService', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (tokenService._refreshInterval) {
      tokenService.clearAutoRefresh();
    }
  });

  describe('saveTokens', () => {
    it('should save tokens to localStorage', async () => {
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';
      
      await tokenService.saveTokens(accessToken, refreshToken);
      
      expect(localStorage.getItem('token')).toBe(accessToken); // Changed from accessToken to token
      expect(localStorage.getItem('refreshToken')).toBe(refreshToken);
    });

    it('should handle missing access token', async () => {
      await expect(tokenService.saveTokens(null, 'refresh')).rejects.toThrow('Access token is required');
    });
  });

  describe('getTokens', () => {
    it('should get access token from localStorage', () => {
      const token = 'test-token';
      localStorage.setItem('token', token);
      expect(tokenService.getAccessToken()).toBe(token);
    });

    it('should get refresh token from localStorage', () => {
      const token = 'test-refresh-token';
      localStorage.setItem('refreshToken', token);
      expect(tokenService.getRefreshToken()).toBe(token);
    });
  });

  describe('validateAuth', () => {
    it('should return false when no token exists', async () => {
      const result = await tokenService.validateAuth();
      expect(result.valid).toBe(false);
      expect(result.user).toBeNull();
    });

    it('should validate auth successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      localStorage.setItem('token', 'valid-token');
      
      server.use(
        rest.get(`${API_BASE_URL}/auth/validate`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({ isValid: true, user: mockUser })
          );
        })
      );

      const result = await tokenService.validateAuth();
      expect(result.valid).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should attempt token refresh on 401', async () => {
      localStorage.setItem('token', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');
      
      // Mock validation endpoint to return 401 first
      server.use(
        rest.get(`${API_BASE_URL}/auth/validate`, (req, res, ctx) => {
          const authHeader = req.headers.get('Authorization');
          if (authHeader?.includes('expired-token')) {
            return res(ctx.status(401));
          }
          return res(
            ctx.json({ isValid: true, user: { id: 1 } })
          );
        }),
        
        // Mock refresh token endpoint
        rest.post(`${API_BASE_URL}/auth/refresh`, (req, res, ctx) => {
          return res(
            ctx.json({
              accessToken: 'new-token',
              refreshToken: 'new-refresh-token'
            })
          );
        })
      );

      const result = await tokenService.validateAuth();
      
      expect(result.valid).toBe(true);
      expect(localStorage.getItem('token')).toBe('new-token');
    });

    it('should handle validation failure', async () => {
      localStorage.setItem('token', 'invalid-token');
      
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid token' })
      });

      const result = await tokenService.validateAuth();
      expect(result.valid).toBe(false);
      expect(result.user).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh tokens', async () => {
      const oldRefreshToken = 'old-refresh-token';
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';
      
      localStorage.setItem('refreshToken', oldRefreshToken);
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        })
      });

      const result = await tokenService.refreshToken();
      
      expect(result).toBe(newAccessToken);
      expect(localStorage.getItem('token')).toBe(newAccessToken);
      expect(localStorage.getItem('refreshToken')).toBe(newRefreshToken);
    });

    it('should handle refresh failure', async () => {
      localStorage.setItem('refreshToken', 'invalid-token');
      
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid refresh token' })
      });

      await expect(tokenService.refreshToken())
        .rejects
        .toThrow('Failed to refresh token');
    });

    it('should handle concurrent refresh requests', async () => {
      localStorage.setItem('refreshToken', 'valid-refresh-token');
      
      let resolveRefresh;
      const refreshPromise = new Promise(resolve => {
        resolveRefresh = resolve;
      });

      global.fetch.mockImplementationOnce(() => refreshPromise);

      // Start multiple refresh requests
      const request1 = tokenService.refreshToken();
      const request2 = tokenService.refreshToken();
      
      resolveRefresh({
        ok: true,
        json: () => Promise.resolve({
          accessToken: 'new-token',
          refreshToken: 'new-refresh-token'
        })
      });

      const [result1, result2] = await Promise.all([request1, request2]);
      
      expect(result1).toBe('new-token');
      expect(result2).toBe('new-token');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeTokens', () => {
    it('should clear all tokens and storage', async () => {
      // Setup
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('refreshToken', 'test-refresh');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));
      
      global.fetch.mockResolvedValueOnce({ ok: true });

      await tokenService.removeTokens();
      
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should clear storage even if server logout fails', async () => {
      localStorage.setItem('token', 'test-token');
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await tokenService.removeTokens();
      
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('auto refresh', () => {
    it('should setup auto refresh with correct interval', async () => {
      vi.useFakeTimers();
      const validateAuthSpy = vi.spyOn(tokenService, 'validateAuth');
      const refreshTokenSpy = vi.spyOn(tokenService, 'refreshToken');

      localStorage.setItem('refreshToken', 'valid-refresh-token');
      tokenService.setupAutoRefresh();

      validateAuthSpy.mockResolvedValueOnce({ valid: false });
      refreshTokenSpy.mockResolvedValueOnce('new-token');

      // Fast-forward 4 minutes
      await vi.advanceTimersByTimeAsync(4 * 60 * 1000);
      
      expect(validateAuthSpy).toHaveBeenCalled();
      expect(refreshTokenSpy).toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('should clear auto refresh when token missing', () => {
      tokenService.setupAutoRefresh();
      expect(tokenService._refreshInterval).toBeDefined();
      
      localStorage.clear();
      tokenService.clearAutoRefresh();
      
      expect(tokenService._refreshInterval).toBeNull();
    });

    it('should setup and clear refresh interval', () => {
      vi.useFakeTimers();
      
      tokenService.setupAutoRefresh();
      expect(tokenService._refreshInterval).toBeDefined();
      
      tokenService.clearAutoRefresh();
      expect(tokenService._refreshInterval).toBeNull();
      
      vi.useRealTimers();
    });
  });
});
