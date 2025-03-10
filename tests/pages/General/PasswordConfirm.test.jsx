import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate, useLocation } from 'react-router-dom';
import PasswordConfirm from '../../../src/pages/General/PasswordConfirm';

// Mock the router hooks
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
        useLocation: vi.fn(),
    };
});

describe('PasswordConfirm', () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
    });

    describe('Initialization Tests', () => {
        it('redirects to login when passwordReset is false', () => {
            useLocation.mockReturnValue({ state: { passwordReset: false } });

            render(
                <MemoryRouter>
                    <PasswordConfirm />
                </MemoryRouter>
            );

            expect(mockNavigate).toHaveBeenCalledWith('/Login');
        });
    });

    describe('Content Tests', () => {
        beforeEach(() => {
            useLocation.mockReturnValue({ state: { passwordReset: true } });
        });

        it('renders header with logo and login button', () => {
            render(
                <MemoryRouter>
                    <PasswordConfirm />
                </MemoryRouter>
            );

            expect(screen.getByAltText('ARALKADEMY Logo')).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: /log in/i })
            ).toBeInTheDocument();
        });

        it('displays success message and description', () => {
            render(
                <MemoryRouter>
                    <PasswordConfirm />
                </MemoryRouter>
            );

            expect(
                screen.getByText('Password Changed Successfully!')
            ).toBeInTheDocument();
            expect(
                screen.getByText('You may now continue logging in.')
            ).toBeInTheDocument();
        });
    });

    describe('Navigation Tests', () => {
        beforeEach(() => {
            useLocation.mockReturnValue({ state: { passwordReset: true } });
        });

        it('navigates to login when header login button is clicked', () => {
            render(
                <MemoryRouter>
                    <PasswordConfirm />
                </MemoryRouter>
            );

            const headerLoginButton = screen.getByRole('button', {
                name: /log in/i,
            });
            fireEvent.click(headerLoginButton);

            expect(mockNavigate).toHaveBeenCalledWith('/Login', {
                replace: true,
            });
        });

        it('navigates to login when back to login button is clicked', () => {
            render(
                <MemoryRouter>
                    <PasswordConfirm />
                </MemoryRouter>
            );

            const backToLoginButton = screen.getByRole('button', {
                name: /back to login/i,
            });
            fireEvent.click(backToLoginButton);

            expect(mockNavigate).toHaveBeenCalledWith('/Login');
        });
    });

    describe('UI Elements Tests', () => {
        beforeEach(() => {
            useLocation.mockReturnValue({ state: { passwordReset: true } });
        });

        it('applies correct header styling', () => {
            render(
                <MemoryRouter>
                    <PasswordConfirm />
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

        it('applies correct success message styling', () => {
            render(
                <MemoryRouter>
                    <PasswordConfirm />
                </MemoryRouter>
            );

            const heading = screen.getByRole('heading', { level: 2 });
            expect(heading).toHaveClass(
                'text-[8vw]',
                'lg:text-[2.5vw]',
                'max-lg:text-[5vw]',
                'font-bold',
                'text-left',
                'text-[#212529]'
            );
        });

        it('applies correct button styling', () => {
            render(
                <MemoryRouter>
                    <PasswordConfirm />
                </MemoryRouter>
            );

            const loginButton = screen.getByRole('button', { name: /log in/i });
            expect(loginButton).toHaveClass(
                'bg-[#F6BA18]',
                'text-[#212529]',
                'hover:bg-[#64748B]',
                'hover:text-[#FFFFFF]'
            );

            const backButton = screen.getByRole('button', {
                name: /back to login/i,
            });
            expect(backButton).toHaveClass(
                'bg-[#212529]',
                'text-[#FFFFFF]',
                'hover:bg-[#F6BA18]',
                'hover:text-[#212529]'
            );
        });
    });

    describe('Accessibility Tests', () => {
        beforeEach(() => {
            useLocation.mockReturnValue({ state: { passwordReset: true } });
        });

        it('has proper heading hierarchy', () => {
            render(
                <MemoryRouter>
                    <PasswordConfirm />
                </MemoryRouter>
            );

            const heading = screen.getByRole('heading', { level: 2 });
            expect(heading).toBeInTheDocument();
        });

        it('has accessible buttons with clear text', () => {
            render(
                <MemoryRouter>
                    <PasswordConfirm />
                </MemoryRouter>
            );

            const buttons = screen.getAllByRole('button');
            buttons.forEach((button) => {
                expect(button).toHaveAccessibleName();
            });
        });

        it('has proper alt text for logo', () => {
            render(
                <MemoryRouter>
                    <PasswordConfirm />
                </MemoryRouter>
            );

            const logo = screen.getByAltText('ARALKADEMY Logo');
            expect(logo).toHaveAttribute('alt', 'ARALKADEMY Logo');
        });
    });
});
