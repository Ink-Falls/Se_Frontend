import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate, useLocation } from 'react-router-dom';
import EnterCode from '../../../src/pages/General/VerifyCode';
import {
    verifyResetCode,
    forgotPassword,
} from '../../../src/services/authService';

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
    verifyResetCode: vi.fn(),
    forgotPassword: vi.fn(),
}));

describe('EnterCode', () => {
    const mockNavigate = vi.fn();
    const validEmail = 'test@example.com';
    const validCode = '123456';

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
                    <EnterCode />
                </MemoryRouter>
            );

            expect(mockNavigate).toHaveBeenCalledWith('/ForgotPassword');
        });

        it('renders verification form when email is present', () => {
            render(
                <MemoryRouter>
                    <EnterCode />
                </MemoryRouter>
            );

            expect(
                screen.getByText('Enter Verification Code')
            ).toBeInTheDocument();
            expect(
                screen.getByPlaceholderText('Enter code')
            ).toBeInTheDocument();
        });
    });

    describe('Code Verification Tests', () => {
        it('shows error for empty code submission', () => {
            render(
                <MemoryRouter>
                    <EnterCode />
                </MemoryRouter>
            );

            fireEvent.click(
                screen.getByRole('button', { name: /verify code/i })
            );
            expect(
                screen.getByText('Please enter the verification code.')
            ).toBeInTheDocument();
        });

        it('successfully verifies code and navigates', async () => {
            verifyResetCode.mockResolvedValueOnce();

            render(
                <MemoryRouter>
                    <EnterCode />
                </MemoryRouter>
            );

            const codeInput = screen.getByPlaceholderText('Enter code');
            fireEvent.change(codeInput, { target: { value: validCode } });
            fireEvent.click(
                screen.getByRole('button', { name: /verify code/i })
            );

            await waitFor(() => {
                expect(verifyResetCode).toHaveBeenCalledWith(
                    validEmail,
                    validCode
                );
                expect(
                    screen.getByText('Code verified! Redirecting...')
                ).toBeInTheDocument();
                expect(mockNavigate).toHaveBeenCalledWith('/ChangePassword', {
                    state: { email: validEmail },
                    replace: true,
                });
            });
        });

        it('handles expired code', async () => {
            verifyResetCode.mockRejectedValueOnce(
                new Error('Reset code has expired')
            );

            render(
                <MemoryRouter>
                    <EnterCode />
                </MemoryRouter>
            );

            const codeInput = screen.getByPlaceholderText('Enter code');
            fireEvent.change(codeInput, { target: { value: validCode } });
            fireEvent.click(
                screen.getByRole('button', { name: /verify code/i })
            );

            await waitFor(() => {
                expect(screen.getByText(/Resend Code/)).toBeInTheDocument();
            });
        });
    });

    describe('Resend Code Tests', () => {
        it('successfully resends code', async () => {
            verifyResetCode.mockRejectedValueOnce(
                new Error('Reset code has expired')
            );
            forgotPassword.mockResolvedValueOnce();

            render(
                <MemoryRouter>
                    <EnterCode />
                </MemoryRouter>
            );

            // Trigger expired code state
            const codeInput = screen.getByPlaceholderText('Enter code');
            fireEvent.change(codeInput, { target: { value: validCode } });
            fireEvent.click(
                screen.getByRole('button', { name: /verify code/i })
            );

            await waitFor(async () => {
                const resendButton = screen.getByRole('button', {
                    name: /resend code/i,
                });
                fireEvent.click(resendButton);

                await waitFor(() => {
                    expect(forgotPassword).toHaveBeenCalledWith(validEmail);
                    expect(
                        screen.getByText(
                            'A new code has been sent to your email.'
                        )
                    ).toBeInTheDocument();
                });
            });
        });
    });

    describe('UI Elements Tests', () => {
        it('renders header with correct styling', () => {
            render(
                <MemoryRouter>
                    <EnterCode />
                </MemoryRouter>
            );

            const header = screen.getByRole('banner');
            expect(header).toHaveClass(
                'py-[3vw]',
                'px-[4vw]',
                'lg:py-[1.5vw]',
                'lg:px-[2vw]',
                'bg-[#121212]',
                'text-[#F6BA18]'
            );
        });

        it('renders input with correct styling', () => {
            render(
                <MemoryRouter>
                    <EnterCode />
                </MemoryRouter>
            );

            const input = screen.getByPlaceholderText('Enter code');
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
        });
    });

    describe('Navigation Tests', () => {
        it('navigates to enrollment page', () => {
            render(
                <MemoryRouter>
                    <EnterCode />
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
