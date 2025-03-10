import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import ForgotPassword from '../../../src/pages/General/ForgotPassword';
import { forgotPassword } from '../../../src/services/authService';

// Mock dependencies
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

vi.mock('../../../src/services/authService', () => ({
    forgotPassword: vi.fn(),
}));

describe('ForgotPassword', () => {
    const mockNavigate = vi.fn();
    const validEmail = 'test@example.com';

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
    });

    describe('Rendering Tests', () => {
        it('renders all form elements correctly', () => {
            render(
                <MemoryRouter>
                    <ForgotPassword />
                </MemoryRouter>
            );

            // Check main elements
            expect(screen.getByText('Forgot password?')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: /send code/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: /enroll/i })
            ).toBeInTheDocument();
        });

        it('renders logo with correct attributes', () => {
            render(
                <MemoryRouter>
                    <ForgotPassword />
                </MemoryRouter>
            );

            const logo = screen.getByAltText('ARALKADEMY Logo');
            expect(logo).toBeInTheDocument();
            expect(logo).toHaveAttribute(
                'src',
                '/src/assets/images/ARALKADEMYLOGO.png'
            );
            expect(logo).toHaveClass('h-[5vw]', 'lg:h-[2.5vw]');
        });
    });

    describe('Form Validation', () => {
        it('shows error when email is empty', async () => {
            render(
                <MemoryRouter>
                    <ForgotPassword />
                </MemoryRouter>
            );

            const submitButton = screen.getByRole('button', {
                name: /send code/i,
            });
            fireEvent.click(submitButton);

            expect(
                screen.getByText('Please enter your email.')
            ).toBeInTheDocument();
            expect(forgotPassword).not.toHaveBeenCalled();
        });

        it('handles service error correctly', async () => {
            const errorMessage = 'Email not found';
            forgotPassword.mockRejectedValueOnce(new Error(errorMessage));

            render(
                <MemoryRouter>
                    <ForgotPassword />
                </MemoryRouter>
            );

            const emailInput = screen.getByPlaceholderText('Email');
            fireEvent.change(emailInput, { target: { value: validEmail } });

            const submitButton = screen.getByRole('button', {
                name: /send code/i,
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(errorMessage)).toBeInTheDocument();
            });
        });
    });

    describe('Password Reset Flow', () => {
        it('successfully sends reset code and navigates', async () => {
            forgotPassword.mockResolvedValueOnce();

            render(
                <MemoryRouter>
                    <ForgotPassword />
                </MemoryRouter>
            );

            const emailInput = screen.getByPlaceholderText('Email');
            fireEvent.change(emailInput, { target: { value: validEmail } });

            const submitButton = screen.getByRole('button', {
                name: /send code/i,
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(forgotPassword).toHaveBeenCalledWith(validEmail);
                expect(
                    screen.getByText(
                        'Password reset code sent! Check your email.'
                    )
                ).toBeInTheDocument();
                expect(mockNavigate).toHaveBeenCalledWith('/VerifyCode', {
                    state: { email: validEmail },
                });
            });
        });
    });

    describe('Navigation Tests', () => {
        it('navigates to enrollment page', () => {
            render(
                <MemoryRouter>
                    <ForgotPassword />
                </MemoryRouter>
            );

            const enrollButton = screen.getByRole('button', {
                name: /enroll/i,
            });
            fireEvent.click(enrollButton);

            expect(mockNavigate).toHaveBeenCalledWith('/enrollment');
        });
    });

    describe('UI Styling Tests', () => {
        it('applies correct form styling', () => {
            render(
                <MemoryRouter>
                    <ForgotPassword />
                </MemoryRouter>
            );

            const input = screen.getByPlaceholderText('Email');
            expect(input).toHaveClass(
                'w-full',
                'px-[3vw]',
                'py-[1.5vw]',
                'lg:py-[1vw]',
                'border',
                'border-gray-300',
                'rounded-md',
                'focus:ring-2',
                'focus:ring-[#F6BA18]'
            );

            const submitButton = screen.getByRole('button', {
                name: /send code/i,
            });
            expect(submitButton).toHaveClass(
                'bg-[#212529]',
                'text-white',
                'hover:bg-[#F6BA18]',
                'hover:text-[#212529]'
            );
        });
    });
});
