import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditGradeModal from 'Se_Frontend/src/components/common/Modals/Edit/EditGradeModal';
import { gradeSubmission, getSubmissionDetails } from 'Se_Frontend/src/services/assessmentService';

vi.mock('Se_Frontend/src/services/assessmentService', () => ({
  gradeSubmission: vi.fn(),
  getSubmissionDetails: vi.fn(),
}));

describe('EditGradeModal Component', () => {
  const mockSubmission = {
    id: 1,
    answers: [
      {
        id: 1,
        question_id: 1,
        points_awarded: 5,
        feedback: 'Good job',
        selected_option_id: 1,
        selected_option: { option_text: 'Option 1', is_correct: true },
        text_response: 'My answer',
      },
    ],
    assessment: {
      questions: [
        {
          id: 1,
          question_text: 'What is 2 + 2?',
          question_type: 'multiple_choice',
          points: 10,
          options: [
            { id: 1, option_text: 'Option 1', is_correct: true },
            { id: 2, option_text: 'Option 2', is_correct: false },
          ],
          answer_key: '4',
        },
      ],
    },
  };

  const mockQuestion = {
    id: 1,
    question_text: 'What is 2 + 2?',
    question_type: 'multiple_choice',
    points: 10,
  };

  const renderComponent = (props) => {
    render(<EditGradeModal {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal correctly', async () => {
    getSubmissionDetails.mockResolvedValueOnce({ success: true, submission: mockSubmission });

    renderComponent({
      isOpen: true,
      onClose: vi.fn(),
      submission: mockSubmission,
      question: mockQuestion,
      onSave: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText('Grade Question')).toBeInTheDocument();
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  it('handles form input changes correctly', async () => {
    getSubmissionDetails.mockResolvedValueOnce({ success: true, submission: mockSubmission });

    renderComponent({
      isOpen: true,
      onClose: vi.fn(),
      submission: mockSubmission,
      question: mockQuestion,
      onSave: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText('Grade Question')).toBeInTheDocument();
    });

    const pointsInput = screen.getByLabelText(/points/i);
    fireEvent.change(pointsInput, { target: { value: '8' } });
    expect(pointsInput.value).toBe('8');

    const feedbackTextarea = screen.getByLabelText(/feedback/i);
    fireEvent.change(feedbackTextarea, { target: { value: 'Great job!' } });
    expect(feedbackTextarea.value).toBe('Great job!');
  });


it('submits the form correctly', async () => {
  getSubmissionDetails.mockResolvedValueOnce({ success: true, submission: mockSubmission });
  gradeSubmission.mockResolvedValueOnce({ success: true });

  const onSave = vi.fn();
  const onClose = vi.fn();

  renderComponent({
    isOpen: true,
    onClose,
    submission: mockSubmission,
    question: mockQuestion,
    onSave,
  });

  await waitFor(() => {
    expect(screen.getByText('Grade Question')).toBeInTheDocument();
  });

  const pointsInput = screen.getByLabelText(/points/i);
  fireEvent.change(pointsInput, { target: { value: '8' } });

  const feedbackTextarea = screen.getByLabelText(/feedback/i);
  fireEvent.change(feedbackTextarea, { target: { value: 'Great job!' } });

  const saveButton = screen.getByText(/save grade/i);
  fireEvent.click(saveButton);

  await waitFor(() => {
    expect(gradeSubmission).toHaveBeenCalledWith(mockSubmission.id, {
      grades: [{ questionId: 1, points: 8, feedback: 'Great job!' }],
      feedback: '',
    });
    expect(onSave).toHaveBeenCalledTimes(0);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

  it('displays an error message if fetching submission details fails', async () => {
    getSubmissionDetails.mockRejectedValueOnce(new Error('Failed to fetch submission details'));

    renderComponent({
      isOpen: true,
      onClose: vi.fn(),
      submission: mockSubmission,
      question: mockQuestion,
      onSave: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch submission details')).toBeInTheDocument();
    });
  });

  it('displays an error message if submitting the form fails', async () => {
    getSubmissionDetails.mockResolvedValueOnce({ success: true, submission: mockSubmission });
    gradeSubmission.mockRejectedValueOnce(new Error('Failed to save grade'));

    renderComponent({
      isOpen: true,
      onClose: vi.fn(),
      submission: mockSubmission,
      question: mockQuestion,
      onSave: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText('Grade Question')).toBeInTheDocument();
    });

    const saveButton = screen.getByText(/save grade/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to save grade')).toBeInTheDocument();
    });
  });
});