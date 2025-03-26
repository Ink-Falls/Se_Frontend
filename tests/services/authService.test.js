import { 
  loginUser, 
  logoutUser, 
  forgotPassword, 
  verifyResetCode, 
  resetPassword, 
  changePassword 
} from '../../src/services/authService';
import tokenService from '../../src/services/tokenService';
import { API_BASE_URL } from '../../src/utils/constants';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock API_BASE_URL from environment variable
vi.mock('../../src/utils/constants', () => ({
  API_BASE_URL: import.meta.env.VITE_REACT_APP_API_URL
}));

// Mock tokenService
vi.mock('../../src/services/tokenService', () => ({
  default: {
    saveTokens: vi.fn(),
    removeTokens: vi.fn(),
    setupAutoRefresh: vi.fn(),
    clearAutoRefresh: vi.fn(),
    getAccessToken: vi.fn() // Add this mock function
  }
}));

// Mock fetch
global.fetch = vi.fn();

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    global.fetch.mockClear();
  });

  describe('loginUser', () => {
    it('should handle successful login', async () => {
      const mockResponse = {
        token: 'test-token',
        refreshToken: 'refresh-token',
        user: {
          email: 'maggie@example.com',
          password: 'password@123'
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await loginUser('maggie@example.com', 'password@123', 'captcha-token');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/login`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'maggie@example.com',
            password: 'password@123',
            captchaResponse: 'captcha-token'
          })
        })
      );

      expect(tokenService.saveTokens).toHaveBeenCalledWith(
        mockResponse.token,
        mockResponse.refreshToken
      );
      
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockResponse.user));
      expect(tokenService.setupAutoRefresh).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should handle login failure', async () => {
      const mockError = {
        message: 'Invalid credentials. Please check your email and password.'
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: mockError })
      });

      await expect(() =>
        loginUser('wrong@email.com', 'wrongpassword', 'captcha-token')
      ).rejects.toThrow('Invalid credentials. Please check your email and password.');

      expect(tokenService.saveTokens).not.toHaveBeenCalled();
      expect(tokenService.setupAutoRefresh).not.toHaveBeenCalled();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(() =>
        loginUser('test@email.com', 'password', 'captcha-token')
      ).rejects.toThrow();

      expect(tokenService.saveTokens).not.toHaveBeenCalled();
      expect(tokenService.setupAutoRefresh).not.toHaveBeenCalled();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('logoutUser', () => {
    it('should handle logout successfully', async () => {
      const token = 'valid-token';
      tokenService.getAccessToken.mockReturnValue(token);
      
      global.fetch.mockResolvedValueOnce({ ok: true });

      await logoutUser();

      expect(tokenService.clearAutoRefresh).toHaveBeenCalled();
      expect(localStorage.clear).toHaveBeenCalled();
      expect(sessionStorage.clear).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/logout`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }),
          credentials: 'include'
        })
      );
    });

    it('should handle server errors during logout gracefully', async () => {
      tokenService.getAccessToken.mockReturnValue('valid-token');
      global.fetch.mockRejectedValueOnce(new Error('Server error'));

      await logoutUser(); // Should not throw
      
      expect(localStorage.clear).toHaveBeenCalled();
      expect(sessionStorage.clear).toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should handle forgot password request successfully', async () => {
      const mockResponse = { message: 'Reset email sent' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await forgotPassword('test@email.com');
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users/forgot-password`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@email.com' })
        })
      );
    });

    it('should handle forgot password failures with error message', async () => {
      const errorResponse = { error: { message: 'Email not found' }};
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(forgotPassword('invalid@email.com'))
        .rejects
        .toThrow('Email not found');
    });
  });

  describe('verifyResetCode', () => {
    it('should verify reset code successfully', async () => {
      const mockResponse = { valid: true };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await verifyResetCode('test@email.com', '123456');
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users/verify-reset-code`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ 
            email: 'test@email.com', 
            code: '123456' 
          })
        })
      );
    });

    it('should handle invalid reset codes', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: { message: 'Invalid code' }})
      });

      await expect(verifyResetCode('test@email.com', 'wrong'))
        .rejects
        .toThrow('Invalid code');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockResponse = { message: 'Password reset successful' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await resetPassword('test@email.com', 'newPass123!', 'newPass123!');
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users/reset-password`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ 
            email: 'test@email.com',
            newPassword: 'newPass123!',
            confirmPassword: 'newPass123!'
          })
        })
      );
    });

    it('should handle password reset failures', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: { message: 'Passwords do not match' }})
      });

      await expect(resetPassword('test@email.com', 'pass1', 'pass2'))
        .rejects
        .toThrow('Passwords do not match');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully when authenticated', async () => {
      const userId = 1;
      const mockResponse = { message: 'Password changed successfully' };
      tokenService.getAccessToken.mockReturnValue('valid-token');
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await changePassword(userId, 'oldPass', 'newPass123!', 'newPass123!');
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users/${userId}/change-password`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-token'
          }),
          body: JSON.stringify({ 
            oldPassword: 'oldPass',
            newPassword: 'newPass123!',
            confirmPassword: 'newPass123!'
          })
        })
      );
    });

    it('should handle unauthenticated password change attempts', async () => {
      tokenService.getAccessToken.mockReturnValue(null);

      await expect(changePassword(1, 'old', 'new', 'new'))
        .rejects
        .toThrow('Not authenticated');
        
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle password change failures', async () => {
      const userId = 1;
      tokenService.getAccessToken.mockReturnValue('valid-token');
      
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: { message: 'Incorrect old password' }})
      });

      await expect(changePassword(userId, 'wrongOld', 'new', 'new'))
        .rejects
        .toThrow('Incorrect old password');
    });
  });
});
