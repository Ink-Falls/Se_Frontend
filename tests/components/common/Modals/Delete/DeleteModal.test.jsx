import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteModal from 'Se_Frontend/src/components/common/Modals/Delete/DeleteModal.jsx'; // Adjust the import according to your file structure
import { describe, it, expect, vi } from 'vitest';

describe('DeleteModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  const renderComponent = () => {
    return render(
      <DeleteModal onClose={mockOnClose} onConfirm={mockOnConfirm} />
    );
  };

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnConfirm.mockClear();
  });

  it('should render the modal with the correct text', () => {
    renderComponent();

    // Check if the modal title is rendered
    expect(screen.getByText(/confirm deletion/i)).toBeInTheDocument();

    // Check if the modal message is rendered
    expect(screen.getByLabelText(/validation/i)).toBeInTheDocument();
  });

  it('should call onClose when the cancel button is clicked', () => {
    renderComponent();

    // Click the cancel button
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Check if the onClose function was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm when the delete button is clicked', () => {
    renderComponent();

    // Click the delete button
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    // Check if the onConfirm function was called
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });
});