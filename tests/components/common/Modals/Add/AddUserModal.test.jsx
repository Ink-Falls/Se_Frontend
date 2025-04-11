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
    expect(screen.getByPlaceholderText(/up to 2 letters/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter contact number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
  });

  it('should call onClose when the cancel button is clicked', () => {
    renderComponent();

    // Click the cancel button
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Check if the onClose function was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display an error message when birth date is in the future', async () => {
    renderComponent();

    // Fill out the form with a future birth date
    fireEvent.change(screen.getByPlaceholderText(/enter first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/enter last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/up to 2 letters/i), { target: { value: 'A' } });
    fireEvent.change(screen.getByPlaceholderText(/enter email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter contact number/i), { target: { value: '09123456789' } });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { value: 'Password1!' } });
    
    // For birth date, use getByPlaceholderText
    const birthDateInput = screen.getByPlaceholderText(/select birth date/i);
    fireEvent.change(birthDateInput, { target: { value: '2030-01-01' } });
    
    // For select elements, select by ID
    const schoolSelect = document.getElementById('school_id');
    fireEvent.change(schoolSelect, { target: { value: '1001' } });
    
    const roleSelect = document.getElementById('role');
    fireEvent.change(roleSelect, { target: { value: 'teacher' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add user/i }));

    // Check if the birth date validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(/birth date cannot be in the future/i)).toBeInTheDocument();
    });

    // Check if the createUser function was not called
    expect(createUser).not.toHaveBeenCalled();
  });

  it('should display section and department fields when student_teacher role is selected', async () => {
    renderComponent();

    // Initially select a non-student-teacher role to ensure fields aren't visible
    const roleSelect = document.getElementById('role');
    fireEvent.change(roleSelect, { target: { value: 'teacher' } });
    
    // The section and department fields should not be visible yet
    expect(screen.queryByPlaceholderText(/enter section/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/enter department/i)).not.toBeInTheDocument();

    // Now change to student_teacher role
    fireEvent.change(roleSelect, { target: { value: 'student_teacher' } });
    
    // The section and department fields should now be visible
    expect(screen.getByPlaceholderText(/enter section/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter department/i)).toBeInTheDocument();
  });
});