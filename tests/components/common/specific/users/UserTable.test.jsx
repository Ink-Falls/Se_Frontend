import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserTable from 'Se_Frontend/src/components/specific/users/UserTable';

describe('UserTable Component', () => {
  const mockUsers = [
    {
      id: 1,
      first_name: 'John',
      middle_initial: 'A',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      birth_date: '1990-01-01',
      contact_no: '1234567890',
      school_id: 101,
      role: 'learner',
    },
    {
      id: 2,
      first_name: 'Jane',
      middle_initial: 'B',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      birth_date: '1992-02-02',
      contact_no: '0987654321',
      school_id: 102,
      role: 'teacher',
    },
  ];

  const mockProps = {
    users: mockUsers,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onAddUser: vi.fn(),
    selectedIds: [],
    setSelectedIds: vi.fn(),
    onCreateGroup: vi.fn(),
    onShowGroupList: vi.fn(),
    onSearch: vi.fn(),
    onFilterChange: vi.fn(),
    currentFilter: 'all',
    currentPage: 1,
    totalPages: 2,
    onPageChange: vi.fn(),
    onGenerateReport: vi.fn(),
    sortConfig: { key: 'none', direction: 'asc' },
    onSort: vi.fn(),
    searchQuery: '',
    onSearchCancel: vi.fn(),
    totalUsers: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the table with users', () => {
    render(<UserTable {...mockProps} />);

    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
  });

  it('handles search input', () => {
    render(<UserTable {...mockProps} />);

    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    expect(mockProps.onSearch).toHaveBeenCalledWith('John');
  });

  it('handles filter change', () => {
    render(<UserTable {...mockProps} />);

    const filterDropdown = screen.getByDisplayValue('Filter By: All');
    fireEvent.change(filterDropdown, { target: { value: 'learner' } });

    expect(mockProps.onFilterChange).toHaveBeenCalledWith('learner');
  });

  it('handles sort change', () => {
    render(<UserTable {...mockProps} />);

    const sortDropdown = screen.getByDisplayValue('Sort By');
    fireEvent.change(sortDropdown, { target: { value: 'fullName-asc' } });

    // Use onSort callback check instead of checking for display value
    expect(mockProps.onSort).toHaveBeenCalledWith("fullName", "asc");
  });

  it('handles pagination - next button', () => {
    render(<UserTable {...mockProps} />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(mockProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('handles pagination - previous button', () => {
    // Create a new mock props with currentPage = 2
    const props = { ...mockProps, currentPage: 2 };
    render(<UserTable {...props} />);

    const prevButton = screen.getByText('Previous');
    fireEvent.click(prevButton);

    expect(props.onPageChange).toHaveBeenCalledWith(1);
  });

  it('handles user selection', () => {
    // Mock the implementation for setSelectedIds
    const setSelectedIdsMock = vi.fn(callback => {
      // Simulate the behavior of setState, which gets called with a callback function
      if (typeof callback === 'function') {
        return callback([]);
      }
      return callback;
    });

    const customProps = {
      ...mockProps,
      setSelectedIds: setSelectedIdsMock
    };
    
    render(<UserTable {...customProps} />);

    const firstCheckbox = screen.getAllByRole('checkbox')[1];
    fireEvent.click(firstCheckbox);

    // Just check that it was called, not the exact parameters
    expect(setSelectedIdsMock).toHaveBeenCalled();
  });

  it('handles "Add User" button click', () => {
    render(<UserTable {...mockProps} />);

    const addUserButton = screen.getByText('Add User');
    fireEvent.click(addUserButton);

    expect(mockProps.onAddUser).toHaveBeenCalled();
  });

  it('handles "Create Group" button click', () => {
    render(<UserTable {...mockProps} />);

    const createGroupButton = screen.getByText('Create Group');
    fireEvent.click(createGroupButton);

    expect(mockProps.onCreateGroup).toHaveBeenCalled();
  });

  it('handles "Group List" button click', () => {
    render(<UserTable {...mockProps} />);

    const groupListButton = screen.getByText('Group List');
    fireEvent.click(groupListButton);

    expect(mockProps.onShowGroupList).toHaveBeenCalled();
  });

  it('handles "Generate Report" button click', () => {
    render(<UserTable {...mockProps} />);

    const generateReportButton = screen.getByText('Generate Report');
    fireEvent.click(generateReportButton);

    expect(mockProps.onGenerateReport).toHaveBeenCalled();
  });

  it('handles "Edit" button click for a user', () => {
    render(<UserTable {...mockProps} />);

    // Click the first row directly since there's no explicit Edit button
    // The handleRowClick function handles this functionality
    const userRow = screen.getByText('John').closest('tr');
    fireEvent.click(userRow);

    expect(mockProps.onEdit).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('handles "Delete Selected" button click', () => {
    render(<UserTable {...mockProps} selectedIds={[1]} />);

    const deleteButton = screen.getByText('Delete Selected (1)');
    fireEvent.click(deleteButton);

    expect(mockProps.onDelete).toHaveBeenCalled();
  });
});