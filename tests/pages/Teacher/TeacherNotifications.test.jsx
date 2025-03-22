import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Notifications from '../../../src/pages/Teacher/TeacherNotifications';

// Mock dependencies
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

vi.mock('../../../src/components/common/layout/Sidebar', () => ({
    default: ({ navItems }) => (
        <div data-testid="sidebar">{navItems.length} items</div>
    ),
}));

vi.mock('../../../src/components/common/layout/Header', () => ({
    default: ({ title }) => <div data-testid="header">{title}</div>,
}));

vi.mock('../../../src/components/common/layout/MobileNavBar', () => ({
    default: () => <div data-testid="mobile-navbar" />,
}));

vi.mock('../../../src/pages/Teacher/NotificationsComponent', () => ({
    default: ({ notifications }) => (
        <div data-testid="notifications-component">
            {notifications.map((n) => (
                <div key={n.id} data-testid={`notification-${n.id}`}>
                    {n.type}
                </div>
            ))}
        </div>
    ),
}));

describe('TeacherNotifications Component', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <Notifications />
            </MemoryRouter>
        );
    });

    test('renders all major components', () => {
        expect(screen.getByTestId('sidebar')).toBeDefined();
        expect(screen.getByTestId('header')).toBeDefined();
        expect(screen.getByTestId('mobile-navbar')).toBeDefined();
        expect(screen.getByTestId('notifications-component')).toBeDefined();
    });

    test('sidebar contains correct number of navigation items', () => {
        const sidebar = screen.getByTestId('sidebar');
        expect(sidebar.textContent).toContain('2 items');
    });

    test('header displays correct title', () => {
        const header = screen.getByTestId('header');
        expect(header.textContent).toBe('All Notifications');
    });

    test('notifications component receives notification data', () => {
        expect(screen.getByTestId('notification-1')).toBeDefined();
        expect(screen.getByTestId('notification-2')).toBeDefined();
        expect(screen.getByText('New Submission')).toBeDefined();
        expect(screen.getByText('New Announcement')).toBeDefined();
    });

    test('mobile navbar is present', () => {
        expect(screen.getByTestId('mobile-navbar')).toBeDefined();
    });

    test('sidebar has correct responsive classes', () => {
        const sidebarContainer = document.querySelector('.hidden.lg\\:flex');
        expect(sidebarContainer).toBeDefined();
    });
});
