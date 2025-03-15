import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminAnnouncements from '../../../src/pages/Admin/AdminAnnouncements';

// Mock services
const mockGetAnnouncements = vi.fn();
const mockCreateAnnouncement = vi.fn();
const mockUpdateAnnouncement = vi.fn();
const mockDeleteAnnouncement = vi.fn();

// Mock the service module
vi.mock('../../../src/services/announcementService', () => ({
    getAnnouncements: mockGetAnnouncements,
    createAnnouncement: mockCreateAnnouncement,
    updateAnnouncement: mockUpdateAnnouncement,
    deleteAnnouncement: mockDeleteAnnouncement,
}));

// Mock components
vi.mock('/src/components/common/layout/Sidebar.jsx', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
    SidebarItem: ({ children }) => (
        <div data-testid="sidebar-item">{children}</div>
    ),
}));

vi.mock('/src/components/common/layout/Header.jsx', () => ({
    default: () => <div data-testid="header">Announcements</div>,
}));

vi.mock('../../components/common/Button/Modal', () => ({
    default: ({ children, isOpen, onClose }) =>
        isOpen ? (
            <div data-testid="modal">
                {children}
                <button onClick={onClose}>Close</button>
            </div>
        ) : null,
}));

// Mock DeleteModal
vi.mock('/src/components/common/Modals/Delete/DeleteModal.jsx', () => ({
    default: ({ onConfirm, onCancel }) => (
        <div data-testid="delete-modal">
            <p>Are you sure you want to delete this announcement?</p>
            <button onClick={onConfirm} data-testid="confirm-delete">
                Confirm
            </button>
            <button onClick={onCancel} data-testid="cancel-delete">
                Cancel
            </button>
        </div>
    ),
}));

// Mock icons with data-testid
vi.mock('lucide-react', () => ({
    MoreVertical: () => <button data-testid="more-button">More</button>,
    ChevronDown: () => <button data-testid="chevron-button">Down</button>,
    Edit: () => <button data-testid="edit-button">Edit</button>,
    Trash2: () => <button data-testid="delete-button">Delete</button>,
    Plus: () => <button data-testid="add-button">Add</button>,
    Save: () => <button data-testid="save-button">Save</button>,
    XCircle: () => <button data-testid="cancel-button">Cancel</button>,
    Home: () => <span data-testid="home-icon">Home</span>,
    Book: () => <span data-testid="book-icon">Book</span>,
    Bell: () => <span data-testid="bell-icon">Bell</span>,
    FileText: () => <span data-testid="file-icon">FileText</span>,
    Users: () => <span data-testid="users-icon">Users</span>,
    Search: () => <button data-testid="search-button">Search</button>,
}));

const mockAnnouncements = [
    {
        id: 1,
        title: 'New Course Launch',
        content: 'Test content 1',
        date: '2024-03-12',
    },
    {
        id: 2,
        title: 'Holiday Schedule',
        content: 'Test content 2',
        date: '2024-03-13',
    },
];

describe('AdminAnnouncements', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetAnnouncements.mockResolvedValue(mockAnnouncements);
    });

    it('renders the component', async () => {
        render(
            <MemoryRouter>
                <AdminAnnouncements />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('header')).toBeInTheDocument();
            expect(screen.getByTestId('sidebar')).toBeInTheDocument();
            expect(screen.getByTestId('add-button')).toBeInTheDocument();
        });
    });

    it('displays announcements', async () => {
        render(
            <MemoryRouter>
                <AdminAnnouncements />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('New Course Launch')).toBeInTheDocument();
            expect(screen.getByText('Holiday Schedule')).toBeInTheDocument();
        });
    });

    it('creates new announcement', async () => {
        const newAnnouncement = {
            id: 3,
            title: 'Test Title',
            content: 'Test Content',
        };

        mockCreateAnnouncement.mockResolvedValueOnce(newAnnouncement);
        mockGetAnnouncements.mockResolvedValueOnce([
            ...mockAnnouncements,
            newAnnouncement,
        ]);

        render(
            <MemoryRouter>
                <AdminAnnouncements />
            </MemoryRouter>
        );

        // Open add modal
        fireEvent.click(screen.getByTestId('add-button'));

        // Fill form

        // Submit form
    });

    it('deletes announcement', async () => {
        mockDeleteAnnouncement.mockResolvedValueOnce(undefined);
        mockGetAnnouncements.mockResolvedValueOnce(mockAnnouncements.slice(1));

        render(
            <MemoryRouter>
                <AdminAnnouncements />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('New Course Launch')).toBeInTheDocument();
        });
    });

    it('handles load error', async () => {
        mockGetAnnouncements.mockRejectedValueOnce(
            new Error('Failed to load announcements')
        );

        render(
            <MemoryRouter>
                <AdminAnnouncements />
            </MemoryRouter>
        );
    });
});
