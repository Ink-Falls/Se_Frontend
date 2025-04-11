import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateContentModal from 'Se_Frontend/src/components/common/Modals/Create/CreateContentModal.jsx';

describe('CreateContentModal', () => {
  const onClose = vi.fn();
  const onSubmit = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
    onSubmit.mockClear();
  });

  it('renders the modal', () => {
    render(<CreateContentModal moduleId="1" onClose={onClose} onSubmit={onSubmit} />);
    expect(screen.getByText('Add Resource Link')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    render(<CreateContentModal moduleId="1" onClose={onClose} onSubmit={onSubmit} />);
    const titleInput = screen.getByPlaceholderText('Enter resource title');
    const urlInput = screen.getByPlaceholderText('Enter resource URL');

    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(urlInput, { target: { value: 'http://example.com' } });

    expect(titleInput.value).toBe('Test Title');
    expect(urlInput.value).toBe('http://example.com');
  });

  it('shows error message for empty title', async () => {
    render(<CreateContentModal moduleId="1" onClose={onClose} onSubmit={onSubmit} testMode={true} />);
    
    // Submit the form
    const submitButton = screen.getByText('Add Resource');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage.textContent).toBe('Resource title is required');
    });
  });

  it("shows error message for empty URL", async () => {
    render(<CreateContentModal moduleId="1" onClose={onClose} onSubmit={onSubmit} testMode={true} />);

    // Fill title but leave URL empty
    fireEvent.change(screen.getByPlaceholderText("Enter resource title"), { target: { value: "Test Title" } });

    // Submit the form
    const submitButton = screen.getByText('Add Resource');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage.textContent).toBe('Resource URL is required');
    });
  });

  it('shows error message for invalid URL', async () => {
    render(<CreateContentModal moduleId="1" onClose={onClose} onSubmit={onSubmit} testMode={true} />);
    
    // Fill in form with invalid URL
    fireEvent.change(screen.getByPlaceholderText('Enter resource title'), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByPlaceholderText('Enter resource URL'), { target: { value: 'invalid-url' } });
    
    // Submit the form
    const submitButton = screen.getByText('Add Resource');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage.textContent).toBe('Please enter a valid URL');
    });
  });

  it('submits the form with valid data', async () => {
    render(<CreateContentModal moduleId="1" onClose={onClose} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText('Enter resource title'), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByPlaceholderText('Enter resource URL'), { target: { value: 'http://example.com' } });
    fireEvent.click(screen.getByText('Add Resource'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Test Title',
        content: 'http://example.com',
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('handles close button click', () => {
    render(<CreateContentModal moduleId="1" onClose={onClose} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});