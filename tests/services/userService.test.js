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
      // To avoid "Cannot read properties of undefined (reading 'ok')" error, 
      // we need to mock fetch directly, not its return value
      global.fetch = vi.fn(() => ({
        ok: false,
        status: 500,
        json: () => Promise.resolve({})
      }));

      await expect(getAllUsers())
        .rejects
        .toThrow('Server error');
    });
  });

  describe('getTeachers', () => {
    it('should fetch only teacher users', async () => {
      // Mock the first call to getAllUsers
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          rows: [],
          count: 10
        })
      });

      // Mock second call with teachers data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          users: [
            { id: 1, first_name: 'John', last_name: 'Doe', role: 'teacher' },
            { id: 2, first_name: 'Jane', last_name: 'Smith', role: 'learner' },
            { id: 3, first_name: 'Bob', last_name: 'Johnson', role: 'teacher' }
          ]
        })
      });

      const result = await getTeachers();

      expect(global.fetch).toHaveBeenCalledTimes(2);
      // Check that it filtered correctly
      expect(result.length).toBe(2);
      expect(result[0].role).toBe('teacher');
      expect(result[1].role).toBe('teacher');
    });

    it('should handle errors', async () => {
      // Need to reset the global fetch for this test to avoid issues with the getAllUsers call
      global.fetch = vi.fn(() => ({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Server error' })
      }));

      await expect(getTeachers())
        .rejects
        .toThrow('Failed to fetch users');
    });
  });

  describe('createUser', () => {
    it('should create a new user with correctly formatted data', async () => {
      const userData = {
        email: 'john@test.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        birth_date: '2000-01-01',
        contact_no: '09123456789',
        school_id: '1001',
        role: 'student_teacher',
        middle_initial: 'A',
        department: 'Computer Science',
        section: 'CS-101',
      };

      const expectedFormattedData = {
        email: 'john@test.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        birth_date: '2000-01-01',
        contact_no: '09123456789',
        school_id: 1001,
        role: 'student_teacher',
        middle_initial: 'A',
        department: 'Computer Science',
        section: 'CS-101',
        group_id: null,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1, ...userData })
      });

      const result = await createUser(userData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(expectedFormattedData)
        })
      );
      expect(result.id).toBe(1);
    });

    it('should handle non-student_teacher role properly', async () => {
      const userData = {
        email: 'teacher@test.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Smith',
        birth_date: '1990-01-01',
        contact_no: '09123456789',
        school_id: '1001',
        role: 'teacher',
        middle_initial: 'B',
        department: 'Should be ignored',
        section: 'Should be ignored',
      };

      const expectedFormattedData = {
        email: 'teacher@test.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Smith',
        birth_date: '1990-01-01',
        contact_no: '09123456789',
        school_id: 1001,
        role: 'teacher',
        middle_initial: 'B',
        department: null,
        section: null,
        group_id: null,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 2, ...userData })
      });

      const result = await createUser(userData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users`,
        expect.objectContaining({
          body: JSON.stringify(expectedFormattedData)
        })
      );
    });

    it('should handle creation errors', async () => {
      // Include minimal required fields to avoid TypeError on contact_no.replace
      const userData = {
        email: 'existing@test.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        contact_no: '09123456789',
        school_id: '1001',
        role: 'learner',
        birth_date: '2000-01-01'
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Email already exists' })
      });

      await expect(createUser(userData))
        .rejects
        .toThrow('Email already exists');
    });

    it('should throw error when not authenticated', async () => {
      localStorage.removeItem('token');

      await expect(createUser({ email: 'test@example.com' }))
        .rejects
        .toThrow('Not authenticated');
      
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update existing user', async () => {
      const userId = 1;
      const updateData = {
        first_name: 'John Updated',
        contact_no: '09123456789'
      };

      global.fetch.mockImplementationOnce(() => ({
        ok: true,
        json: () => Promise.resolve({ id: userId, ...updateData })
      }));

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

    it('should format contact number correctly', async () => {
      const userId = 1;
      const updateData = {
        contact_no: '639123456789' // Starts with 63 instead of 09
      };
      
      const expectedCleanedData = {
        contact_no: '09123456789' // Should be converted to start with 09
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: userId, contact_no: '09123456789' })
      });

      const result = await updateUser(userId, updateData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users/${userId}`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(expectedCleanedData)
        })
      );
    });

    it('should validate contact number format', async () => {
      await expect(updateUser(1, { contact_no: '1234' }))
        .rejects
        .toThrow('Contact number must start with 09 and be 11 digits long');
    });

    it('should handle API errors with error message', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'User not found' })
      });

      await expect(updateUser(999, { first_name: 'Test' }))
        .rejects
        .toThrow('User not found');
    });

    it('should throw error when not authenticated', async () => {
      localStorage.removeItem('token');

      await expect(updateUser(1, { first_name: 'Test' }))
        .rejects
        .toThrow('Not authenticated');
      
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 1;

      global.fetch.mockImplementationOnce(() => ({
        ok: true,
        json: () => Promise.resolve({ success: true })
      }));

      const result = await deleteUser(userId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users/${userId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toBe(true);
    });

    it('should handle deletion errors', async () => {
      global.fetch.mockImplementationOnce(() => ({
        ok: false,
        json: () => Promise.resolve({ message: 'User not found' })
      }));

      // Match the error message used in the service implementation
      await expect(deleteUser(999))
        .rejects
        .toThrow('User not found');
    });

    it('should throw error when not authenticated', async () => {
      localStorage.removeItem('token');

      await expect(deleteUser(1))
        .rejects
        .toThrow('Not authenticated');
      
      expect(global.fetch).not.toHaveBeenCalled();
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

      global.fetch.mockImplementationOnce(() => ({
        ok: true,
        json: () => Promise.resolve(mockUser)
      }));

      const result = await getUserById(userId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users/${userId}`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual(mockUser);
    });

    it('should handle user not found', async () => {
      // Mock a response that will match the error message thrown in getUserById
      global.fetch.mockImplementationOnce(() => ({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'User not found' })
      }));

      // Update expected error message to match actual implementation
      await expect(getUserById(999))
        .rejects
        .toThrow('Resource not found');
    });

    it('should throw error when not authenticated', async () => {
      localStorage.removeItem('token');

      await expect(getUserById(1))
        .rejects
        .toThrow('Not authenticated');
      
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
