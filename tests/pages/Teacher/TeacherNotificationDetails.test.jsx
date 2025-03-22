import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import NotificationPage from '../../../src/pages/Teacher/TeacherNotificationDetails';

// Mock the dependencies
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
    useParams: vi.fn(),
    useLocation: vi.fn(),
}));

vi.mock('../../../src/components/common/layout/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('../../../src/components/common/layout/Header', () => ({
    default: () => <div data-testid="header">Header</div>,
}));

vi.mock('../../../src/components/common/layout/MobileNavbar', () => ({
    default: () => <div data-testid="mobile-navbar">MobileNavBar</div>,
}));

describe('NotificationPage', () => {
    const mockNavigate = vi.fn();
    const mockNotification = {
        userImage: '/mock-image.jpg',
        type: 'Submission',
        time: '2 hours ago',
        description: 'Test notification description',
    };

    beforeEach(() => {
        useNavigate.mockReturnValue(mockNavigate);
        useParams.mockReturnValue({ id: '123' });
    });

    it('renders notification details when notification data is present', () => {
        useLocation.mockReturnValue({
            state: { notification: mockNotification },
        });

        render(<NotificationPage />);

        expect(screen.getByText('Details')).toBeInTheDocument();
        expect(
            screen.getByText(mockNotification.description)
        ).toBeInTheDocument();
        expect(screen.getByText(mockNotification.type)).toBeInTheDocument();
        expect(screen.getByText(mockNotification.time)).toBeInTheDocument();
    });

    it('renders error state when notification data is missing', () => {
        useLocation.mockReturnValue({ state: {} });

        render(<NotificationPage />);

        expect(screen.getByText('Notification not found.')).toBeInTheDocument();
        expect(screen.getByText('Back to Notifications')).toBeInTheDocument();
    });

    it('navigates back when clicking the back button in error state', () => {
        useLocation.mockReturnValue({ state: {} });

        render(<NotificationPage />);

        fireEvent.click(screen.getByText('Back to Notifications'));
        expect(mockNavigate).toHaveBeenCalledWith('/Teacher/Notifications');
    });

    it('navigates back when clicking the back button in details view', () => {
        useLocation.mockReturnValue({
            state: { notification: mockNotification },
        });

        render(<NotificationPage />);

        fireEvent.click(screen.getByText('Back'));
        expect(mockNavigate).toHaveBeenCalledWith('/Teacher/Notifications');
    });

    it('applies correct styles for submission type notification', () => {
        useLocation.mockReturnValue({
            state: {
                notification: {
                    ...mockNotification,
                    type: 'Submission',
                },
            },
        });

        render(<NotificationPage />);

        const typeElement = screen.getByText('Submission');
        expect(typeElement).toHaveClass(
            'bg-blue-100',
            'text-blue-800',
            'border-blue-200'
        );
    });

    it('applies correct styles for non-submission type notification', () => {
        useLocation.mockReturnValue({
            state: {
                notification: {
                    ...mockNotification,
                    type: 'Alert',
                },
            },
        });

        render(<NotificationPage />);

        const typeElement = screen.getByText('Alert');
        expect(typeElement).toHaveClass(
            'bg-yellow-100',
            'text-yellow-800',
            'border-yellow-200'
        );
    });

    it('renders all required layout components', () => {
        useLocation.mockReturnValue({
            state: { notification: mockNotification },
        });

        render(<NotificationPage />);

        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('mobile-navbar')).toBeInTheDocument();
    });
});
