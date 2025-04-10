import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import GroupDetailsModal from 'Se_Frontend/src/components/common/Modals/View/GroupDetailsModal.jsx'; // Adjust the import according to your file structure
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllGroups, getAvailableMembers, updateGroup, deleteGroups, getGroupMembers } from 'Se_Frontend/src/services/groupService.js'; // Adjust the import according to your file structure

// Mocking localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key) => {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

vi.mock('Se_Frontend/src/services/groupService.js', () => ({
  getAllGroups: vi.fn(),
  getAvailableMembers: vi.fn(),
  updateGroup: vi.fn(),
  deleteGroups: vi.fn(),
  getGroupMembers: vi.fn(),
  removeMember: vi.fn(),
}));

describe('GroupDetailsModal Component', () => {
  const mockOnClose = vi.fn();

  const renderComponent = () => {
    return render(
      <GroupDetailsModal isOpen={true} onClose={mockOnClose} />
    );
  };

  beforeEach(() => {
    // Setup localStorage with a token
    localStorage.setItem('token', 'fake-token');
    
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

    // Check if the available members are rendered after clicking the tab
    await waitFor(() => {
      expect(getAvailableMembers).toHaveBeenCalled();
    });
  });

  it('should delete selected groups when the delete button is clicked', async () => {
    deleteGroups.mockResolvedValueOnce({ message: 'Groups deleted successfully' });
  
    renderComponent();
  
    // Wait for groups to be rendered
    await waitFor(() => {
      expect(screen.getByText(/group a/i)).toBeInTheDocument();
    });
    
    // Find the group row by looking for the Group A text
    const groupAText = screen.getByText(/group a/i);
    
    // Get parent elements until we find the one containing the checkbox
    let groupContainer = groupAText;
    for (let i = 0; i < 5; i++) { // Go up a few levels
      if (!groupContainer.parentElement) break;
      groupContainer = groupContainer.parentElement;
      
      // Find all input elements in this container
      const inputs = groupContainer.querySelectorAll('input[type="checkbox"]');
      if (inputs.length > 0) {
        // Click the first checkbox we find
        fireEvent.click(inputs[0]);
        break;
      }
    }
  
    // Wait for the delete button to appear and click it
    await waitFor(() => {
      const deleteButton = screen.getByText(/delete selected/i);
      expect(deleteButton).toBeInTheDocument();
      fireEvent.click(deleteButton);
    });
  
    // Verify that the deleteGroups function was called
    await waitFor(() => {
      expect(deleteGroups).toHaveBeenCalled();
    });
  });

  it('should update a group when the edit button is clicked', async () => {
    updateGroup.mockResolvedValueOnce({ id: 1, name: 'Updated Group', groupType: 'learner' });

    renderComponent();

    // Wait for groups to be rendered
    await waitFor(() => {
      expect(screen.getByText(/group a/i)).toBeInTheDocument();
    });

    // Find the group row by looking for the Group A text
    const groupAText = screen.getByText(/group a/i);
    
    // Get parent elements until we find the container with the edit button
    let groupContainer = groupAText.parentElement;
    while (groupContainer && !groupContainer.querySelector('svg.lucide-pencil')) {
      groupContainer = groupContainer.parentElement;
    }
    
    // Find the button containing the PencilIcon
    const editButton = groupContainer.querySelector('button:has(svg.lucide-pencil)');
    fireEvent.click(editButton);

    // Wait for the edit form to appear
    await waitFor(() => {
      expect(screen.getByLabelText(/group name/i)).toBeInTheDocument();
    });

    // Fill out the form (these fields will be in the EditGroupModal component)
    fireEvent.change(screen.getByLabelText(/group name/i), { target: { value: 'Updated Group' } });
    
    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    // Check if the updateGroup function was called
    await waitFor(() => {
      expect(updateGroup).toHaveBeenCalled();
    });
  });

  it('should display group members when the view members button is clicked', async () => {
    renderComponent();

    // Wait for groups to be rendered
    await waitFor(() => {
      expect(screen.getByText(/group a/i)).toBeInTheDocument();
    });

    // Find the group row by looking for the Group A text
    const groupAText = screen.getByText(/group a/i);
    
    // Get parent elements until we find the container with the Users button
    let groupContainer = groupAText.parentElement;
    while (groupContainer && !groupContainer.querySelector('svg.lucide-users')) {
      groupContainer = groupContainer.parentElement;
    }
    
    // Find the button containing the Users icon
    const viewMembersButton = groupContainer.querySelector('button:has(svg.lucide-users)');
    fireEvent.click(viewMembersButton);

    // Check if the group members are rendered
    await waitFor(() => {
      expect(getGroupMembers).toHaveBeenCalled();
    });
  });
});