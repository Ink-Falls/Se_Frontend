import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkEnrollmentStatus } from '../../src/services/enrollmentCheckService';
import { API_BASE_URL } from '../../src/utils/constants';
import * as apiService from '../../src/services/apiService';

// Mock the fetchWithInterceptor function instead of global fetch
vi.mock('../../src/services/apiService', () => ({
  default: vi.fn()
}));

describe('Enrollment Check Service', () => {
  const mockEnrollments = {
    'alice.smith@example.com': { status: 'approved', message: 'Your enrollment is being reviewed' },
    'bob.jones@example.com': { status: 'approved', message: 'Your enrollment has been approved' },
    'carol.white@example.com': { status: 'rejected', message: 'Your enrollment has been rejected' }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkEnrollmentStatus', () => {
    it('should check enrollment status successfully', async () => {
      const mockResponse = {
        status: 'pending',
        message: 'Enrollment is pending'
      };

      apiService.default.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await checkEnrollmentStatus('alice.smith@example.com');
      
      expect(apiService.default).toHaveBeenCalledWith(
        `${API_BASE_URL}/enrollments/check-status`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'alice.smith@example.com' })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle non-existent email', async () => {
      apiService.default.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Enrollment not found for this email' })
      });

      await expect(checkEnrollmentStatus('nonexistent@example.com'))
        .rejects
        .toThrow('Email not found');
    });

    it('handles server errors', async () => {
      apiService.default.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Internal server error' })
      });

      await expect(checkEnrollmentStatus('test@example.com'))
        .rejects
        .toThrow(/HTTP error! status: 500/);
    });

    it('should return approved status for alice', async () => {
      apiService.default.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEnrollments['alice.smith@example.com'])
      });

      const result = await checkEnrollmentStatus('alice.smith@example.com');
      expect(result.status).toBe('approved');
    });

    it('should return approved status for bob', async () => {
      apiService.default.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEnrollments['bob.jones@example.com'])
      });

      const result = await checkEnrollmentStatus('bob.jones@example.com');
      expect(result.status).toBe('approved');
    });

    it('should return rejected status for carol', async () => {
      apiService.default.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEnrollments['carol.white@example.com'])
      });

      const result = await checkEnrollmentStatus('carol.white@example.com');
      expect(result.status).toBe('rejected');
    });
  });
});
