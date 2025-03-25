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
    fireEvent.change(sortDropdown, { target: { value: 'name-asc' } });

    expect(screen.getByDisplayValue('Name (A-Z)')).toBeInTheDocument();
  });

  it('handles pagination', () => {
    render(<UserTable {...mockProps} />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(mockProps.onPageChange).toHaveBeenCalledWith(2);

    const prevButton = screen.getByText('Previous');
    fireEvent.click(prevButton);

    expect(mockProps.onPageChange).toHaveBeenCalledWith(0);
  });

  it('handles user selection', () => {
    render(<UserTable {...mockProps} />);

    const firstCheckbox = screen.getAllByRole('checkbox')[1];
    fireEvent.click(firstCheckbox);

    expect(mockProps.setSelectedIds).toHaveBeenCalledWith([1]);
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

    const editButton = screen.getByLabelText('Edit')[0];
    fireEvent.click(editButton);

    expect(mockProps.onEdit).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('handles "Delete Selected" button click', () => {
    render(<UserTable {...mockProps} selectedIds={[1]} />);

    const deleteButton = screen.getByText('Delete Selected (1)');
    fireEvent.click(deleteButton);

    expect(mockProps.onDelete).toHaveBeenCalled();
  });
});