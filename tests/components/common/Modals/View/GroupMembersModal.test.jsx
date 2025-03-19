import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GroupMembersModal from 'Se_Frontend/src/components/common/Modals/View/GroupMembersModal.jsx'; // Adjust the import according to your file structure
import { describe, it, expect, vi } from 'vitest';

describe('GroupMembersModal Component', () => {
  const mockOnClose = vi.fn();
  const group = {
    id: 1,
    name: 'Test Group'
  };
  const members = [
    { id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', school_id: '1001', role: 'learner' },
    { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', school_id: '1002', role: 'learner' },
  ];

  const renderComponent = (isOpen = true, isLoading = false) => {
    return render(
      <GroupMembersModal isOpen={isOpen} onClose={mockOnClose} group={group} members={members} isLoading={isLoading} />
    );
  };

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should not render the modal when isOpen is false', () => {
    renderComponent(false);

    // Check if the modal is not rendered
    expect(screen.queryByText(/test group - members/i)).not.toBeInTheDocument();
  });

  it('should render the modal with the correct text', () => {
    renderComponent();

    // Check if the modal title is rendered
    expect(screen.getByText(/test group - members/i)).toBeInTheDocument();

    // Check if the members are rendered
    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
  });

  it('should display a loading message when isLoading is true', () => {
    renderComponent(true);

    // Check if the loading message is rendered
    expect(screen.findByText(/loading members.../i)).toBeInTheDocument();
  });

  it('should display a message when there are no members', () => {
    render(
      <GroupMembersModal isOpen={true} onClose={mockOnClose} group={group} members={[]} isLoading={false} />
    );

    // Check if the no members message is rendered
    expect(screen.getByText(/no members found in this group/i)).toBeInTheDocument();
  });

  it('should call onClose when the close button is clicked', () => {
    renderComponent();

    // Click the close button
    fireEvent.click(screen.getByRole('button', { name: /close/i }));

    // Check if the onClose function was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});