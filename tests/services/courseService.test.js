import { describe, it, expect, vi, beforeEach } from 'vitest';
import { API_BASE_URL } from '../../src/utils/constants';
import { 
  getAllCourses,
  createCourse,
  getCourseById,
  updateCourse,
  getLearnerCourses,
  getTeacherCourses,
  getUserAccessibleCourses,
  generateCourseCode,
  deleteCourse
} from '../../src/services/courseService';
import { getUserGroupIds } from '../../src/services/groupService';

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
        rows: [{
          id: 1,
          name: 'Test Course',
          description: 'Description',
          teacher: { first_name: 'John', last_name: 'Doe' }
        }]
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

  describe('getLearnerCourses', () => {
    it('should fetch accessible courses for learner', async () => {
      const mockUser = { id: 1, role: 'learner' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      getUserGroupIds.mockResolvedValueOnce([1, 2]);

      const mockCourses = {
        rows: [
          { id: 1, name: 'Course 1', learner_group_id: 1 },
          { id: 2, name: 'Course 2', learner_group_id: 3 }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCourses)
      });

      const result = await getLearnerCourses();
      
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
    });

    it('should handle missing auth token', async () => {
      localStorage.removeItem('token');
      await expect(getLearnerCourses()).rejects.toThrow('No authentication token');
    });
  });

  describe('getTeacherCourses', () => {
    it('should fetch courses for teacher', async () => {
      const mockCourses = {
        rows: [
          { id: 1, user_id: 1, name: 'Course 1' },
          { id: 2, user_id: 2, name: 'Course 2' }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCourses)
      });

      const result = await getTeacherCourses();
      
      expect(result.length).toBe(1); // Only course with matching user_id
      expect(result[0].id).toBe(1);
    });

    it('should handle student teacher role', async () => {
      localStorage.setItem('user', JSON.stringify({ id: 1, role: 'student_teacher' }));
      getUserGroupIds.mockResolvedValueOnce([1]);

      const mockCourses = {
        rows: [
          { id: 1, student_teacher_group_id: 1 },
          { id: 2, student_teacher_group_id: 2 }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCourses)
      });

      const result = await getTeacherCourses();
      expect(result.length).toBe(1);
    });
  });

  describe('updateCourse', () => {
    it('should update course successfully', async () => {
      const mockUpdate = {
        name: 'Updated Course',
        description: 'New description'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1, ...mockUpdate })
      });

      const result = await updateCourse(1, mockUpdate);
      
      expect(result).toMatchObject(mockUpdate);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/courses/1`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(mockUpdate)
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
      { name: 'FILIPINO 1', expected: 'FIL-' },
      { name: 'ENGLISH 101', expected: 'ENG-' },
      { name: 'MATHEMATICS 1', expected: 'MATH-' },
      { name: 'SCIENCE 1', expected: 'SCI-' },
      { name: 'ARALING PANLIPUNAN', expected: 'AP-' },
      { name: 'EDUKASYON SA PAGPAPAKATAO', expected: 'EsP-' },
      { name: 'OTHER COURSE', expected: 'COURSE-' }
    ];

    testCases.forEach(({ name, expected }) => {
      it(`should generate correct code prefix for ${name}`, () => {
        const result = generateCourseCode(name, 1);
        expect(result).toBe(`${expected}001`);
      });
    });
  });
});
