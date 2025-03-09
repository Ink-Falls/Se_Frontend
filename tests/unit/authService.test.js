import { validateToken, refreshUserToken } from '../../src/services/authService';
import tokenService from '../../src/services/tokenService';

// Mock fetch globally
global.fetch = jest.fn();
jest.mock('../../src/services/tokenService');

describe('Auth Service Token Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
    tokenService.saveTokens.mockClear();
  });

  describe('validateToken', () => {
    it('should successfully validate a token', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true })
      });

      const result = await validateToken();
      expect(result).toEqual({ valid: true });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/validate'),
        expect.any(Object)
      );
    });

    it('should throw error when validation fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid token' })
      });

      await expect(validateToken()).rejects.toThrow('Token validation failed');
    });
  });

  describe('refreshUserToken', () => {
    it('should successfully refresh token', async () => {
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await refreshUserToken('old-refresh-token');
      
      expect(result).toEqual(mockResponse);
      expect(tokenService.saveTokens).toHaveBeenCalledWith(
        'new-access-token',
        'new-refresh-token'
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/refresh'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ refreshToken: 'old-refresh-token' })
        })
      );
    });

    it('should throw error when refresh fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid refresh token' })
      });

      await expect(refreshUserToken('invalid-token')).rejects.toThrow('Token refresh failed');
    });
  });
});
