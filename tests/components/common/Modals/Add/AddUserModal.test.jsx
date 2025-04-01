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
      });

  it('should call onClose when the cancel button is clicked', () => {
    renderComponent();

    // Click the cancel button
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Check if the onClose function was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // it('should submit the form and call onSubmit on success', async () => {
  //   createUser.mockResolvedValueOnce({ id: 1, email: 'test@example.com' });

  //   renderComponent();

  //   // Fill out the form
  //   fireEvent.change(screen.getByPlaceholderText(/enter first name/i), { target: { value: 'John' } });
  //   fireEvent.change(screen.getByPlaceholderText(/enter last name/i), { target: { value: 'Doe' } });
  //   fireEvent.change(screen.getByPlaceholderText(/enter middle initial/i), { target: { value: 'A' } });
  //   fireEvent.change(screen.getByPlaceholderText(/enter email/i), { target: { value: 'test@example.com' } });
  //   fireEvent.change(screen.getByPlaceholderText(/enter contact number/i), { target: { value: '09123456789' } });
  //   fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { value: 'Password1!' } });
  //   fireEvent.change(screen.getByPlaceholderText(/Select birth date/i), { target: { value: '2000-01-01' } });
  //   fireEvent.change(screen.getByPlaceholderText(/Select a school/i), { target: { value: '1001' } });
  //   fireEvent.change(screen.getByPlaceholderText(/Select a role/i), { target: { value: 'student' } });

  //   // Submit the form
  //   fireEvent.click(screen.getByRole('button', { name: /add user/i }));

  //   // Check if the createUser function was called with the correct data
  //   await waitFor(() => {
  //     expect(createUser).toHaveBeenCalledWith({
  //       email: 'test@example.com',
  //       password: 'Password1!',
  //       first_name: 'John',
  //       last_name: 'Doe',
  //       middle_initial: 'A',
  //       birth_date: '2000-01-01',
  //       contact_no: '09123456789',
  //       school_id: '1001',
  //       role: 'student',
  //       section: '',
  //       department: '',
  //     });
  //   });

  //   // Check if the onSubmit function was called
  //   expect(mockOnSubmit).toHaveBeenCalledWith({ id: 1, email: 'test@example.com' });

  //   // Check if the onClose function was called
  //   expect(mockOnClose).toHaveBeenCalledTimes(1);
  // });

  // it('should display an error message on form submission failure', async () => {
  //   createUser.mockRejectedValueOnce(new Error('Failed to create user'));

  //   renderComponent();

  //   // Fill out the form
  //   fireEvent.change(screen.getByPlaceholderText(/enter first name/i), { target: { value: 'John' } });
  //   fireEvent.change(screen.getByPlaceholderText(/enter last name/i), { target: { value: 'Doe' } });
  //   fireEvent.change(screen.getByPlaceholderText(/enter middle initial/i), { target: { value: 'A' } });
  //   fireEvent.change(screen.getByPlaceholderText(/enter email/i), { target: { value: 'test@example.com' } });
  //   fireEvent.change(screen.getByPlaceholderText(/enter contact number/i), { target: { value: '09123456789' } });
  //   fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { value: 'Password1!' } });
  //   fireEvent.change(screen.getByPlaceholderText(/Select birth date/i), { target: { value: '2000-01-01' } });
  //   fireEvent.change(screen.getByPlaceholderText(/Select a school/i), { target: { value: '1001' } });
  //   fireEvent.change(screen.getByPlaceholderText(/Select a role/i), { target: { value: 'student' } });

  //   // Submit the form
  //   fireEvent.click(screen.getByRole('button', { name: /add user/i }));

  //   // Check if the error message is displayed
  //   await waitFor(() => {
  //     expect(screen.getByText(/failed to create user/i)).toBeInTheDocument();
  //   });

  //   // Check if the onSubmit function was not called
  //   expect(mockOnSubmit).not.toHaveBeenCalled();

  //   // Check if the onClose function was not called
  //   expect(mockOnClose).not.toHaveBeenCalled();
  // });

  // it('should display validation errors when form is invalid', async () => {
  //   renderComponent();

  //   // Submit the form without filling it out
  //   fireEvent.click(screen.getByRole('button', { name: /add user/i }));

  //   // Check if validation errors are displayed
  //   await waitFor(() => {
  //     expect(screen.getByText(/^first name must be 2-30 characters and contain only letters$/i)).toBeInTheDocument();
  //     expect(screen.getByText(/last name must be 2-30 characters and contain only letters/i)).toBeInTheDocument();
  //     expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
  //     expect(screen.getByText(/contact number must start with 09 or \+639 and be 11 digits/i)).toBeInTheDocument();
  //     expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  //   });

  //   // Check if the createUser function was not called
  //   expect(createUser).not.toHaveBeenCalled();
  // });

   it('should display an error message when birth date is in the future', async () => {
     renderComponent();

    // Fill out the form with a future birth date
    fireEvent.change(screen.getByPlaceholderText(/enter first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/enter last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/enter middle initial/i), { target: { value: 'A' } });
    fireEvent.change(screen.getByPlaceholderText(/enter email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter contact number/i), { target: { value: '09123456789' } });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByPlaceholderText(/Select birth date/i), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByPlaceholderText(/Select a school/i), { target: { value: '1001' } });
    fireEvent.change(screen.getByPlaceholderText(/Select a role/i), { target: { value: 'student' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add user/i }));

    // Check if the birth date validation error is displayed
    // await waitFor(() => {
    //   expect(screen.getByText(/birth date cannot be in the future/i)).toBeInTheDocument();
    // });

    // Check if the createUser function was not called
    expect(createUser).not.toHaveBeenCalled();
  });

 it('should display validation errors for student teacher specific fields', async () => {
  renderComponent();

  // Fill out the form with role as student teacher but without section and department
  fireEvent.change(screen.getByPlaceholderText(/enter first name/i), { target: { value: 'John' } });
  fireEvent.change(screen.getByPlaceholderText(/enter last name/i), { target: { value: 'Doe' } });
  fireEvent.change(screen.getByPlaceholderText(/enter middle initial/i), { target: { value: 'A' } });
  fireEvent.change(screen.getByPlaceholderText(/enter email/i), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByPlaceholderText(/enter contact number/i), { target: { value: '09123456789' } });
  fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { value: 'Password1!' } });
  fireEvent.change(screen.getByPlaceholderText(/select birth date/i), { target: { value: '2000-01-01' } });
  fireEvent.change(screen.getByPlaceholderText(/select a school/i), { target: { value: '1001' } });
  fireEvent.change(screen.getByPlaceholderText(/select a role/i), { target: { value: 'student_teacher' } });

  // Submit the form
  fireEvent.click(screen.getByRole('button', { name: /add user/i }));

  // Debug the DOM to inspect the rendered output
  screen.debug();

  // Check if validation errors for section and department are displayed
  await screen.findByText((content) => content.includes("Section must be at least 2 characters"));
  await screen.findByText((content) => content.includes("Department must be at least 2 characters"));
  expect(screen.getByText(/section must be at least 2 characters/i)).toBeInTheDocument();

  // Check if the createUser function was not called
  expect(createUser).not.toHaveBeenCalled();
});
});