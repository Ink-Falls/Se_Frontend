import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddUserModal from 'Se_Frontend/src/components/common/Modals/Add/AddUserModal.jsx'; // Adjust the import according to your file structure
import { describe, it, expect, vi } from 'vitest';
import { createUser } from 'Se_Frontend/src/services/userService.js'; // Adjust the import according to your file structure

vi.mock('Se_Frontend/src/services/userService.js', () => ({
  createUser: vi.fn(),
}));

describe('AddUserModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const renderComponent = () => {
    return render(
      <AddUserModal onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );
  };

  it('should render the modal with form fields', () => {
    renderComponent();

    // Check if the modal title is rendered
    expect(screen.getByText(/add new user/i)).toBeInTheDocument();

    // Check if the form fields are rendered
    expect(screen.getByPlaceholderText(/enter first name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter last name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter middle initial/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter contact number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
    // expect(screen.getByLabelText(/birth date/i)).toBeInTheDocument();
    // expect(screen.getByLabelText(/school id/i)).toBeInTheDocument();
    //expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
  });

  it('should call onClose when the cancel button is clicked', () => {
    renderComponent();

    // Click the cancel button
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Check if the onClose function was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should submit the form and call onSubmit on success', async () => {
    createUser.mockResolvedValueOnce({ id: 1, email: 'test@example.com' });

    renderComponent();

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText(/enter first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/enter last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/enter middle initial/i), { target: { value: 'A' } });
    fireEvent.change(screen.getByPlaceholderText(/enter email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter contact number/i), { target: { value: '12345678901' } });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { value: 'Password1!' } });
    // fireEvent.change(screen.getByLabelText(/birth date/i), { target: { value: '2000-01-01' } });
    // fireEvent.change(screen.getByLabelText(/school id/i), { target: { value: '1001' } });
    // fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'student' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add user/i }));

    // Check if the createUser function was called with the correct data
    await waitFor(() => {
      expect(createUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password1!',
        first_name: 'John',
        last_name: 'Doe',
        middle_initial: 'A',
        birth_date: '2000-01-01',
        contact_no: '12345678901',
        school_id: '1001',
        role: 'student',
      });
    });

    // Check if the onSubmit function was called
    expect(mockOnSubmit).toHaveBeenCalledWith({ id: 1, email: 'test@example.com' });

    // Check if the onClose function was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display an error message on form submission failure', async () => {
    createUser.mockRejectedValueOnce(new Error('Failed to create user'));

    renderComponent();

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText(/enter first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/enter last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/enter middle initial/i), { target: { value: 'A' } });
    fireEvent.change(screen.getByPlaceholderText(/enter email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter contact number/i), { target: { value: '12345678901' } });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { value: 'Password1!' } });
    // fireEvent.change(screen.getByLabelText(/birth date/i), { target: { value: '2000-01-01' } });
    // fireEvent.change(screen.getByLabelText(/school id/i), { target: { value: '1001' } });
    // fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'student' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add user/i }));

    // Check if the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to create user/i)).toBeInTheDocument();
    });

    // Check if the onSubmit function was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();

    // Check if the onClose function was not called
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});