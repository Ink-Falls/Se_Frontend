import { describe, it, expect, vi, beforeEach } from 'vitest';
import { API_BASE_URL } from '../../src/utils/constants';
import * as courseService from '../../src/services/courseService';

const { 
  getAllCourses,
  createCourse,
  updateCourse,
  getUserCourses,
  deleteCourse,
  generateCourseCode // This is only available in test environment
} = courseService;

// Mock groupService 
vi.mock('../../src/services/groupService', () => ({
  getUserGroupIds: vi.fn()
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('Course Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ 
      id: 1, 
      role: 'teacher' 
    }));
  });

  describe('getAllCourses', () => {
    it('should fetch and format all courses', async () => {
      const mockResponse = {
        rows: [ {
          id: 1,
          name: 'Test Course',
          description: 'Description',
          teacher: { first_name: 'John', last_name: 'Doe' }
        } ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getAllCourses();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/courses`,
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }
        })
      );

      expect(result[0]).toMatchObject({
        id: 1,
        name: 'Test Course',
        teacher: 'John Doe'
      });
    });

    it('should handle fetch errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      await expect(getAllCourses()).rejects.toThrow('Network error');
    });
  });

  describe('createCourse', () => {
    it('should create a new course', async () => {
      const mockCourseData = {
        name: 'New Course',
        description: 'Description',
        user_id: 1,
        learner_group_id: 1,
        student_teacher_group_id: 1
      };

      const mockResponse = { 
        id: 1,
        ...mockCourseData,
        teacher: { first_name: 'John', last_name: 'Doe' }
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });

      const result = await createCourse(mockCourseData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/courses`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockCourseData)
        })
      );

      expect(result.id).toBe(1);
      expect(result.teacher).toBe('John Doe');
    });

    it('should handle creation errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to create course' })
      });

      await expect(createCourse({})).rejects.toThrow('Failed to create course');
    });
  });

  describe('getUserCourses', () => {
    it('should fetch accessible courses for user', async () => {
      const mockUser = { id: 1, role: 'learner' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // Mock the user courses API response
      global.fetch.mockImplementation((url) => {
        if (url.includes('/courses/user/1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([
              { id: 1, name: 'Course 1', learner_group_id: 1 }
            ])
          });
        } 
        if (url.includes('/groups/1/members')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([{}, {}, {}]) // 3 members
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      });

      const result = await getUserCourses();
      
      expect(result.length).toBe(1);
      expect(result[0].code).toBeDefined();
      expect(result[0].studentCount).toBe(3);
    });

    it('should handle missing auth token', async () => {
      localStorage.removeItem('token');
      const result = await getUserCourses();
      expect(result).toEqual([]);
    });
  });

  describe('updateCourse', () => {
    it('should update course successfully', async () => {
      const mockUpdate = {
        name: 'Updated Course',
        description: 'New description',
        user_id: 1,
        learner_group_id: 1,
        student_teacher_group_id: 1
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1, ...mockUpdate })
      });

      const result = await updateCourse(1, mockUpdate);
      
      expect(result).toMatchObject({ id: 1, ...mockUpdate });
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/courses/1`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            name: mockUpdate.name,
            description: mockUpdate.description,
            user_id: mockUpdate.user_id,
            learner_group_id: mockUpdate.learner_group_id,
            student_teacher_group_id: mockUpdate.student_teacher_group_id
          })
        })
      );
    });
  });

  describe('deleteCourse', () => {
    it('should delete course successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Course deleted' })
      });

      await deleteCourse(1);
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/courses/1`,
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should handle deletion errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Course not found' })
      });

      await expect(deleteCourse(999)).rejects.toThrow();
    });
  });

  describe('generateCourseCode', () => {
    const testCases = [
      { name: 'FILIPINO 1', expected: 'FIL-001' },
      { name: 'ENGLISH 101', expected: 'ENG-001' },
      { name: 'MATHEMATICS 1', expected: 'MATH-001' },
      { name: 'SCIENCE 1', expected: 'SCI-001' },
      { name: 'ARALING PANLIPUNAN', expected: 'AP-001' },
      { name: 'EDUKASYON SA PAGPAPAKATAO', expected: 'EsP-001' },
      { name: 'OTHER COURSE', expected: 'COURSE-001' }
    ];

    testCases.forEach(({ name, expected }) => {
      it(`should generate correct code prefix for ${name}`, () => {
        const result = generateCourseCode(name, 1);
        expect(result).toBe(expected);
      });
    });
  });
});
