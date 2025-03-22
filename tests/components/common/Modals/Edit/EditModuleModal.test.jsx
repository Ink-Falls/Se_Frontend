import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EditModuleModal from 'Se_Frontend/src/components/common/Modals/Edit/EditModuleModal.jsx';

describe('EditModuleModal', () => {
  const onClose = vi.fn();
  const onSave = vi.fn();
  const module = {
    title: 'Existing Module Title',
    description: 'Existing Module Description',
  };

  beforeEach(() => {
    onClose.mockClear();
    onSave.mockClear();
  });

  it('renders the modal with existing module data', () => {
    render(<EditModuleModal module={module} onClose={onClose} onSave={onSave} />);
    expect(screen.getByDisplayValue('Existing Module Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Module Description')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    render(<EditModuleModal module={module} onClose={onClose} onSave={onSave} />);
    const titleInput = screen.getByPlaceholderText('Enter module title');
    const descriptionInput = screen.getByPlaceholderText('Enter module description');

    fireEvent.change(titleInput, { target: { value: 'Updated Module Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'Updated Module Description' } });

    expect(titleInput.value).toBe('Updated Module Title');
    expect(descriptionInput.value).toBe('Updated Module Description');
  });

  it('saves the module with updated data', () => {
    render(<EditModuleModal module={module} onClose={onClose} onSave={onSave} />);
    const titleInput = screen.getByPlaceholderText('Enter module title');
    const descriptionInput = screen.getByPlaceholderText('Enter module description');

    fireEvent.change(titleInput, { target: { value: 'Updated Module Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'Updated Module Description' } });
    fireEvent.click(screen.getByText('Save Changes'));

    expect(onSave).toHaveBeenCalledWith({
      ...module,
      title: 'Updated Module Title',
      description: 'Updated Module Description',
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('handles close button click', () => {
    render(<EditModuleModal module={module} onClose={onClose} onSave={onSave} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});