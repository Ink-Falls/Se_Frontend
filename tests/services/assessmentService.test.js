import { 
  createAssessment, 
  getCourseAssessments,
  getAssessmentById,
  createAssessmentQuestion,
  submitAssessment,
  getUserSubmission,
  getSubmissionDetails,
  saveQuestionAnswer,
  gradeSubmission,
  editAssessment,
  deleteAssessment,
  deleteQuestion,
  editQuestion
} from '../../src/services/assessmentService';
import fetchWithInterceptor from '../../src/services/apiService';
import { API_BASE_URL } from '../../src/utils/constants';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API service and constants
vi.mock('../../src/services/apiService', () => ({
  __esModule: true,
  default: vi.fn()
}));

vi.mock('../../src/utils/constants', () => ({
  API_BASE_URL: 'http://test-api'
}));

describe('Assessment Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn();
    Storage.prototype.setItem = vi.fn();
  });

  describe('createAssessment', () => {
    it('should successfully create an assessment', async () => {
      const mockAssessment = {
        title: 'Test Assessment',
        description: 'Test Description',
        due_date: '2024-01-01T00:00:00Z', // Add valid date
        module_id: 1,
        type: 'quiz',
        max_score: 100,
        passing_score: 60,
        duration_minutes: 60,
        is_published: false,
        instructions: 'Test instructions',
        allowed_attempts: 2
      };

      fetchWithInterceptor.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          assessment: mockAssessment,
          message: 'Assessment created successfully'
        })
      });

      const result = await createAssessment(mockAssessment);
      expect(result.success).toBe(true);
      expect(fetchWithInterceptor).toHaveBeenCalledWith(
        `${API_BASE_URL}/assessments`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.any(String)
        })
      );
    });
  });

  describe('getCourseAssessments', () => {
    it('should fetch assessments for a course', async () => {
      const mockResponse = {
        success: true,
        assessments: {
          assessments: [{ id: 1, title: 'Test', due_date: '2024-01-01T00:00:00Z' }],
          course_id: 1
        },
        pagination: {
          total: 1,
          pages: 1,
          page: 1,
          limit: 10
        }
      };
      
      fetchWithInterceptor.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getCourseAssessments(1);
      expect(result.success).toBe(true);
      expect(result.assessments).toBeDefined();
      expect(fetchWithInterceptor).toHaveBeenCalledWith(
        expect.stringMatching(/\/assessments\/module\/1/)
      );
    });
  });

  describe('getAssessmentById', () => {
    it('should fetch an assessment by ID with questions', async () => {
      const mockAssessment = {
        success: true,
        assessment: {
          id: 1,
          title: 'Test',
          questions: [{
            id: 1,
            options: [{
              id: 1,
              option_text: 'Test Option'
            }]
          }]
        }
      };

      fetchWithInterceptor.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAssessment)
      });

      const result = await getAssessmentById(1, true);
      expect(result.success).toBe(true);
      expect(result.assessment.questions).toBeDefined();
    });
  });

  describe('submitAssessment', () => {
    beforeEach(() => {
      // Mock localStorage
      Storage.prototype.getItem = vi.fn();
      Storage.prototype.setItem = vi.fn();
    });

    it('should submit an assessment successfully', async () => {
      const mockResponse = {
        success: true,
        submission: { id: 1, status: 'submitted' }
      };

      Storage.prototype.getItem.mockReturnValue(JSON.stringify({
        assessmentId: 1
      }));

      fetchWithInterceptor.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await submitAssessment(1);
      expect(result.submission.status).toBe('submitted');
      expect(fetchWithInterceptor).toHaveBeenCalledWith(
        expect.stringContaining('/submissions/1/submit'),
        expect.any(Object)
      );
    });
  });

  describe('saveQuestionAnswer', () => {
    it('should save multiple choice answer successfully', async () => {
      const mockAnswer = {
        optionId: 1,
        textResponse: undefined
      };

      fetchWithInterceptor.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await saveQuestionAnswer(1, 1, mockAnswer);
      expect(result.success).toBe(true);
      expect(fetchWithInterceptor).toHaveBeenCalledWith(
        expect.stringContaining('/submissions/1/questions/1/answers'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockAnswer)
        })
      );
    });

    it('should save text response successfully', async () => {
      const mockAnswer = {
        textResponse: 'Test answer',
        optionId: undefined
      };

      fetchWithInterceptor.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await saveQuestionAnswer(1, 1, mockAnswer);
      expect(result.success).toBe(true);
    });
  });

  describe('getSubmissionDetails', () => {
    it('should fetch and process submission details', async () => {
      const mockSubmission = {
        success: true,
        submission: {
          id: 1,
          answers: [{
            question_id: 1,
            selected_option_id: 1
          }],
          assessment: {
            questions: [{
              id: 1,
              question_type: 'multiple_choice',
              options: [{
                id: 1,
                is_correct: true
              }]
            }]
          }
        }
      };

      fetchWithInterceptor.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSubmission)
      });

      const result = await getSubmissionDetails(1);
      expect(result.success).toBe(true);
      expect(result.submission.answers[0]).toHaveProperty('points_awarded');
    });
  });

  describe('gradeSubmission', () => {
    it('should grade submission successfully', async () => {
      const mockGradingData = {
        grades: [{
          questionId: 1,
          points: 10,
          feedback: 'Good work'
        }]
      };

      fetchWithInterceptor.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await gradeSubmission(1, mockGradingData);
      expect(result.success).toBe(true);
    });
  });

  describe('editAssessment', () => {
    it('should update assessment successfully', async () => {
      const mockUpdateData = {
        title: 'Updated Assessment',
        description: 'Updated Description',
        type: 'quiz',
        max_score: 100,
        passing_score: 60,
        duration_minutes: 60,
        due_date: '2024-01-01T00:00:00Z',
        is_published: true,
        instructions: 'Updated instructions'
      };

      fetchWithInterceptor.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, assessment: mockUpdateData })
      });

      const result = await editAssessment(1, mockUpdateData);
      expect(result.success).toBe(true);
    });
  });

  describe('deleteAssessment', () => {
    it('should delete assessment successfully', async () => {
      fetchWithInterceptor.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, message: 'Assessment deleted successfully' })
      });

      const result = await deleteAssessment(1);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Assessment deleted successfully');
    });
  });

  describe('editQuestion', () => {
    it('should update question successfully', async () => {
      const mockQuestionData = {
        question_text: 'Updated question',
        points: 10
      };

      fetchWithInterceptor.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await editQuestion(1, 1, mockQuestionData);
      expect(result.success).toBe(true);
    });
  });
});
