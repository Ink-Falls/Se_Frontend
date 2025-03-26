import { describe, it, expect, beforeEach, vi } from 'vitest';
import { API_BASE_URL } from '../../src/utils/constants';
import {
  getAllEnrollments,
  approveEnrollment,
  rejectEnrollment,
  deleteEnrollment,
  getEnrollmentById,
  createEnrollment
} from '../../src/services/enrollmentService';

// Mock fetch globally
global.fetch = vi.fn();

// Create a valid mock JWT token
const createMockToken = () => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ id: 1, role: 'admin' }));
  const signature = btoa('signature');
  return `${header}.${payload}.${signature}`;
};

describe('Enrollment Service', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', createMockToken());
    global.fetch.mockClear();
  });

  describe('getAllEnrollments', () => {
    it('should fetch all enrollments', async () => {
      const mockEnrollments = [
        { id: 1, status: 'pending' },
        { id: 2, status: 'approved' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEnrollments)
      });

      const result = await getAllEnrollments();
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/enrollments`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${createMockToken()}`
          })
        })
      );
      expect(result).toEqual(mockEnrollments);
    });

    it('should handle unauthorized errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' })
      });

      await expect(getAllEnrollments()).rejects.toThrow();
    });
  });

  describe('approveEnrollment', () => {
    it('should approve enrollment successfully', async () => {
      const enrollmentId = 1;
      const mockResponse = { 
        success: true, 
        message: 'Enrollment approved' 
      };

      // Mock the getEnrollmentById call first
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ year_level: '3' })
        })
        // Then mock the approve endpoint
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });

      const result = await approveEnrollment(enrollmentId);
      
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenLastCalledWith(
        `${API_BASE_URL}/enrollments/${enrollmentId}/approve`,
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${createMockToken()}`
          }),
          body: expect.any(String)
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createEnrollment', () => {
    it('should create enrollment successfully', async () => {
      const mockEnrollmentData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockEnrollmentData)
      });

      const result = await createEnrollment(mockEnrollmentData);
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/enrollments`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(mockEnrollmentData)
        })
      );
      expect(result).toEqual(mockEnrollmentData);
    });

    it('should handle duplicate email', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ message: 'Email already exists' })
      });

      await expect(createEnrollment({ email: 'existing@example.com' }))
        .rejects
        .toThrow('Email already exists');
    });
  });

  describe('rejectEnrollment', () => {
    it('should reject enrollment successfully', async () => {
      const enrollmentId = 1;
      const mockResponse = {
        success: true,
        message: 'Enrollment rejected'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await rejectEnrollment(enrollmentId);
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/enrollments/${enrollmentId}/reject`,
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${createMockToken()}`
          }),
          body: expect.any(String)
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle rejection errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to reject enrollment' })
      });

      await expect(rejectEnrollment(1))
        .rejects.toThrow('Failed to reject enrollment');
    });
  });

  describe('deleteEnrollment', () => {
    it('should delete enrollment successfully', async () => {
      const enrollmentId = 1;

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      await deleteEnrollment(enrollmentId);
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/enrollments/${enrollmentId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${createMockToken()}`
          })
        })
      );
    });
  });

  describe('getEnrollmentById', () => {
    it('should fetch enrollment details', async () => {
      const enrollmentId = 1;
      const mockEnrollment = {
        id: enrollmentId,
        status: 'pending',
        year_level: '3'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEnrollment)
      });

      const result = await getEnrollmentById(enrollmentId);
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/enrollments/${enrollmentId}`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${createMockToken()}`
          })
        })
      );
      expect(result).toEqual(mockEnrollment);
    });

    it('should handle missing enrollment', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Enrollment not found' })
      });

      await expect(getEnrollmentById(999))
        .rejects.toThrow('Enrollment not found');
    });
  });

  describe('Error Handling', () => {
    it('should handle unauthorized access', async () => {
      localStorage.removeItem('token');

      await expect(getAllEnrollments())
        .rejects.toThrow('Not authenticated');
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getAllEnrollments())
        .rejects.toThrow('Network error');
    });

    it('should handle malformed responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null)
      });

      await expect(getAllEnrollments())
        .rejects.toThrow();
    });
  });
});
