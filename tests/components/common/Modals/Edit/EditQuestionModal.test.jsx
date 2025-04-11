import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditQuestionModal from 'Se_Frontend/src/components/common/Modals/Edit/EditQuestionModal.jsx';
import { editQuestion } from 'Se_Frontend/src/services/assessmentService';

vi.mock('Se_Frontend/src/services/assessmentService', () => ({
  editQuestion: vi.fn(),
}));

describe('EditQuestionModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const question = {
    id: 1,
    question_text: 'Sample Question?',
    question_type: 'multiple_choice',
    points: 5,
    order_index: 1,
    media_url: '',
    options: [
      { id: 1, text: 'Option 1', is_correct: false },
      { id: 2, text: 'Option 2', is_correct: true },
    ],
    answer_key: '',
    word_limit: 0,
  };
  const assessmentId = 1;

  const renderComponent = (isOpen) => {
    render(
      <EditQuestionModal
        isOpen={isOpen}
        onClose={mockOnClose}
        question={question}
        assessmentId={assessmentId}
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
    expect(screen.getByText('Edit Question')).toBeInTheDocument();

    // Check if the form fields are rendered
    expect(screen.getByLabelText('Question Text')).toBeInTheDocument();
    expect(screen.getByLabelText('Question Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Points')).toBeInTheDocument();
  });

  it('does not render the modal when closed', () => {
    renderComponent(false);

    // Check if the modal title is not rendered
    expect(screen.queryByText('Edit Question')).not.toBeInTheDocument();
  });

  it('handles input changes', () => {
    renderComponent(true);

    const questionTextInput = screen.getByLabelText('Question Text');
    const pointsInput = screen.getByLabelText('Points');

    fireEvent.change(questionTextInput, { target: { value: 'Updated Question?' } });
    fireEvent.change(pointsInput, { target: { value: '10' } });

    expect(questionTextInput.value).toBe('Updated Question?');
    expect(pointsInput.value).toBe('10');
  });

  it('adds and removes options for multiple choice questions', () => {
    renderComponent(true);

    // Count initial options
    const initialOptions = screen.getAllByRole('textbox').filter(input => 
      input.placeholder && input.placeholder.startsWith('Option')
    );
    expect(initialOptions.length).toBe(2);

    // Add an option
    fireEvent.click(screen.getByText('Add Option'));
    
    // Count options after adding one
    const optionsAfterAdd = screen.getAllByRole('textbox').filter(input => 
      input.placeholder && input.placeholder.startsWith('Option')
    );
    expect(optionsAfterAdd.length).toBe(3);

    // Remove an option
    fireEvent.click(screen.getAllByRole('button', { name: /remove option/i })[0]);
    
    // Count options after removing one
    const optionsAfterRemove = screen.getAllByRole('textbox').filter(input => 
      input.placeholder && input.placeholder.startsWith('Option')
    );
    expect(optionsAfterRemove.length).toBe(2);
  });

  it('displays an error message if the update fails', async () => {
    editQuestion.mockImplementationOnce(() => Promise.reject(new Error('Failed to update question')));

    renderComponent(true);

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Question Text'), { target: { value: 'Updated Question?' } });
    fireEvent.change(screen.getByLabelText('Points'), { target: { value: '10' } });

    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to update question')).toBeInTheDocument();
    });
  });

  it('calls onSuccess and onClose when the update is successful', async () => {
    editQuestion.mockImplementationOnce(() => Promise.resolve({ success: true, question: { ...question, question_text: 'Updated Question?' } }));

    renderComponent(true);

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Question Text'), { target: { value: 'Updated Question?' } });
    fireEvent.change(screen.getByLabelText('Points'), { target: { value: '10' } });

    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));

    // Wait for the onSuccess and onClose callbacks to be called
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith({ ...question, question_text: 'Updated Question?' });
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