import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotificationsComponent from '../../../src/pages/Teacher/NotificationsComponent';
import { vi } from 'vitest';

// NotificationsComponent.test.jsx

// Mock data
const mockNotifications = [
    {
        id: 1,
        type: 'new submission',
        description: 'John Doe submitted assignment 1',
        time: '2023-01-01 10:00',
        userImage: 'path/to/image1.jpg',
    },
    {
        id: 2,
        type: 'new announcement',
        description: 'New course announcement',
        time: '2023-01-02 11:00',
        userImage: 'path/to/image2.jpg',
    },
];

// Wrapper component for router context
const ComponentWrapper = ({ children }) => (
    <BrowserRouter>{children}</BrowserRouter>
);

describe('NotificationsComponent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without notifications', () => {
        render(<NotificationsComponent />, { wrapper: ComponentWrapper });
        expect(screen.getByText('No new notifications')).toBeInTheDocument();
    });

    it('renders with notifications', () => {
        render(<NotificationsComponent notifications={mockNotifications} />, {
            wrapper: ComponentWrapper,
        });
        expect(
            screen.getByText('John Doe submitted assignment 1')
        ).toBeInTheDocument();
        expect(screen.getByText('New course announcement')).toBeInTheDocument();
    });

    it('displays correct notification count', () => {
        render(<NotificationsComponent notifications={mockNotifications} />, {
            wrapper: ComponentWrapper,
        });
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('toggles sort order dropdown', () => {
        render(<NotificationsComponent notifications={mockNotifications} />, {
            wrapper: ComponentWrapper,
        });
        const sortButton = screen.getByText(/Newest first/);
        fireEvent.click(sortButton);
        expect(screen.getByText('Oldest first')).toBeInTheDocument();
    });

    it('changes sort order when selecting from dropdown', () => {
        render(<NotificationsComponent notifications={mockNotifications} />, {
            wrapper: ComponentWrapper,
        });

        // Open dropdown
        fireEvent.click(screen.getByText(/Newest first/));

        // Click "Oldest first"
        fireEvent.click(screen.getByText('Oldest first'));

        // Verify sort order changed
        expect(screen.getByText(/Oldest first/)).toBeInTheDocument();
    });

    it('applies correct styles for different notification types', () => {
        render(<NotificationsComponent notifications={mockNotifications} />, {
            wrapper: ComponentWrapper,
        });

        const submissionBadge = screen.getByText('new submission');
        const announcementBadge = screen.getByText('new announcement');

        expect(submissionBadge.className).toContain('bg-blue-100');
        expect(announcementBadge.className).toContain('bg-yellow-100');
    });

    it('renders notification timestamps', () => {
        render(<NotificationsComponent notifications={mockNotifications} />, {
            wrapper: ComponentWrapper,
        });

        expect(screen.getByText('2023-01-01 10:00')).toBeInTheDocument();
        expect(screen.getByText('2023-01-02 11:00')).toBeInTheDocument();
    });
});
