import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditAssessmentModal from 'Se_Frontend/src/components/common/Modals/Edit/EditAssessmentModal';
import { editAssessment } from 'Se_Frontend/src/services/assessmentService';

vi.mock('Se_Frontend/src/services/assessmentService', () => ({
  editAssessment: vi.fn(),
}));

describe('EditAssessmentModal Component', () => {
  const mockAssessment = {
    id: 1,
    title: 'Sample Assessment',
    description: 'This is a sample assessment.',
    type: 'quiz',
    max_score: 100,
    passing_score: 60,
    duration_minutes: 60,
    due_date: '2025-12-31T23:59:59Z',
    instructions: 'Please complete the assessment.',
    is_published: false,
  };

  const renderComponent = (props) => {
    render(<EditAssessmentModal {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal correctly', async () => {
    renderComponent({
      isOpen: true,
      assessment: mockAssessment,
      onClose: vi.fn(),
      onSubmit: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText('Edit Assessment')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Sample Assessment')).toBeInTheDocument();
      expect(screen.getByDisplayValue('This is a sample assessment.')).toBeInTheDocument();
      expect(screen.getByDisplayValue('quiz')).toBeInTheDocument();
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
      expect(screen.getByDisplayValue('60')).toBeInTheDocument();
      expect(screen.getByDisplayValue('60')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2025-12-31T23:59')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Please complete the assessment.')).toBeInTheDocument();
      expect(screen.getByLabelText('Published')).not.toBeChecked();
    });
  });

  it('handles form input changes correctly', async () => {
    renderComponent({
      isOpen: true,
      assessment: mockAssessment,
      onClose: vi.fn(),
      onSubmit: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText('Edit Assessment')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Updated Assessment' } });
    expect(titleInput.value).toBe('Updated Assessment');

    const descriptionTextarea = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionTextarea, { target: { value: 'Updated description.' } });
    expect(descriptionTextarea.value).toBe('Updated description.');

    const typeSelect = screen.getByLabelText(/type/i);
    fireEvent.change(typeSelect, { target: { value: 'exam' } });
    expect(typeSelect.value).toBe('exam');

    const maxScoreInput = screen.getByLabelText(/max score/i);
    fireEvent.change(maxScoreInput, { target: { value: '150' } });
    expect(maxScoreInput.value).toBe('150');

    const passingScoreInput = screen.getByLabelText(/passing score/i);
    fireEvent.change(passingScoreInput, { target: { value: '90' } });
    expect(passingScoreInput.value).toBe('90');

    const durationInput = screen.getByLabelText(/duration \(minutes\)/i);
    fireEvent.change(durationInput, { target: { value: '90' } });
    expect(durationInput.value).toBe('90');

    const dueDateInput = screen.getByLabelText(/due date/i);
    fireEvent.change(dueDateInput, { target: { value: '2025-12-25T23:59' } });
    expect(dueDateInput.value).toBe('2025-12-25T23:59');

    const instructionsTextarea = screen.getByLabelText(/instructions/i);
    fireEvent.change(instructionsTextarea, { target: { value: 'Updated instructions.' } });
    expect(instructionsTextarea.value).toBe('Updated instructions.');

    const publishedCheckbox = screen.getByLabelText(/published/i);
    fireEvent.click(publishedCheckbox);
    expect(publishedCheckbox).toBeChecked();
  });

  it('submits the form correctly', async () => {
    editAssessment.mockResolvedValueOnce({ success: true });

    const onSubmit = vi.fn();
    const onClose = vi.fn();

    renderComponent({
      isOpen: true,
      assessment: mockAssessment,
      onClose,
      onSubmit,
    });

    await waitFor(() => {
      expect(screen.getByText('Edit Assessment')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Updated Assessment' } });

    const saveButton = screen.getByText(/save changes/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(editAssessment).toHaveBeenCalledWith(mockAssessment.id, {
        title: 'Updated Assessment',
        description: 'This is a sample assessment.',
        type: 'quiz',
        max_score: 100,
        passing_score: 60,
        duration_minutes: 60,
        due_date: '2025-12-31T23:59:59.000Z',
        is_published: false,
        instructions: 'Please complete the assessment.',
      });
      expect(onSubmit).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays an error message if submitting the form fails', async () => {
    editAssessment.mockRejectedValueOnce(new Error('Failed to update assessment'));

    renderComponent({
      isOpen: true,
      assessment: mockAssessment,
      onClose: vi.fn(),
      onSubmit: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText('Edit Assessment')).toBeInTheDocument();
    });

    const saveButton = screen.getByText(/save changes/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to update assessment')).toBeInTheDocument();
    });
  });
});