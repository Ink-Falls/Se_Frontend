import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditModuleModal from 'Se_Frontend/src/components/common/Modals/Edit/EditModuleModal.jsx';

describe('EditModuleModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const module = { title: 'Test Module', description: 'Test Description' };

  const renderComponent = () => {
    render(
      <EditModuleModal
        module={module}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal correctly when open', () => {
    renderComponent();

    // Check if the modal title is rendered
    expect(screen.getByRole('heading', { name: /edit module/i })).toBeInTheDocument();

    // Check if the form fields are rendered
    expect(screen.getByLabelText('Module Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Module Description')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    renderComponent();

    const titleInput = screen.getByLabelText('Module Title');
    const descriptionInput = screen.getByLabelText('Module Description');

    fireEvent.change(titleInput, { target: { value: 'Updated Module Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'Updated Module Description' } });

    expect(titleInput.value).toBe('Updated Module Title');
    expect(descriptionInput.value).toBe('Updated Module Description');
  });

  it('calls onSave and onClose when the save button is clicked', async () => {
    renderComponent();

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Module Title'), { target: { value: 'Updated Module Title' } });
    fireEvent.change(screen.getByLabelText('Module Description'), { target: { value: 'Updated Module Description' } });

    // Click the save button
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    // Wait for the onSave and onClose callbacks to be called
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        ...module,
        title: 'Updated Module Title',
        description: 'Updated Module Description',
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('calls onClose when the cancel button is clicked', () => {
    renderComponent();

    // Click the cancel button
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Check if the onClose callback was called
    expect(mockOnClose).toHaveBeenCalled();
  });
});