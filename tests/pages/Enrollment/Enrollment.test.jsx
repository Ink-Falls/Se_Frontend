import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Enrollment from '../../../src/pages/Enrollment/Enrollment';
import { checkEnrollmentStatus } from '../../../src/services/enrollmentCheckService';

// Mock dependencies
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

vi.mock('../../../src/services/enrollmentCheckService', () => ({
    checkEnrollmentStatus: vi.fn(),
}));

describe('Enrollment', () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
    });

    describe('Rendering Tests', () => {
        it('renders initial page elements correctly', () => {
            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            // Check header elements
            expect(screen.getByAltText('ARALKADEMY Logo')).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: /log in/i })
            ).toBeInTheDocument();

            // Check main sections
            expect(
                screen.getByText('Check Enrollment Status')
            ).toBeInTheDocument();
            expect(screen.getByText('New Enrollment')).toBeInTheDocument();
            expect(screen.getByTestId('status-section')).toBeInTheDocument();
            expect(
                screen.getByTestId('new-enrollment-section')
            ).toBeInTheDocument();
        });

        it('displays initial unknown status', () => {
            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            const statusElement = screen.getByTestId('status-display');
            expect(statusElement).toHaveTextContent('Unknown');
            expect(statusElement).toHaveStyle({ color: '#F6BA18' });
        });
    });

    describe('Status Check Tests', () => {
        it('handles empty email submission', async () => {
            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            const checkButton = screen.getByRole('button', {
                name: /check status/i,
            });
            fireEvent.click(checkButton);

            expect(
                screen.getByText('Please enter your email.')
            ).toBeInTheDocument();
            expect(checkEnrollmentStatus).not.toHaveBeenCalled();
        });

        it('displays pending status correctly', async () => {
            checkEnrollmentStatus.mockResolvedValueOnce({ status: 'Pending' });

            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            const emailInput = screen.getByTestId('email-input');
            fireEvent.change(emailInput, {
                target: { value: 'test@example.com' },
            });

            const checkButton = screen.getByRole('button', {
                name: /check status/i,
            });
            fireEvent.click(checkButton);

            await waitFor(() => {
                const statusElement = screen.getByTestId('status-display');
                expect(statusElement).toHaveTextContent('Pending');
                expect(statusElement).toHaveStyle({ color: '#F6BA18' });
            });
        });

        it('displays approved status correctly', async () => {
            checkEnrollmentStatus.mockResolvedValueOnce({ status: 'Approved' });

            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            const emailInput = screen.getByTestId('email-input');
            fireEvent.change(emailInput, {
                target: { value: 'test@example.com' },
            });

            const checkButton = screen.getByRole('button', {
                name: /check status/i,
            });
            fireEvent.click(checkButton);

            await waitFor(() => {
                const statusElement = screen.getByTestId('status-display');
                expect(statusElement).toHaveTextContent('Approved');
                expect(statusElement).toHaveStyle({ color: '#22C55E' });
            });
        });

        it('handles enrollment check error', async () => {
            const errorMessage = 'Email not found';
            checkEnrollmentStatus.mockRejectedValueOnce(
                new Error(errorMessage)
            );

            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            const emailInput = screen.getByTestId('email-input');
            fireEvent.change(emailInput, {
                target: { value: 'test@example.com' },
            });

            const checkButton = screen.getByRole('button', {
                name: /check status/i,
            });
            fireEvent.click(checkButton);

            await waitFor(() => {
                expect(screen.getByText(errorMessage)).toBeInTheDocument();
            });
        });
    });

    describe('Navigation Tests', () => {
        it('navigates to login page', () => {
            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            const loginButton = screen.getByRole('button', { name: /log in/i });
            fireEvent.click(loginButton);

            expect(mockNavigate).toHaveBeenCalledWith('/Login');
        });

        it('navigates to new enrollment page', () => {
            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            const newEnrollmentButton = screen.getByRole('button', {
                name: /enroll now/i,
            });
            fireEvent.click(newEnrollmentButton);

            expect(mockNavigate).toHaveBeenCalledWith('/NewEnrollment');
        });
    });

    describe('UI Elements Tests', () => {
        it('applies correct styling to status display', async () => {
            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            const statusSection = screen.getByTestId('status-section');
            expect(statusSection).toHaveClass(
                'p-[4vw]',
                'max-lg:p-[7vw]',
                'w-[80vw]',
                'lg:w-[40vw]',
                'bg-white',
                'rounded-lg',
                'shadow-2xl'
            );
        });

        it('shows loading state during status check', async () => {
            checkEnrollmentStatus.mockImplementation(
                () => new Promise((resolve) => setTimeout(resolve, 100))
            );

            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            const emailInput = screen.getByTestId('email-input');
            fireEvent.change(emailInput, {
                target: { value: 'test@example.com' },
            });

            const checkButton = screen.getByRole('button', {
                name: /check status/i,
            });
            fireEvent.click(checkButton);

            expect(screen.getByText('Checking...')).toBeInTheDocument();
        });
    });
});
