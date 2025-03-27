import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../src/contexts/AuthContext'; // Import AuthProvider
import AdminEnrollment from '../../../src/pages/Admin/AdminEnrollment';
import * as enrollmentService from '../../../src/services/enrollmentService';

// Mock the enrollment service
vi.mock('../../../src/services/enrollmentService');

// Mock the child components
vi.mock('/src/components/common/layout/Sidebar.jsx', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));
vi.mock('/src/components/common/layout/Header.jsx', () => ({
    default: ({ title }) => <div data-testid="header">{title}</div>,
}));
vi.mock('/src/components/specific/enrollments/EnrolleeStats.jsx', () => ({
    default: () => <div data-testid="enrollee-stats">EnrolleeStats</div>,
}));
vi.mock('/src/components/specific/enrollments/EnrolleeTable.jsx', () => ({
    default: ({ enrollees, onApprove, onReject, onDeleteSelected }) => (
        <div data-testid="enrollee-table">
            <button onClick={() => onApprove(1)}>Approve</button>
            <button onClick={() => onReject(1)}>Reject</button>
            <button onClick={() => onDeleteSelected([1])}>Delete</button>
        </div>
    ),
}));

const mockEnrollmentData = [
    {
        enrollment_id: 1,
        first_name: 'John',
        middle_initial: 'D',
        last_name: 'Doe',
        status: 'pending',
        createdAt: '2023-01-01',
        email: 'john@example.com',
        contact_no: '1234567890',
        birth_date: '1990-01-01',
        school_id: 'SC001',
        year_level: '1st',
    },
];

describe('AdminEnrollment Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        enrollmentService.getAllEnrollments.mockResolvedValue(
            mockEnrollmentData
        );
        enrollmentService.approveEnrollment.mockResolvedValue({
            success: true,
        });
        enrollmentService.rejectEnrollment.mockResolvedValue({ success: true });
        enrollmentService.deleteEnrollment.mockResolvedValue({ success: true });
    });

    const renderComponent = () =>
        render(
            <AuthProvider> {/* Wrap with AuthProvider */}
                <BrowserRouter>
                    <AdminEnrollment />
                </BrowserRouter>
            </AuthProvider>
        );

    it('renders the component with initial loading state', () => {
        renderComponent();

        expect(screen.getByTestId('header')).toHaveTextContent(
            'Manage Enrollments'
        );
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('enrollee-stats')).toBeInTheDocument();
    });

    it('fetches and displays enrollment data', async () => {
        renderComponent();

        await waitFor(() => {
            expect(enrollmentService.getAllEnrollments).toHaveBeenCalledTimes(
                1
            );
        });

        expect(screen.getByTestId('enrollee-table')).toBeInTheDocument();
    });

    it('handles enrollment approval correctly', async () => {
        renderComponent();

        await waitFor(() => {
            fireEvent.click(screen.getByText('Approve'));
        });

        expect(enrollmentService.approveEnrollment).toHaveBeenCalledWith(1);
        expect(enrollmentService.getAllEnrollments).toHaveBeenCalledTimes(2);
    });

    it('handles enrollment rejection correctly', async () => {
        renderComponent();

        await waitFor(() => {
            fireEvent.click(screen.getByText('Reject'));
        });

        expect(enrollmentService.rejectEnrollment).toHaveBeenCalledWith(1);
        expect(enrollmentService.getAllEnrollments).toHaveBeenCalled();
    });

    it('handles enrollment deletion correctly', async () => {
        renderComponent();

        await waitFor(() => {
            fireEvent.click(screen.getByText('Delete'));
        });

        expect(enrollmentService.deleteEnrollment).toHaveBeenCalledWith(1);
        expect(enrollmentService.getAllEnrollments).toHaveBeenCalled();
    });

    it('handles API errors gracefully', async () => {
        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});
        enrollmentService.getAllEnrollments.mockRejectedValue(
            new Error('API Error')
        );

        renderComponent();

        await waitFor(() => {
            expect(consoleError).toHaveBeenCalled();
        });

        consoleError.mockRestore();
    });

    it('updates pagination correctly', async () => {
        renderComponent();

        await waitFor(() => {
            expect(enrollmentService.getAllEnrollments).toHaveBeenCalledWith(1);
        });

        // Mock the EnrolleeTable's onPageChange call
        const mockOnPageChange = vi.fn();
        render(
            <AuthProvider>
                <BrowserRouter>
                    <AdminEnrollment onPageChange={mockOnPageChange} />
                </BrowserRouter>
            </AuthProvider>
        );
    });
});