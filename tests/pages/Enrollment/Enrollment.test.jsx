import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
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

    describe('Page Rendering', () => {
        it('renders all initial elements correctly', () => {
            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            // Check main sections
            expect(screen.getByText('New Enrollee?')).toBeInTheDocument();
            expect(
                screen.getByText('Enrollment Status Tracker')
            ).toBeInTheDocument();

            // Check buttons
            expect(screen.getByText('Enroll')).toBeInTheDocument();
            expect(screen.getByText('Check')).toBeInTheDocument();
            expect(screen.getByText('Log In')).toBeInTheDocument();

            // Check logo
            expect(screen.getByAltText('ARALKADEMY Logo')).toBeInTheDocument();

            // Check status display
            expect(screen.getByText('Status:')).toBeInTheDocument();
            // Initial status is capitalized in the component
            expect(screen.getByText('Unknown')).toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        it('navigates to login page when login button is clicked', () => {
            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            fireEvent.click(screen.getByText('Log In'));
            expect(mockNavigate).toHaveBeenCalledWith('/Login');
        });

        it('navigates to new enrollment page when enroll button is clicked', () => {
            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            fireEvent.click(screen.getByText('Enroll'));
            expect(mockNavigate).toHaveBeenCalledWith('/Enrollment/New');
        });
    });

    describe('Status Check Functionality', () => {
        it('handles approved status correctly', async () => {
            checkEnrollmentStatus.mockResolvedValueOnce({ status: 'approved' });

            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            const emailInput = screen.getByPlaceholderText('Enter your email');
            
            await act(async () => {
                fireEvent.change(emailInput, {
                    target: { value: 'test@example.com' },
                });
            });
            
            await act(async () => {
                fireEvent.click(screen.getByText('Check'));
            });

            await waitFor(() => {
                const statusElement = screen.getByText('Approved');
                expect(statusElement).toBeInTheDocument();
                // Check that the element has the correct status text and is visible
                expect(statusElement).toHaveTextContent('Approved');
                // Verify it's the status badge by checking its classes
                expect(statusElement).toHaveClass('font-semibold', 'rounded-md');
            });
        });

        it('handles pending status correctly', async () => {
            checkEnrollmentStatus.mockResolvedValueOnce({ status: 'pending' });

            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            const emailInput = screen.getByPlaceholderText('Enter your email');
            
            await act(async () => {
                fireEvent.change(emailInput, {
                    target: { value: 'test@example.com' },
                });
            });

            await act(async () => {
                fireEvent.click(screen.getByText('Check'));
            });

            await waitFor(() => {
                const statusElement = screen.getByText('Pending');
                expect(statusElement).toBeInTheDocument();
                expect(statusElement).toHaveTextContent('Pending');
                // Verify it's the status badge by checking its classes
                expect(statusElement).toHaveClass('font-semibold', 'rounded-md');
            });
        });

        it('handles rejected status correctly', async () => {
            checkEnrollmentStatus.mockResolvedValueOnce({ status: 'rejected' });

            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            const emailInput = screen.getByPlaceholderText('Enter your email');
            
            await act(async () => {
                fireEvent.change(emailInput, {
                    target: { value: 'test@example.com' },
                });
            });

            await act(async () => {
                fireEvent.click(screen.getByText('Check'));
            });

            await waitFor(() => {
                const statusElement = screen.getByText('Rejected');
                expect(statusElement).toBeInTheDocument();
                expect(statusElement).toHaveTextContent('Rejected');
                // Verify it's the status badge by checking its classes
                expect(statusElement).toHaveClass('font-semibold', 'rounded-md');
            });
        });
    });

    describe('Error Handling', () => {
        it('handles email not found error', async () => {
            checkEnrollmentStatus.mockRejectedValueOnce(
                new Error('Email not found')
            );

            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            const emailInput = screen.getByPlaceholderText('Enter your email');
            
            await act(async () => {
                fireEvent.change(emailInput, {
                    target: { value: 'nonexistent@example.com' },
                });
            });

            await act(async () => {
                fireEvent.click(screen.getByText('Check'));
            });

            await waitFor(() => {
                expect(screen.getByText('Enrollment not found')).toBeInTheDocument();
                expect(screen.getByText('Error')).toBeInTheDocument();
            });
        });

        it('handles unexpected errors', async () => {
            checkEnrollmentStatus.mockRejectedValueOnce(
                new Error('Server error')
            );

            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            const emailInput = screen.getByPlaceholderText('Enter your email');
            
            await act(async () => {
                fireEvent.change(emailInput, {
                    target: { value: 'test@example.com' },
                });
            });

            await act(async () => {
                fireEvent.click(screen.getByText('Check'));
            });

            await waitFor(() => {
                expect(
                    screen.getByText('An unexpected error occurred. Please try again later.')
                ).toBeInTheDocument();
                expect(screen.getByText('Error')).toBeInTheDocument();
            });
        });
    });

    describe('Form Validation', () => {
        it('requires email input', async () => {
            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            const emailInput = screen.getByPlaceholderText('Enter your email');
            expect(emailInput).toBeRequired();
        });

        it('validates email format', async () => {
            render(
                <MemoryRouter>
                    <Enrollment />
                </MemoryRouter>
            );

            const emailInput = screen.getByPlaceholderText('Enter your email');
            expect(emailInput).toHaveAttribute('type', 'email');
        });
    });
});
