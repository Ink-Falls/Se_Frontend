import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CreateModuleModal from 'Se_Frontend/src/components/common/Modals/Create/CreateModuleModal.jsx';

describe('CreateModuleModal', () => {
  const onClose = vi.fn();
  const onSubmit = vi.fn();

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
    fireEvent.click(screen.getByText('Add Resource'));

    const resourceTitleInput = screen.getByPlaceholderText('Resource title');
    const resourceLinkInput = screen.getByPlaceholderText('Resource link');

    fireEvent.change(resourceTitleInput, { target: { value: 'Resource 1' } });
    fireEvent.change(resourceLinkInput, { target: { value: 'http://example.com' } });

    expect(resourceTitleInput.value).toBe('Resource 1');
    expect(resourceLinkInput.value).toBe('http://example.com');

    fireEvent.click(screen.getByText('Add Resource'));
    expect(screen.getAllByPlaceholderText('Resource title').length).toBe(2);

    fireEvent.click(screen.getAllByText('Remove')[0]);
    expect(screen.getAllByPlaceholderText('Resource title').length).toBe(1);
  });

  it('shows error message for empty title', async () => {
    render(<CreateModuleModal onClose={onClose} onSubmit={onSubmit} courseId="1" />);
    fireEvent.click(screen.getByText('Create Module'));

    await waitFor(() => {
      expect(screen.getByText('Module title is required')).toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    render(<CreateModuleModal onClose={onClose} onSubmit={onSubmit} courseId="1" />);
    fireEvent.change(screen.getByPlaceholderText('Enter module title'), { target: { value: 'Test Module' } });
    fireEvent.change(screen.getByPlaceholderText('Enter module description'), { target: { value: 'Test Description' } });
    fireEvent.click(screen.getByText('Create Module'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Test Module',
        description: 'Test Description',
        course_id: 1,
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('handles close button click', () => {
    render(<CreateModuleModal onClose={onClose} onSubmit={onSubmit} courseId="1" />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});