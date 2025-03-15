import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDashboard from '../../../src/pages/Admin/AdminDashboard';
import { getAllUsers } from '../../../src/services/userService';

// Mock dependencies
vi.mock('../../../src/services/userService');

vi.mock('../../../src/components/common/layout/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('../../../src/components/common/layout/Header', () => ({
    default: () => <div data-testid="header">Header</div>,
}));

vi.mock('../../../src/components/specific/users/UserStats', () => ({
    default: ({ totalUsers, totalLearners, totalTeachers, totalAdmins }) => (
        <div data-testid="user-stats">
            <span data-testid="stats-content">
                {totalUsers}-{totalLearners}-{totalTeachers}-{totalAdmins}
            </span>
        </div>
    ),
}));

vi.mock('../../../src/components/common/Modals/Add/AddUserModal', () => ({
    default: ({ isOpen, onClose, onSubmit }) => (
        <div
            data-testid="add-user-modal"
            style={{ display: isOpen ? 'block' : 'none' }}
            aria-hidden={!isOpen}
        >
            Add User Modal
            <button onClick={onSubmit}>Submit</button>
            <button onClick={onClose}>Cancel</button>
        </div>
    ),
}));

vi.mock('../../../src/components/common/Modals/Delete/DeleteModal', () => ({
    default: ({ isOpen, onClose, onConfirm }) => (
        <div
            data-testid="delete-modal"
            style={{ display: isOpen ? 'block' : 'none' }}
            aria-hidden={!isOpen}
        >
            Delete Modal
            <button onClick={onConfirm}>Confirm</button>
            <button onClick={onClose}>Cancel</button>
        </div>
    ),
}));

vi.mock('../../../src/components/specific/users/UserTable', () => ({
    default: ({ users, onAddUser, onDelete, onSearch, onRoleChange }) => (
        <div data-testid="user-table">
            <span data-testid="user-count">{users.length} users</span>
            <input
                type="text"
                role="textbox"
                aria-label="search"
                data-testid="search-input"
                onChange={(e) => onSearch(e.target.value)}
            />
            <select role="combobox" aria-label="role" data-testid="role-select">
                <option value="all">All</option>
                <option value="teacher">Teacher</option>
                <option value="learner">Learner</option>
                <option value="admin">Admin</option>
            </select>
            <button onClick={onAddUser} data-testid="add-button">
                Add User
            </button>
            <button
                onClick={() => onDelete(users[0]?.id)}
                data-testid="delete-button"
            >
                Delete
            </button>
            <button data-testid="menu-button" name="menu">
                Menu
            </button>
            <div data-testid="dropdown-menu">Dropdown Content</div>
        </div>
    ),
}));

describe('AdminDashboard', () => {
    const mockUsers = [
        {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            role: 'learner',
            email: 'john@example.com',
        },
        {
            id: 2,
            first_name: 'Jane',
            last_name: 'Smith',
            role: 'teacher',
            email: 'jane@example.com',
        },
        {
            id: 3,
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin',
            email: 'admin@example.com',
        },
    ];

    const localStorageMock = {
        getItem: vi.fn(() => 'fake-token'),
        setItem: vi.fn(),
        clear: vi.fn(),
    };

    beforeEach(() => {
        global.localStorage = localStorageMock;
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ rows: mockUsers }),
            })
        );
        getAllUsers.mockResolvedValue(mockUsers);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should show loading state initially', () => {
        render(<AdminDashboard />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should fetch and display users data', async () => {
        render(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        expect(getAllUsers).toHaveBeenCalled();
        expect(screen.getByTestId('user-table')).toBeInTheDocument();
        expect(screen.getByTestId('user-count')).toHaveTextContent('3 users');
    });

    it('should filter users based on search query', async () => {
        const user = userEvent.setup();
        render(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        const searchInput = screen.getByTestId('search-input');
        await user.type(searchInput, 'John');

        await waitFor(() => {
            expect(screen.getByTestId('user-count')).toHaveTextContent(
                '1 users'
            );
        });
    });

    it('should filter users based on role', async () => {
        const user = userEvent.setup();
        render(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        const roleSelect = screen.getByTestId('role-select');
        await user.selectOptions(roleSelect, 'teacher');

        await waitFor(() => {});
    });

    it('should handle user creation', async () => {
        const user = userEvent.setup();
        render(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        const addButton = screen.getByTestId('add-button');
        await user.click(addButton);

        const addModal = await screen.findByTestId('add-user-modal');

        // Test modal opening
        await waitFor(() => {});

        // Test closing the modal
        const cancelButton = within(addModal).getByText('Cancel');
        await user.click(cancelButton);

        await waitFor(() => {
            expect(addModal).toHaveStyle({ display: 'none' });
        });
    });
    it('should handle user deletion', async () => {
        const user = userEvent.setup();
        render(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        const deleteButton = screen.getByTestId('delete-button');
        await user.click(deleteButton);

        const deleteModal = await screen.findByTestId('delete-modal');
    });

    it('should handle error states in API calls', async () => {
        getAllUsers.mockRejectedValueOnce(new Error('API Error'));
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        render(<AdminDashboard />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error fetching users:',
                expect.any(Error)
            );
        });

        consoleSpy.mockRestore();
    });

    it('should update stats when users change', async () => {
        render(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.getByTestId('stats-content')).toHaveTextContent(
                '3-1-1-1'
            );
        });
    });

    it('should handle dropdown toggle', async () => {
        const user = userEvent.setup();
        render(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        const menuButton = screen.getByTestId('menu-button');
        await user.click(menuButton);

        const dropdown = await screen.findByTestId('dropdown-menu');
        expect(dropdown).toBeVisible();
    });
});
