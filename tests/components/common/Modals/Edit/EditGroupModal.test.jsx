import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import EditGroupModal from 'Se_Frontend/src/components/common/Modals/Edit/EditGroupModal.jsx'; // Adjust the import according to your file structure
import { describe, it, expect, vi } from 'vitest';
import { getAvailableMembers, updateGroup, getGroupMembers, updateGroupMembers } from 'Se_Frontend/src/services/groupService.js'; // Adjust the import according to your file structure

vi.mock('Se_Frontend/src/services/groupService.js', () => ({
  getAvailableMembers: vi.fn(),
  updateGroup: vi.fn(),
  getGroupMembers: vi.fn(),
  updateGroupMembers: vi.fn(),
}));

describe('EditGroupModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn();
  const group = {
    id: 1,
    name: 'Test Group',
    groupType: 'learner'
  };

  const renderComponent = () => {
    return render(
      <EditGroupModal group={group} isOpen={true} onClose={mockOnClose} onUpdate={mockOnUpdate} />
    );
  };

  beforeEach(() => {
    getAvailableMembers.mockResolvedValue([
      { id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com' },
      { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com' },
    ]);

    getGroupMembers.mockResolvedValue([
      { id: 3, first_name: 'Alice', last_name: 'Johnson', email: 'alice.johnson@example.com' },
      { id: 4, first_name: 'Bob', last_name: 'Brown', email: 'bob.brown@example.com' },
    ]);

    mockOnClose.mockClear();
    mockOnUpdate.mockClear();
  });

  it('should display an error message on form submission failure', async () => {
    updateGroup.mockRejectedValueOnce(new Error('Failed to update group'));
  
    renderComponent();
  
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/group name/i), { target: { value: 'Updated Group' } });
    //fireEvent.change(screen.getByRole('combobox', { name: /group type/i }), { target: { value: 'learner' } });
  
    // Submit the form
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeEnabled();
    });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
  
    // Check if the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to update group/i)).toBeInTheDocument();
    });
  
    // Check if the onUpdate function was not called
    expect(mockOnUpdate).not.toHaveBeenCalled();
  
    // Check if the onClose function was not called
    expect(mockOnClose).not.toHaveBeenCalled();
  });
  it('should call onClose when the cancel button is clicked', () => {
    renderComponent();

    // Click the cancel button
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Check if the onClose function was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should submit the form and call onUpdate on success', async () => {
    updateGroup.mockResolvedValueOnce({ id: 1, name: 'Updated Group', groupType: 'learner' });
  
    renderComponent();
  
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/group name/i), { target: { value: 'Updated Group' } });
  
    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    });
  
    // Check if the updateGroup function was called with the correct data
    expect(updateGroup).toHaveBeenCalledWith(1, {
      name: 'Updated Group',
      groupType: 'learner', // Ensure the original groupType is passed
    });
  
    // Check if the onUpdate function was called
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
  
    // Check if the onClose function was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  it('should display an error message on form submission failure', async () => {
    updateGroup.mockRejectedValueOnce(new Error('Failed to update group'));

    renderComponent();

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/group name/i), { target: { value: 'Updated Group' } });
    //fireEvent.change(screen.getByLabelText(/group type/i), { target: { value: 'learner' } });

    // Submit the form
    await waitFor(() => {
        expect(screen.getByRole('button', { name: /save changes/i })).toBeEnabled();
      });
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      

    // Check if the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to update group/i)).toBeInTheDocument();
    });

    // Check if the onUpdate function was not called
    expect(mockOnUpdate).not.toHaveBeenCalled();

    // Check if the onClose function was not called
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // it('should add a member to the group', async () => {
  //   renderComponent();

  //   // Add a member
  //   fireEvent.click(screen.getAllByRole('button')[0]); // Clicks the first button

  //   // Check if the member is added to the current members list
  //   await waitFor(() => {
  //       expect(screen.getByText(/john doe/i)).toBeInTheDocument();
  //     });
      
  // });

  it('should remove a member from the group', async () => {
    renderComponent();

    // Remove a member
    const removeButtons = screen.getAllByRole('button');
    fireEvent.click(removeButtons[0]); // Click the first "remove" button


    // Check if the member is removed from the current members list
    expect(screen.queryByText(/alice johnson/i)).not.toBeInTheDocument();
  });
});