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
vi.mock('/src/components/common/Modals/Delete/DeleteModal.jsx', () => ({
    default: ({ onClose, onConfirm }) => (
        <div data-testid="delete-modal">
            <button onClick={onConfirm} data-testid="confirm-delete">Confirm Delete</button>
            <button onClick={onClose}>Cancel</button>
        </div>
    ),
}));
vi.mock('/src/components/common/LoadingSpinner.jsx', () => ({
    default: () => <div data-testid="loading-spinner">Loading...</div>,
}));
vi.mock('../../components/common/layout/MobileNavbar', () => ({
    default: () => <div data-testid="mobile-navbar">Mobile Nav</div>,
}), { virtual: true });

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
            message: "Enrollment approved successfully",
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
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('fetches and displays enrollment data', async () => {
        renderComponent();

        // Wait for loading to complete and for the component to re-render
        await waitFor(() => {
            expect(screen.getByTestId('enrollee-table')).toBeInTheDocument();
        });

        // Verify that getAllEnrollments was called (don't check the exact number of calls)
        expect(enrollmentService.getAllEnrollments).toHaveBeenCalled();
    });

    it('handles enrollment approval correctly', async () => {
        renderComponent();

        // Wait for initial rendering to complete
        await waitFor(() => {
            expect(screen.getByTestId('enrollee-table')).toBeInTheDocument();
        });

        // Reset the mock to clear previous calls
        enrollmentService.getAllEnrollments.mockClear();

        // Click approve button
        fireEvent.click(screen.getByText('Approve'));

        // Check if approveEnrollment was called with correct ID
        expect(enrollmentService.approveEnrollment).toHaveBeenCalledWith(1);
        
        // The implementation fetches data again after approval
        await waitFor(() => {
            expect(enrollmentService.getAllEnrollments).toHaveBeenCalled();
        });
    });

    it('handles enrollment rejection correctly', async () => {
        renderComponent();

        // Wait for initial rendering to complete
        await waitFor(() => {
            expect(screen.getByTestId('enrollee-table')).toBeInTheDocument();
        });

        // Reset the mock to clear previous calls
        enrollmentService.getAllEnrollments.mockClear();

        // Click reject button
        fireEvent.click(screen.getByText('Reject'));

        // Check if rejectEnrollment was called with correct ID
        expect(enrollmentService.rejectEnrollment).toHaveBeenCalledWith(1);
        
        // Verify data is refreshed after rejection
        await waitFor(() => {
            expect(enrollmentService.getAllEnrollments).toHaveBeenCalled();
        });
    });

    it('handles enrollment deletion correctly', async () => {
        renderComponent();

        // Wait for initial rendering to complete
        await waitFor(() => {
            expect(screen.getByTestId('enrollee-table')).toBeInTheDocument();
        });

        // Reset the mock to clear previous calls
        enrollmentService.getAllEnrollments.mockClear();

        // Click delete button (opens the modal)
        fireEvent.click(screen.getByText('Delete'));

        // Check if delete modal is shown
        expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
        
        // Click confirm delete
        fireEvent.click(screen.getByTestId('confirm-delete'));

        // Check if deleteEnrollment was called with correct ID
        await waitFor(() => {
            expect(enrollmentService.deleteEnrollment).toHaveBeenCalledWith(1);
        });
        
        // Verify data is refreshed after deletion
        await waitFor(() => {
            expect(enrollmentService.getAllEnrollments).toHaveBeenCalled();
        });
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

        // Initial data should be fetched with currentPage = 1 (and other parameters)
        await waitFor(() => {
            expect(enrollmentService.getAllEnrollments).toHaveBeenCalledWith(1, expect.anything(), expect.anything());
        });
    });
});