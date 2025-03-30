import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate, useLocation } from 'react-router-dom';
import ChangePassword from '../../../src/pages/General/ChangePassword';
import { resetPassword } from '../../../src/services/authService';

// Mock dependencies
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
        useLocation: vi.fn(),
    };
});

vi.mock('../../../src/services/authService', () => ({
    resetPassword: vi.fn(),
}));

describe('ChangePassword', () => {
    const mockNavigate = vi.fn();
    const validEmail = 'test@example.com';

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        useLocation.mockReturnValue({ state: { email: validEmail } });
    });

    describe('Initialization Tests', () => {
        it('redirects to ForgotPassword when no email is present', () => {
            useLocation.mockReturnValue({ state: {} });

            render(
                <MemoryRouter>
                    <ChangePassword />
                </MemoryRouter>
            );

            expect(mockNavigate).toHaveBeenCalledWith('/ForgotPassword');
        });

        it('renders with valid email state', () => {
            render(
                <MemoryRouter>
                    <ChangePassword />
                </MemoryRouter>
            );

            expect(screen.getByText('Reset password')).toBeInTheDocument();
            expect(
                screen.queryByText('Error: No email found')
            ).not.toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('shows password validation error when password is invalid', async () => {
            render(
                <MemoryRouter>
                    <ChangePassword />
                </MemoryRouter>
            );

            fireEvent.change(
                screen.getByPlaceholderText('Enter new password'),
                {
                    target: { value: 'password123' },
                }
            );
            fireEvent.change(
                screen.getByPlaceholderText('Confirm new password'),
                {
                    target: { value: 'password456' },
                }
            );

            fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

            expect(
                screen.getByText('Password must have at least 8 characters, one digit, and one symbol.')
            ).toBeInTheDocument();
        });

        it('validates email presence before submission', async () => {
            useLocation.mockReturnValue({ state: {} });

            render(
                <MemoryRouter>
                    <ChangePassword />
                </MemoryRouter>
            );

            fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

            expect(
                screen.getByText(
                    'Error: No email found. Please restart the process.'
                )
            ).toBeInTheDocument();
        });
    });

    describe('Password Reset Flow', () => {
        it('successfully resets password and redirects', async () => {
            resetPassword.mockResolvedValueOnce();

            render(
                <MemoryRouter>
                    <ChangePassword />
                </MemoryRouter>
            );

            // Use a password with a special character to pass validation
            const validPassword = 'newPassword123!';
            
            fireEvent.change(
                screen.getByPlaceholderText('Enter new password'),
                {
                    target: { value: validPassword },
                }
            );
            fireEvent.change(
                screen.getByPlaceholderText('Confirm new password'),
                {
                    target: { value: validPassword },
                }
            );

            fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

            await waitFor(() => {
                expect(resetPassword).toHaveBeenCalledWith(
                    validEmail,
                    validPassword,
                    validPassword
                );
                expect(mockNavigate).toHaveBeenCalledWith('/PasswordConfirm', {
                    state: { passwordReset: true },
                    replace: true,
                });
            });
        });

        it('handles reset password failure', async () => {
            const errorMessage = 'Failed to reset password';
            resetPassword.mockRejectedValueOnce(new Error(errorMessage));

            render(
                <MemoryRouter>
                    <ChangePassword />
                </MemoryRouter>
            );

            // Use a password with a special character to pass validation
            const validPassword = 'newPassword123!';

            fireEvent.change(
                screen.getByPlaceholderText('Enter new password'),
                {
                    target: { value: validPassword },
                }
            );
            fireEvent.change(
                screen.getByPlaceholderText('Confirm new password'),
                {
                    target: { value: validPassword },
                }
            );

            fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

            await waitFor(() => {
                expect(screen.getByText(errorMessage)).toBeInTheDocument();
            });
        });
    });

    describe('UI Elements Tests', () => {
        it('renders logo with correct attributes', () => {
            render(
                <MemoryRouter>
                    <ChangePassword />
                </MemoryRouter>
            );

            const logo = screen.getByAltText('ARALKADEMY Logo');
            expect(logo).toBeInTheDocument();
            expect(logo).toHaveAttribute(
                'src',
                '/src/assets/images/ARALKADEMYLOGO.png'
            );
        });

        it('has responsive layout classes', () => {
            render(
                <MemoryRouter>
                    <ChangePassword />
                </MemoryRouter>
            );

            const heading = screen.getByRole('heading');
            expect(heading).toHaveClass(
                'text-[8vw]',
                'lg:text-[2.5vw]',
                'max-lg:text-[5vw]'
            );
        });
    });

    describe('Navigation Tests', () => {
        it('navigates to enrollment page', () => {
            render(
                <MemoryRouter>
                    <ChangePassword />
                </MemoryRouter>
            );

            const enrollButton = screen.getByRole('button', {
                name: /enroll/i,
            });
            fireEvent.click(enrollButton);

            expect(mockNavigate).toHaveBeenCalledWith('/enroll');
        });
    });
});
