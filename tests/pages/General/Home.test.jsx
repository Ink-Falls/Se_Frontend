import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Home from '../../../src/pages/General/Home';

// Mock the router hooks
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

describe('Home', () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
    });

    describe('Content Tests', () => {
        it('renders welcome message and logout button', () => {
            render(
                <MemoryRouter>
                    <Home />
                </MemoryRouter>
            );

            // Check for main elements
            expect(
                screen.getByText('Welcome to the Homepage!')
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'You are successfully logged in. Enjoy your stay!'
                )
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: /log out/i })
            ).toBeInTheDocument();
        });
    });

    describe('Navigation Tests', () => {
        it('navigates to logout page when logout button is clicked', () => {
            render(
                <MemoryRouter>
                    <Home />
                </MemoryRouter>
            );

            const logoutButton = screen.getByRole('button', {
                name: /log out/i,
            });
            fireEvent.click(logoutButton);

            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith('/logout');
        });
    });

    describe('UI Elements Tests', () => {
        it('applies correct text styling', () => {
            render(
                <MemoryRouter>
                    <Home />
                </MemoryRouter>
            );

            const heading = screen.getByRole('heading', { level: 2 });
            expect(heading).toHaveClass(
                'text-2xl',
                'font-bold',
                'mb-6',
                'text-center'
            );

            const message = screen.getByText(
                'You are successfully logged in. Enjoy your stay!'
            );
            expect(message).toHaveClass(
                'text-lg',
                'text-gray-700',
                'mb-6',
                'text-center'
            );
        });

        it('applies correct button styling', () => {
            render(
                <MemoryRouter>
                    <Home />
                </MemoryRouter>
            );

            const button = screen.getByRole('button', { name: /log out/i });
            expect(button).toHaveClass(
                'w-full',
                'bg-red-500',
                'text-white',
                'py-2',
                'px-4',
                'rounded-md',
                'hover:bg-red-600',
                'transition-colors'
            );
        });
    });

    describe('Accessibility Tests', () => {
        it('has proper heading hierarchy', () => {
            render(
                <MemoryRouter>
                    <Home />
                </MemoryRouter>
            );

            const heading = screen.getByRole('heading', { level: 2 });
            expect(heading).toBeInTheDocument();
        });

        it('has accessible button with clear text', () => {
            render(
                <MemoryRouter>
                    <Home />
                </MemoryRouter>
            );

            const button = screen.getByRole('button', { name: /log out/i });
            expect(button).toHaveAccessibleName();
        });
    });
});
