import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeleteUserButton from 'Se_Frontend/src/components/common/Modals/Delete/DeleteUserButton.jsx'; // Adjust the import according to your file structure
import { describe, it, expect, vi } from 'vitest';

describe('DeleteUserButton Component', () => {
  const mockOnDelete = vi.fn();
  const userId = 1;

  const renderComponent = () => {
    return render(
      <DeleteUserButton userId={userId} onDelete={mockOnDelete} />
    );
  };

  beforeEach(() => {
    mockOnDelete.mockClear();
    localStorage.setItem('token', 'test-token');
  });

  it('should render the delete button', () => {
    renderComponent();

    // Check if the delete button is rendered
    expect(screen.getByTitle(/delete user/i)).toBeInTheDocument();
  });

  it('should show the confirmation modal when the delete button is clicked', () => {
    renderComponent();

    // Click the delete button
    fireEvent.click(screen.getByTitle(/delete user/i));

    // Check if the confirmation modal is rendered
    expect(screen.getByText(/confirm deletion/i)).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete this user\?/i)).toBeInTheDocument();
  });

  it('should call onDelete when the delete button in the modal is clicked', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    renderComponent();

    // Click the delete button
    fireEvent.click(screen.getByTitle(/delete user/i));

    // Click the delete button in the modal
    fireEvent.click(screen.getByRole('button', { name: /yes, delete/i }));

    // Check if the onDelete function was called
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(userId);
    });

    // Check if the modal is closed
    expect(screen.queryByText(/confirm deletion/i)).not.toBeInTheDocument();
  });

  it('should show an error message if the delete request fails', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to delete user.' }),
      })
    );

    renderComponent();

    // Click the delete button
    fireEvent.click(screen.getByTitle(/delete user/i));

    // Click the delete button in the modal
    fireEvent.click(screen.getByRole('button', { name: /yes, delete/i }));

    // Check if the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to delete user\./i)).toBeInTheDocument();
    });

    // Check if the onDelete function was not called
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('should call onClose when the cancel button in the modal is clicked', () => {
    renderComponent();

    // Click the delete button
    fireEvent.click(screen.getByTitle(/delete user/i));

    // Click the cancel button in the modal
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Check if the modal is closed
    expect(screen.queryByText(/confirm deletion/i)).not.toBeInTheDocument();
  });
});