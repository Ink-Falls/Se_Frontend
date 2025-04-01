import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CreateGroupModal from 'Se_Frontend/src/components/common/Modals/Create/CreateGroupModal.jsx'; // Adjust the import according to your file structure
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
    expect(screen.getByPlaceholderText(/Enter group name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Group type/i)).toBeInTheDocument();
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
  
    // Render the component and wait for it to load
    await act(async () => {
      renderComponent();
    });
  
    // Wait for the available members to load
    await waitFor(() => {
      expect(screen.getByText(/Available Learners/i)).toBeInTheDocument();
    });
  
    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText(/Enter group name/i), { target: { value: 'Test Group' } });
    fireEvent.change(screen.getByLabelText(/Group type/i), { target: { value: 'learner' } });
  
    // Add a member
    const addMemberButton = screen.getByRole('button', { name: /add member/i });
    fireEvent.click(addMemberButton);
  
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create group/i }));
  
    // Check if the createGroup function was called with the correct data
    await waitFor(() => {
      expect(createGroup).toHaveBeenCalledWith({
        name: 'Test Group',
        type: 'learner',
        memberIds: [1], // ID of the added member
      });
    });
  
    // Check if the onSave function was called
    expect(mockOnSave).toHaveBeenCalledWith({ id: 1, name: 'Test Group', message: 'Group created successfully!' });
  
    // Check if the onClose function was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should display an error message on form submission failure", async () => {
    createGroup.mockRejectedValueOnce(new Error("Failed to create group"));

    renderComponent();

    // ✅ Wait for the component to finish loading available members
    await waitFor(() => {
      expect(screen.getByText(/Available Learners/i)).toBeInTheDocument();
    });

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText(/Enter group name/i), { target: { value: "Test Group" } });
    fireEvent.change(screen.getByLabelText(/Group Type/i), { target: { value: "learner" } });

    // ✅ Ensure the "Add Member" button is available before clicking
    const addMemberButton = await screen.findByRole("button", { name: /add member/i });
    fireEvent.click(addMemberButton);

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /create group/i }));

    // ✅ Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/failed to create group/i)).toBeInTheDocument();
    });

    // Ensure `onSave` and `onClose` are not called
    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
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