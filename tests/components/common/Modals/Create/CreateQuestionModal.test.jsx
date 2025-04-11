import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateQuestionModal from 'Se_Frontend/src/components/common/Modals/Create/CreateQuestionModal.jsx';

describe('CreateQuestionModal Component', () => {
  let mockOnClose;
  let mockOnSubmit;

  beforeEach(() => {
    mockOnClose = vi.fn();
    mockOnSubmit = vi.fn();
  });

  const renderComponent = (isOpen, props = {}) => {
    return render(
      <CreateQuestionModal
        isOpen={isOpen}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        maxScore={100}
        questions={[]}
        {...props}
      />
    );
  };

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
    expect(screen.getAllByPlaceholderText(/Option \d+/i).length).toBe(2);

    // Add another option
    fireEvent.click(screen.getByText('Add Option'));
    expect(screen.getAllByPlaceholderText(/Option \d+/i).length).toBe(3);

    // Remove an option
    const removeButtons = screen.getAllByRole('button', { name: /trash/i });
    fireEvent.click(removeButtons[0]);
    expect(screen.getAllByPlaceholderText(/Option \d+/i).length).toBe(2);
  });

  it('displays an error message if the submission fails', async () => {
    // The component will show the actual error message from the rejection
    mockOnSubmit.mockImplementationOnce(() => Promise.reject(new Error("Multiple choice questions must have at least 2 options")));

    renderComponent(true);

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Question Text'), { target: { value: 'Test Question' } });
    fireEvent.change(screen.getByLabelText('Points'), { target: { value: '10' } });
    
    // Add a correct option for the multiple choice question
    fireEvent.change(screen.getByPlaceholderText(/Option \d+/i), { target: { value: 'Option 1 Text' } });
    const radioButton = screen.getByRole('radio');
    fireEvent.click(radioButton);

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add question/i }));

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText("Multiple choice questions must have at least 2 options")).toBeInTheDocument();
    });
  });

  it('calls onClose when the cancel button is clicked', () => {
    renderComponent(true);

    // Simulate clicking on the cancel button
    fireEvent.click(screen.getByText('Cancel'));

    // Check if the onClose callback was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onSubmit and onClose when the submission is successful', async () => {
    // Create a fresh mock for this test only that will resolve successfully
    const localMockOnSubmit = vi.fn().mockResolvedValue(undefined);
    const localMockOnClose = vi.fn();
    
    // Render with our local mocks
    render(
      <CreateQuestionModal
        isOpen={true}
        onClose={localMockOnClose}
        onSubmit={localMockOnSubmit}
        maxScore={100}
        questions={[]}
      />
    );

    // Use a different question type that's easier to test - short_answer
    await act(async () => {
      // Set question text
      fireEvent.change(screen.getByLabelText('Question Text'), { 
        target: { value: 'What is the capital of France?' } 
      });
      
      // Set points
      fireEvent.change(screen.getByLabelText('Points'), { 
        target: { value: '10' } 
      });
      
      // Change to short answer question type
      fireEvent.change(screen.getByLabelText('Question Type'), {
        target: { value: 'short_answer' }
      });
    });
    
    // Wait for the answer_key field to appear and set it
    await waitFor(() => {
      const answerField = screen.getByPlaceholderText(/Enter the exact correct answer/i);
      fireEvent.change(answerField, { target: { value: 'Paris' } });
    });
    
    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add question/i }));
    });
    
    // Check if onSubmit was called with the correct data structure
    await waitFor(() => {
      expect(localMockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        question_text: 'What is the capital of France?',
        question_type: 'short_answer',
        points: 10,
        media_url: '',
        answer_key: 'Paris'
      }));
    });
    
    // Check if onClose was called after submission
    await waitFor(() => {
      expect(localMockOnClose).toHaveBeenCalled();
    });
  });
});