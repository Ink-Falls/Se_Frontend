import { describe, it, expect, vi, beforeEach } from 'vitest';
import { API_BASE_URL } from '../../src/utils/constants';
import {
  getAllUsers,
  getTeachers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../../src/services/userService';

// Mock fetch
global.fetch = vi.fn();

describe('User Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
  });

  describe('getAllUsers', () => {
    it('should fetch users with pagination', async () => {
      const mockUsers = {
        rows: [
          { id: 1, first_name: 'John', last_name: 'Doe', role: 'teacher' },
          { id: 2, first_name: 'Jane', last_name: 'Smith', role: 'learner' }
        ],
        count: 2,
        totalPages: 1,
        currentPage: 1
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsers)
      });

      const result = await getAllUsers({ page: 1, limit: 10 });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users?page=1&limit=10`,
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }
        })
      );
      expect(result.users).toHaveLength(2);
      expect(result.totalItems).toBe(2);
    });

    it('should handle missing auth token', async () => {
      localStorage.removeItem('token');
      await expect(getAllUsers())
        .rejects
        .toThrow('Not authenticated');
    });

    it('should handle API errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(getAllUsers())
        .rejects
        .toThrow('Failed to fetch users: 500');
    });
  });

  describe('getTeachers', () => {
    it('should fetch only teacher users', async () => {
      const mockTeachers = [
        { id: 1, first_name: 'John', last_name: 'Doe', role: 'teacher' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTeachers)
      });

      const result = await getTeachers();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users/teachers`,
        expect.any(Object)
      );
      expect(result).toEqual(mockTeachers);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUser = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@test.com',
        password: 'password123',
        role: 'learner'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1, ...mockUser })
      });

      const result = await createUser(mockUser);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockUser)
        })
      );
      expect(result.id).toBe(1);
    });

    it('should handle duplicate email', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Email already exists' })
      });

      await expect(createUser({ email: 'existing@test.com' }))
        .rejects
        .toThrow('Failed to create user');
    });
  });

  describe('updateUser', () => {
    it('should update existing user', async () => {
      const userId = 1;
      const updateData = {
        first_name: 'John Updated',
        contact_no: '09123456789'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: userId, ...updateData })
      });

      const result = await updateUser(userId, updateData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users/${userId}`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData)
        })
      );
      expect(result.first_name).toBe('John Updated');
    });

    it('should validate contact number format', async () => {
      await expect(updateUser(1, { contact_no: '1234' }))
        .rejects
        .toThrow('Contact number must start with 09 and be 11 digits long');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 1;

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      await deleteUser(userId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users/${userId}`,
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    it('should handle deletion errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'User not found' })
      });

      await expect(deleteUser(999))
        .rejects
        .toThrow('Failed to delete user');
    });
  });

  describe('getUserById', () => {
    it('should fetch user by ID', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@test.com',
        role: 'teacher'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser)
      });

      const result = await getUserById(userId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users/${userId}`,
        expect.any(Object)
      );
      expect(result).toEqual(mockUser);
    });

    it('should handle user not found', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'User not found' })
      });

      await expect(getUserById(999))
        .rejects
        .toThrow('Failed to fetch user');
    });
  });
});
