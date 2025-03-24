import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LearnerAssessmentView from 'Se_Frontend/src/pages/Learner/LearnerAssessmentView';
import { AuthProvider } from 'Se_Frontend/src/contexts/AuthContext';
import { CourseProvider } from 'Se_Frontend/src/contexts/CourseContext';
import {
  getAssessmentById,
  createSubmission,
  saveQuestionAnswer,
  submitAssessment,
  getUserSubmission,
} from 'Se_Frontend/src/services/assessmentService';

vi.mock('Se_Frontend/src/services/assessmentService', () => ({
  getAssessmentById: vi.fn(),
  createSubmission: vi.fn(),
  saveQuestionAnswer: vi.fn(),
  submitAssessment: vi.fn(),
  getUserSubmission: vi.fn(),
}));

describe('LearnerAssessmentView Component', () => {
  const mockAssessment = {
    id: 1,
    title: 'Sample Assessment',
    due_date: '2025-12-31T23:59:59Z',
    duration_minutes: 60,
    passing_score: 70,
    instructions: 'Please complete the assessment.',
    questions: [
      {
        id: 1,
        question_text: 'What is 2 + 2?',
        question_type: 'multiple_choice',
        points: 10,
        options: [
          { id: 1, text: '3', is_correct: false },
          { id: 2, text: '4', is_correct: true },
        ],
      },
      {
        id: 2,
        question_text: 'True or False: The sky is blue.',
        question_type: 'true_false',
        points: 5,
        options: [
          { id: 3, text: 'True', is_correct: true },
          { id: 4, text: 'False', is_correct: false },
        ],
      },
    ],
  };

  const mockSubmission = {
    id: 1,
    assessment_id: 1,
    status: 'submitted',
    answers: [
      { question_id: 1, selected_option_id: 2, points_awarded: 10 },
      { question_id: 2, selected_option_id: 3, points_awarded: 5 },
    ],
  };

  const renderComponent = (assessment) => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/Learner/AssessmentView', state: { assessment } }]}>
        <AuthProvider>
          <CourseProvider>
            <Routes>
              <Route path="/Learner/AssessmentView" element={<LearnerAssessmentView />} />
            </Routes>
          </CourseProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    getAssessmentById.mockResolvedValue({ success: true, assessment: mockAssessment });
    getUserSubmission.mockResolvedValue({ success: true, submission: mockSubmission });
  });

  it('renders the assessment details correctly', async () => {
    renderComponent(mockAssessment);

    await waitFor(() => {
      expect(screen.getByText('Sample Assessment')).toBeInTheDocument();
      expect(screen.getByText('Due: 12/31/2025')).toBeInTheDocument();
      expect(screen.getByText('Passing Score: 70%')).toBeInTheDocument();
      expect(screen.getByText('Please complete the assessment.')).toBeInTheDocument();
    });
  });

  it('handles file selection correctly', async () => {
    renderComponent(mockAssessment);

    const fileInput = screen.getByLabelText('Upload File');
    const file = new File(['dummy content'], 'example.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('example.pdf')).toBeInTheDocument();
    });
  });

  it('handles text answer input correctly', async () => {
    renderComponent(mockAssessment);

    const textArea = screen.getByPlaceholderText('Type your answer here...');
    fireEvent.change(textArea, { target: { value: 'This is my answer.' } });

    await waitFor(() => {
      expect(textArea.value).toBe('This is my answer.');
    });
  });

  it('submits the assessment correctly', async () => {
    createSubmission.mockResolvedValue({ success: true, submission: { id: 1 } });
    submitAssessment.mockResolvedValue({ success: true });

    renderComponent(mockAssessment);

    const startButton = screen.getByText('Start New Attempt');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Assessment Submitted!')).toBeInTheDocument();
    });
  });

  it('navigates back to assessments when no assessment is provided', () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', () => ({
      ...vi.importActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    renderComponent(null);

    expect(mockNavigate).toHaveBeenCalledWith('/Learner/Assessment');
  });
});