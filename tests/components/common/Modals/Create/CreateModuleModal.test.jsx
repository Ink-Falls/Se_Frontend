import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateModuleModal from 'Se_Frontend/src/components/common/Modals/Create/CreateModuleModal.jsx';

describe('CreateModuleModal', () => {
  const onClose = vi.fn();
  const onSubmit = vi.fn().mockResolvedValue();

  beforeEach(() => {
    onClose.mockClear();
    onSubmit.mockClear();
  });

  it('renders the modal', () => {
    render(<CreateModuleModal onClose={onClose} onSubmit={onSubmit} courseId="1" />);
    expect(screen.getByText('Create New Module')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    render(<CreateModuleModal onClose={onClose} onSubmit={onSubmit} courseId="1" />);
    const titleInput = screen.getByPlaceholderText('Enter module title');
    const descriptionInput = screen.getByPlaceholderText('Enter module description');

    fireEvent.change(titleInput, { target: { value: 'Test Module' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

    expect(titleInput.value).toBe('Test Module');
    expect(descriptionInput.value).toBe('Test Description');
  });

  it('adds and removes resources', () => {
    render(<CreateModuleModal onClose={onClose} onSubmit={onSubmit} courseId="1" />);
    
    // First click to show resources section
    fireEvent.click(screen.getByText('Add Learning Resources'));
    
    // Now the Add Resource button should be visible
    fireEvent.click(screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'button' && 
        element.textContent.includes('Add Resource');
    }));

    const resourceTitleInput = screen.getByPlaceholderText('Resource title');
    const resourceLinkInput = screen.getByPlaceholderText('Resource link');

    fireEvent.change(resourceTitleInput, { target: { value: 'Resource 1' } });
    fireEvent.change(resourceLinkInput, { target: { value: 'http://example.com' } });

    expect(resourceTitleInput.value).toBe('Resource 1');
    expect(resourceLinkInput.value).toBe('http://example.com');

    fireEvent.click(screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'button' && 
        element.textContent.includes('Add Resource');
    }));
    expect(screen.getAllByPlaceholderText('Resource title').length).toBe(2);

    // Using the Trash2 icon to remove a resource
    fireEvent.click(screen.getAllByRole('button')[screen.getAllByRole('button').length - 3]); // The third button from the end should be the remove button
    expect(screen.getAllByPlaceholderText('Resource title').length).toBe(1);
  });

  it('validates required fields', async () => {
    // Mock console.error to prevent error output in test
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    render(<CreateModuleModal onClose={onClose} onSubmit={onSubmit} courseId="1" />);
    
    // Try to submit the form with empty required fields
    const submitButton = screen.getByText('Create Module');
    fireEvent.click(submitButton);
    
    // Since the title input is required, the form shouldn't submit
    // and onSubmit shouldn't be called
    expect(onSubmit).not.toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  it('submits the form with valid data', async () => {
    // Reset the mock before this test
    onSubmit.mockReset();
    
    // Use resolved promise to simulate successful submission
    onSubmit.mockResolvedValueOnce();
    
    render(<CreateModuleModal onClose={onClose} onSubmit={onSubmit} courseId="1" />);
    
    // Fill the form with valid data
    const titleInput = screen.getByPlaceholderText('Enter module title');
    const descriptionInput = screen.getByPlaceholderText('Enter module description');
    fireEvent.change(titleInput, { target: { value: 'Test Module' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    
    // Submit the form
    const submitButton = screen.getByText('Create Module');
    fireEvent.click(submitButton);
    
    // Check that onSubmit was called with the correct data
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Test Module',
        description: 'Test Description',
        resources: [],
      });
    });
    
    // Wait a bit longer for onClose to be called (happens after async onSubmit resolves)
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(onClose).toHaveBeenCalled();
  });

  it('handles close button click', () => {
    render(<CreateModuleModal onClose={onClose} onSubmit={onSubmit} courseId="1" />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});