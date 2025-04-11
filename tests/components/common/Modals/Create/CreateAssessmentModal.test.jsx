import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateAssessmentModal from 'Se_Frontend/src/components/common/Modals/Create/CreateAssessmentModal.jsx';
import { createAssessment } from 'Se_Frontend/src/services/assessmentService';
import React from 'react';

// Mock the useCourse hook
vi.mock('Se_Frontend/src/contexts/CourseContext', () => {
  return {
    useCourse: () => ({
      selectedCourse: { id: 1, name: 'Test Course' }
    })
  };
});

vi.mock('Se_Frontend/src/services/assessmentService', () => ({
  createAssessment: vi.fn(),
}));

vi.mock('Se_Frontend/src/services/moduleService', () => ({
  getModulesByCourseId: vi.fn().mockResolvedValue([
    { module_id: 1, name: 'Module 1' },
    { module_id: 2, name: 'Module 2' },
  ]),
}));

describe('CreateAssessmentModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  
  const renderComponent = (isOpen) => {
    return render(
      <CreateAssessmentModal
        isOpen={isOpen}
        onClose={mockOnClose}
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

    // Check for form fields with regex to make matching more flexible
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time limit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maximum score/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/passing score/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/instructions/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/allowed attempts/i)).toBeInTheDocument();
  });

  it('does not render the modal when closed', () => {
    renderComponent(false);

    // Check if the modal title is not rendered
    expect(screen.queryByText('Create New Assessment')).not.toBeInTheDocument();
  });

  it('handles input changes', () => {
    renderComponent(true);

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    fireEvent.change(titleInput, { target: { value: 'Test Assessment' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

    expect(titleInput.value).toBe('Test Assessment');
    expect(descriptionInput.value).toBe('Test Description');
  });

  it('displays an error message if the creation fails', async () => {
    createAssessment.mockRejectedValueOnce(new Error('Failed to create assessment'));

    renderComponent(true);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Assessment' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/type/i), { target: { value: 'quiz' } });
    fireEvent.change(screen.getByLabelText(/time limit/i), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText(/maximum score/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/passing score/i), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2025-03-23T10:00' } });
    fireEvent.change(screen.getByLabelText(/instructions/i), { target: { value: 'Test Instructions' } });
    
    // Set module (need to select first option)
    const moduleSelect = screen.getByLabelText(/module/i);
    fireEvent.change(moduleSelect, { target: { value: '1' } });

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
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Assessment' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/type/i), { target: { value: 'quiz' } });
    fireEvent.change(screen.getByLabelText(/time limit/i), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText(/maximum score/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/passing score/i), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2025-03-23T10:00' } });
    fireEvent.change(screen.getByLabelText(/instructions/i), { target: { value: 'Test Instructions' } });
    
    // Set module (need to select first option)
    const moduleSelect = screen.getByLabelText(/module/i);
    fireEvent.change(moduleSelect, { target: { value: '1' } });

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