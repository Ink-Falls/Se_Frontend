import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StudentSubmissionView from 'Se_Frontend/src/pages/Teacher/StudentSubmissionView';
import { getSubmissionDetails, getAssessmentById, gradeSubmission } from 'Se_Frontend/src/services/assessmentService';
import { AuthProvider } from 'Se_Frontend/src/contexts/AuthContext';

vi.mock('Se_Frontend/src/services/assessmentService', () => ({
  getSubmissionDetails: vi.fn(),
  getAssessmentById: vi.fn(),
  gradeSubmission: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('StudentSubmissionView Component', () => {
  const mockAssessment = {
    id: 1,
    title: 'Sample Assessment',
    description: 'This is a sample assessment.',
    questions: [
      {
        id: 1,
        question_text: 'What is 2 + 2?',
        question_type: 'multiple_choice',
        points: 10,
        options: [
          { id: 1, option_text: '4', is_correct: true },
          { id: 2, option_text: '5', is_correct: false },
        ],
      },
    ],
  };

  const mockSubmission = {
    id: 1,
    studentName: 'John Doe',
    studentId: '12345',
    status: 'Submitted',
    score: 10,
    answers: [
      {
        id: 1,
        question_id: 1,
        selected_option_id: 1,
        points_awarded: 10,
        feedback: 'Correct',
      },
    ],
  };

  const renderComponent = (state) => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[{ pathname: '/Teacher/StudentSubmissionView', state }]}>
          <Routes>
            <Route path="/Teacher/StudentSubmissionView" element={<StudentSubmissionView />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /*it('renders the component with submission details', async () => {
    getSubmissionDetails.mockResolvedValueOnce({ success: true, submission: mockSubmission });
    getAssessmentById.mockResolvedValueOnce({ success: true, assessment: mockAssessment });

    renderComponent({ assessment: mockAssessment, submission: mockSubmission });

    await waitFor(() => {
      expect(screen.getByText('Sample Assessment')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('ID: 12345')).toBeInTheDocument();
      expect(screen.getByText('Submitted')).toBeInTheDocument();
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
      expect(screen.getByText('Correct')).toBeInTheDocument();
    });
  });*/

  it('handles loading state', async () => {
    getSubmissionDetails.mockReturnValue(new Promise(() => {})); // Mock a pending promise
    getAssessmentById.mockReturnValue(new Promise(() => {}));

    renderComponent({ assessment: mockAssessment, submission: mockSubmission });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    getSubmissionDetails.mockRejectedValueOnce(new Error('Failed to fetch submission details'));
    getAssessmentById.mockResolvedValueOnce({ success: true, assessment: mockAssessment });

    renderComponent({ assessment: mockAssessment, submission: mockSubmission });

    await waitFor(() => {
      expect(screen.getByText('Error fetching submission: Failed to fetch submission details')).toBeInTheDocument();
    });
  });

  it('navigates back to the previous page', () => {
    renderComponent({ assessment: mockAssessment, submission: mockSubmission });

    const backButton = screen.getByText('Back to Assessment');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('handles grading submission', async () => {
    getSubmissionDetails.mockResolvedValueOnce({ success: true, submission: mockSubmission });
    getAssessmentById.mockResolvedValueOnce({ success: true, assessment: mockAssessment });
    gradeSubmission.mockResolvedValueOnce({ success: true });

    renderComponent({ assessment: mockAssessment, submission: mockSubmission });

    await waitFor(() => {
      expect(screen.getByText('Sample Assessment')).toBeInTheDocument();
    });

    const gradeButton = screen.getByLabelText("submit-grades");
    fireEvent.click(gradeButton);

    await waitFor(() => {
      expect(gradeSubmission).toHaveBeenCalledWith(mockSubmission.id, {
        grades: [
          {
            questionId: 1,
            points: 10,
            feedback: 'Correct',
          },
        ],
        feedback: '',
      });
    });
  });

  it('handles auto-grading', async () => {
    getSubmissionDetails.mockResolvedValueOnce({ success: true, submission: mockSubmission });
    getAssessmentById.mockResolvedValueOnce({ success: true, assessment: mockAssessment });
    gradeSubmission.mockResolvedValueOnce({ success: true });

    renderComponent({ assessment: mockAssessment, submission: mockSubmission });

    await waitFor(() => {
      expect(screen.getByText('Sample Assessment')).toBeInTheDocument();
    });

    const autoGradeButton = screen.getByText('Proceed');
    fireEvent.click(autoGradeButton);

    await waitFor(() => {
      expect(gradeSubmission).toHaveBeenCalledWith(mockSubmission.id, {
        grades: [
          {
            questionId: 1,
            points: 10,
            feedback: 'Correct answer',
          },
        ],
        feedback: 'Auto-graded multiple choice and true/false questions',
      });
    });
  });

  it('opens the Edit Grade modal when the "Edit Grade" button is clicked', async () => {
    // Mock the API responses
    getSubmissionDetails.mockResolvedValueOnce({ success: true, submission: mockSubmission });
    getAssessmentById.mockResolvedValueOnce({ success: true, assessment: mockAssessment });
  
    // Render the component
    renderComponent({ assessment: mockAssessment, submission: mockSubmission });
  
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Sample Assessment')).toBeInTheDocument();
    });
  
    // Find the "Edit Grade" button using its aria-label
    const editGradeButton = screen.getByTestId('edit-grade-button');

    expect(editGradeButton).toBeInTheDocument();
  
    // Click the "Edit Grade" button
    fireEvent.click(editGradeButton);
  
    // Verify that the Edit Grade modal is opened
    expect(screen.getByText('Grade Question')).toBeInTheDocument();
  });
});