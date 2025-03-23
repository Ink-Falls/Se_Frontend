import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateAssessmentModal from 'Se_Frontend/src/components/common/Modals/Create/CreateAssessmentModal.jsx';
import { createAssessment } from 'Se_Frontend/src/services/assessmentService';

vi.mock('../../../../src/services/assessmentService', () => ({
  createAssessment: vi.fn(),
}));

describe('CreateAssessmentModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const courseId = 1;

  const renderComponent = (isOpen) => {
    render(
      <CreateAssessmentModal
        isOpen={isOpen}
        onClose={mockOnClose}
        courseId={courseId}
        onSuccess={mockOnSuccess}
      />
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal correctly when open', () => {
    renderComponent(true);

    // Check if the modal title is rendered
    expect(screen.getByText('Create New Assessment')).toBeInTheDocument();

    // Check if the form fields are rendered
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Duration (minutes)')).toBeInTheDocument();
    expect(screen.getByLabelText('Maximum Score')).toBeInTheDocument();
    expect(screen.getByLabelText('Passing Score')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Publish immediately')).toBeInTheDocument();
    expect(screen.getByLabelText('Instructions')).toBeInTheDocument();
  });

  it('does not render the modal when closed', () => {
    renderComponent(false);

    // Check if the modal title is not rendered
    expect(screen.queryByText('Create New Assessment')).not.toBeInTheDocument();
  });

  it('handles input changes', () => {
    renderComponent(true);

    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');

    fireEvent.change(titleInput, { target: { value: 'Test Assessment' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

    expect(titleInput.value).toBe('Test Assessment');
    expect(descriptionInput.value).toBe('Test Description');
  });

  it('displays an error message if the creation fails', async () => {
    createAssessment.mockRejectedValueOnce(new Error('Failed to create assessment'));

    renderComponent(true);

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Assessment' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'quiz' } });
    fireEvent.change(screen.getByLabelText('Duration (minutes)'), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText('Maximum Score'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Passing Score'), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText('Due Date'), { target: { value: '2025-03-23T10:00' } });
    fireEvent.change(screen.getByLabelText('Instructions'), { target: { value: 'Test Instructions' } });

    // Submit the form
    fireEvent.click(screen.getByText('Create Assessment'));

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to create assessment')).toBeInTheDocument();
    });
  });

  it('calls onSuccess and onClose when the creation is successful', async () => {
    createAssessment.mockResolvedValueOnce({ success: true, assessment: { id: 1, title: 'Test Assessment' } });

    renderComponent(true);

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Assessment' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'quiz' } });
    fireEvent.change(screen.getByLabelText('Duration (minutes)'), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText('Maximum Score'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Passing Score'), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText('Due Date'), { target: { value: '2025-03-23T10:00' } });
    fireEvent.change(screen.getByLabelText('Instructions'), { target: { value: 'Test Instructions' } });

    // Submit the form
    fireEvent.click(screen.getByText('Create Assessment'));

    // Wait for the onSuccess and onClose callbacks to be called
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith({ id: 1, title: 'Test Assessment' });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('calls onClose when the cancel button is clicked', () => {
    renderComponent(true);

    // Simulate clicking on the cancel button
    fireEvent.click(screen.getByText('Cancel'));

    // Check if the onClose callback was called
    expect(mockOnClose).toHaveBeenCalled();
  });
});