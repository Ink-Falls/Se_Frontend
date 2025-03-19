import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateGroupModal from 'Se_Frontend/src/components/common/Modals/Create/CreateGroupModal.jsx'; // Adjust the import according to your file structure
import { describe, it, expect, vi } from 'vitest';
import { getAvailableMembers, createGroup, getAllGroups } from 'Se_Frontend/src/services/groupService.js'; // Adjust the import according to your file structure

vi.mock('Se_Frontend/src/services/groupService.js', () => ({
  getAvailableMembers: vi.fn(),
  createGroup: vi.fn(),
  getAllGroups: vi.fn(),
}));

describe('CreateGroupModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  const renderComponent = () => {
    return render(
      <CreateGroupModal onClose={mockOnClose} onSave={mockOnSave} />
    );
  };

  beforeEach(() => {
    getAvailableMembers.mockResolvedValue([
      { id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', school_id: '1001', role: 'learner' },
      { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', school_id: '1002', role: 'learner' },
    ]);

    getAllGroups.mockResolvedValue([
      { id: 1, name: 'Group A', type: 'learner' },
      { id: 2, name: 'Group B', type: 'student_teacher' },
    ]);
  });

  it('should render the modal with form fields', async () => {
    renderComponent();

    // Check if the modal title is rendered
    expect(screen.getByText(/create new group/i)).toBeInTheDocument();

    // Check if the form fields are rendered
    expect(screen.getByPlaceholderText(/Enter group name/i), { target: { value: 'Test Group' } });
    expect(screen.getByLabelText(/Group type/i), { target: { value: 'learner' } });

  });

  it('should call onClose when the cancel button is clicked', () => {
    renderComponent();

    // Click the cancel button
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Check if the onClose function was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should submit the form and call onSave on success', async () => {
    createGroup.mockResolvedValueOnce({ id: 1, name: 'Test Group', message: 'Group created successfully!' });

    renderComponent();

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText(/Enter group name/i), { target: { value: 'Test Group' } });
    fireEvent.change(screen.getByLabelText(/Group type/i), { target: { value: 'learner' } });

    // Add a member
    const addButtons = screen.getAllByRole('button'); 
    fireEvent.click(addButtons[0]); 

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create group/i }));

    // Check if the createGroup function was called with the correct data
    await waitFor(() => {
      expect(createGroup).toHaveBeenCalledWith({
        name: 'Test Group',
        type: 'learner',
        memberIds: [1],
      });
    });

    // Check if the onSave function was called
    expect(mockOnSave).toHaveBeenCalledWith({ id: 1, name: 'Test Group', message: 'Group created successfully!' });

    // Check if the onClose function was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display an error message on form submission failure', async () => {
    createGroup.mockRejectedValueOnce(new Error('Failed to create group'));

    renderComponent();

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText(/Enter group name/i), { target: { value: 'Test Group' } });
    fireEvent.change(screen.getByLabelText(/Group type/i), { target: { value: 'learner' } });

    // Add a member
    const addButtons = screen.getAllByRole('button'); 
    fireEvent.click(addButtons[0]); // Click the first button



    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create group/i }));

    // Check if the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to create group/i)).toBeInTheDocument();
    });

    // Check if the onSave function was not called
    expect(mockOnSave).not.toHaveBeenCalled();

    // Check if the onClose function was not called
    //expect(mockOnClose).not.toHaveBeenCalled();
    

  });

  it('should display validation errors when form is invalid', async () => {
    renderComponent();

    // Submit the form without filling it out
    fireEvent.click(screen.getByRole('button', { name: /create group/i }));

    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/group name is required/i)).toBeInTheDocument();
    });

    // Check if the createGroup function was not called
    expect(createGroup).not.toHaveBeenCalled();
  });
});