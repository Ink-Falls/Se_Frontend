import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateQuestionModal from 'Se_Frontend/src/components/common/Modals/Create/CreateQuestionModal.jsx';

describe('CreateQuestionModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const renderComponent = (isOpen) => {
    render(
      <CreateQuestionModal
        isOpen={isOpen}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal correctly when open', () => {
    renderComponent(true);

    // Check if the modal title is rendered
    expect(screen.getByRole('heading', { name: /add question/i })).toBeInTheDocument();


    // Check if the form fields are rendered
    expect(screen.getByLabelText('Question Text')).toBeInTheDocument();
    expect(screen.getByLabelText('Question Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Points')).toBeInTheDocument();
  });

  it('does not render the modal when closed', () => {
    renderComponent(false);

    // Check if the modal title is not rendered
    expect(screen.queryByText('Add Question')).not.toBeInTheDocument();
  });

  it('handles input changes', () => {
    renderComponent(true);

    const questionTextInput = screen.getByLabelText('Question Text');
    const pointsInput = screen.getByLabelText('Points');

    fireEvent.change(questionTextInput, { target: { value: 'Test Question' } });
    fireEvent.change(pointsInput, { target: { value: '10' } });

    expect(questionTextInput.value).toBe('Test Question');
    expect(pointsInput.value).toBe('10');
  });

  it('adds and removes options for multiple choice questions', () => {
    renderComponent(true);

    // Change question type to multiple choice
    fireEvent.change(screen.getByLabelText('Question Type'), { target: { value: 'multiple_choice' } });

    // Add an option
    fireEvent.click(screen.getByText('Add Option'));
    expect(screen.getAllByPlaceholderText('Option 1').length).toBe(1);

    // Add another option
    fireEvent.click(screen.getByText('Add Option'));
    expect(screen.getAllByPlaceholderText('Option 2').length).toBe(1);

    // Remove an option
    fireEvent.click(screen.getAllByRole('button', { name: /trash/i })[0]);
    expect(screen.getAllByPlaceholderText('Option 1').length).toBe(1);
  });

  it('displays an error message if the submission fails', async () => {
    mockOnSubmit.mockImplementationOnce(() => Promise.reject(new Error('Failed to create question')));

    renderComponent(true);

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Question Text'), { target: { value: 'Test Question' } });
    fireEvent.change(screen.getByLabelText('Points'), { target: { value: '10' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add question/i }));

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText('Error creating question. Please try again.')).toBeInTheDocument();
    });
  });

  it('calls onSubmit and onClose when the submission is successful', async () => {
    mockOnSubmit.mockImplementationOnce(() => Promise.resolve());

    renderComponent(true);

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Question Text'), { target: { value: 'Test Question' } });
    fireEvent.change(screen.getByLabelText('Points'), { target: { value: '10' } });

    // Submit the form
    fireEvent.click(screen.getByText('Add Question'));

    // Wait for the onSubmit and onClose callbacks to be called
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
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