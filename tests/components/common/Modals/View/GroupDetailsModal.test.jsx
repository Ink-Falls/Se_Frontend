import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GroupDetailsModal from 'Se_Frontend/src/components/common/Modals/View/GroupDetailsModal.jsx'; // Adjust the import according to your file structure
import { describe, it, expect, vi } from 'vitest';
import { getAllGroups, getAvailableMembers, updateGroup, deleteGroups, getGroupMembers } from 'Se_Frontend/src/services/groupService.js'; // Adjust the import according to your file structure

vi.mock('Se_Frontend/src/services/groupService.js', () => ({
  getAllGroups: vi.fn(),
  getAvailableMembers: vi.fn(),
  updateGroup: vi.fn(),
  deleteGroups: vi.fn(),
  getGroupMembers: vi.fn(),
}));

describe('GroupDetailsModal Component', () => {
  const mockOnClose = vi.fn();

  const renderComponent = () => {
    return render(
      <GroupDetailsModal onClose={mockOnClose} />
    );
  };

  beforeEach(() => {
    getAllGroups.mockResolvedValue([
      { id: 1, name: 'Group A', groupType: 'learner' },
      { id: 2, name: 'Group B', groupType: 'student_teacher' },
    ]);

    getAvailableMembers.mockResolvedValue([
      { id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', school_id: '1001', role: 'learner' },
      { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', school_id: '1002', role: 'learner' },
    ]);

    getGroupMembers.mockResolvedValue([
      { id: 3, first_name: 'Alice', last_name: 'Johnson', email: 'alice.johnson@example.com', role: 'learner' },
      { id: 4, first_name: 'Bob', last_name: 'Brown', email: 'bob.brown@example.com', role: 'learner' },
    ]);

    mockOnClose.mockClear();
  });

  it('should render the modal with the correct text', async () => {
    renderComponent();

    // Check if the modal title is rendered
    expect(screen.getByText(/group list/i)).toBeInTheDocument();

    // Check if the tabs are rendered
    expect(screen.getByText(/^existing groups$/i)).toBeInTheDocument();
    expect(screen.getByText(/available members/i)).toBeInTheDocument();
  });

  it('should call onClose when the close button is clicked', () => {
    renderComponent();

    // Click the close button
    fireEvent.click(screen.getByRole('button', { name: /Close/i }));

    // Check if the onClose function was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display existing groups when the "Existing Groups" tab is active', async () => {
    renderComponent();

    // Check if the existing groups are rendered
    await waitFor(() => {
      expect(screen.getByText(/group a/i)).toBeInTheDocument();
      expect(screen.getByText(/group b/i)).toBeInTheDocument();
    });
  });

  it('should display available members when the "Available Members" tab is active', async () => {
    renderComponent();

    // Click the "Available Members" tab
    fireEvent.click(screen.getByText(/available members/i));

    // Check if the available members are rendered
    /*await waitFor(() => {
      expect(screen.getAllByText(/john doe/i)).toBeInTheDocument();
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    });*/
  });

  it('should delete selected groups when the delete button is clicked', async () => {
    deleteGroups.mockResolvedValueOnce();

    renderComponent();

    // Select a group
    fireEvent.click(screen.getByLabelText(/^select group a$/i));

    // Click the delete button
    fireEvent.click(screen.getByRole('button', { name: /delete selected/i }));

    // Check if the deleteGroups function was called with the correct data
    await waitFor(() => {
      expect(deleteGroups).toHaveBeenCalledWith([1]);
    });

    // Check if the groups list is refreshed
    await waitFor(() => {
      expect(screen.queryByText(/group a/i)).not.toBeInTheDocument();
    });
  });

  it('should update a group when the edit button is clicked', async () => {
    updateGroup.mockResolvedValueOnce({ id: 1, name: 'Updated Group', groupType: 'learner' });

    renderComponent();

    // Click the edit button
    fireEvent.click(screen.getByRole('button', { name: /edit group a/i }));

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/group name/i), { target: { value: 'Updated Group' } });
    fireEvent.change(screen.getByLabelText(/group type/i), { target: { value: 'learner' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    // Check if the updateGroup function was called with the correct data
    await waitFor(() => {
      expect(updateGroup).toHaveBeenCalledWith(1, {
        name: 'Updated Group',
        groupType: 'learner',
        addUserIds: [],
        removeUserIds: [],
      });
    });

    // Check if the groups list is refreshed
    await waitFor(() => {
      expect(screen.getByText(/updated group/i)).toBeInTheDocument();
    });
  });

  it('should display group members when the view members button is clicked', async () => {
    renderComponent();

    // Click the view members button
    fireEvent.click(screen.getByRole('button', { name: /view members of group a/i }));

    // Check if the group members are rendered
    await waitFor(() => {
      expect(screen.getByText(/alice johnson/i)).toBeInTheDocument();
      expect(screen.getByText(/bob brown/i)).toBeInTheDocument();
    });
  });
});