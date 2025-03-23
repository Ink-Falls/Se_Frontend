import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate, useLocation } from 'react-router-dom';
import Error404 from '../../../src/pages/Errors/Error404';
import { useAuth } from '../../../src/contexts/AuthContext';

// Mock the router hooks
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
        useLocation: vi.fn(),
    };
});

// Mock the useAuth hook
vi.mock('../../../src/contexts/AuthContext', () => ({
    useAuth: vi.fn(),
}));

describe('Error404', () => {
    const mockNavigate = vi.fn();
    const mockLocation = { pathname: '' };

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        useLocation.mockReturnValue(mockLocation);
    });

    describe('Content Tests', () => {
        it('renders error page elements correctly', () => {
            useAuth.mockReturnValue({ isAuthenticated: false, user: null });

            render(
                <MemoryRouter>
                    <Error404 />
                </MemoryRouter>
            );

            // Check for main elements
            expect(screen.getByText('404')).toBeInTheDocument();
            expect(screen.getByText('Page Not Found')).toBeInTheDocument();
            expect(
                screen.getByText(
                    "The page you are looking for doesn't exist or has been moved."
                )
            ).toBeInTheDocument();
            expect(screen.getByText('Back to Home')).toBeInTheDocument();

            // Check for logo
            const logo = screen.getByAltText('ARALKADEMY Logo');
            expect(logo).toBeInTheDocument();
            expect(logo).toHaveAttribute(
                'src',
                '/src/assets/images/ARALKADEMYLOGO.png'
            );
        });
    });

    describe('Navigation Tests', () => {
        it.each([
            ['teacher', '/Teacher/Dashboard'],
            ['student_teacher', '/Teacher/Dashboard'],
            ['learner', '/Learner/Dashboard'],
            ['admin', '/Admin/Dashboard'],
        ])(
            'redirects authenticated %s to correct dashboard',
            (role, expectedPath) => {
                useAuth.mockReturnValue({ isAuthenticated: true, user: { role } });

                render(
                    <MemoryRouter>
                        <Error404 />
                    </MemoryRouter>
                );

                fireEvent.click(screen.getByText('Back to Home'));

                expect(mockNavigate).toHaveBeenCalledWith(expectedPath, {
                    replace: true,
                });
            }
        );

        it('redirects unauthenticated users to login', () => {
            useAuth.mockReturnValue({ isAuthenticated: false, user: null });

            render(
                <MemoryRouter>
                    <Error404 />
                </MemoryRouter>
            );

            fireEvent.click(screen.getByText('Back to Home'));

            expect(mockNavigate).toHaveBeenCalledWith('/login', {
                replace: true,
            });
        });

        it('handles null or invalid user role', () => {
            useAuth.mockReturnValue({ isAuthenticated: true, user: { role: null } });

            render(
                <MemoryRouter>
                    <Error404 />
                </MemoryRouter>
            );

            fireEvent.click(screen.getByText('Back to Home'));

            expect(mockNavigate).toHaveBeenCalledWith('/login', {
                replace: true,
            });
        });
    });

    describe('UI Elements Tests', () => {
        it('applies correct styling classes', () => {
            useAuth.mockReturnValue({ isAuthenticated: false, user: null });

            render(
                <MemoryRouter>
                    <Error404 />
                </MemoryRouter>
            );

            // Check container styling
            const container = screen.getByRole('banner').parentElement;
            expect(container).toHaveClass(
                'min-h-screen',
                'bg-cover',
                'bg-center'
            );

            // Check header styling
            const header = screen.getByRole('banner');
            expect(header).toHaveClass(
                'py-[3vw]',
                'px-[4vw]',
                'lg:py-[1.5vw]',
                'lg:px-[2vw]',
                'bg-[#121212]',
                'text-[#F6BA18]',
                'flex',
                'justify-between',
                'items-center',
                'shadow-xl'
            );

            // Check button styling
            const button = screen.getByRole('button');
            expect(button).toHaveClass(
                'bg-[#212529]',
                'text-[#FFFFFF]',
                'hover:bg-[#F6BA18]',
                'hover:text-[#212529]',
                'transition-colors',
                'duration-300',
                'ease-in-out'
            );
        });

        it('renders background image correctly', () => {
            useAuth.mockReturnValue({ isAuthenticated: false, user: null });

            render(
                <MemoryRouter>
                    <Error404 />
                </MemoryRouter>
            );

            const container = screen.getByRole('banner').parentElement;
            expect(container).toHaveStyle({
                backgroundImage:
                    'url(https://upload.wikimedia.org/wikipedia/commons/7/7b/400_Year_old_Beauty.jpg)',
            });
        });

        it('has responsive text sizes', () => {
            useAuth.mockReturnValue({ isAuthenticated: false, user: null });

            render(
                <MemoryRouter>
                    <Error404 />
                </MemoryRouter>
            );

            const errorCode = screen.getByText('404');
            expect(errorCode).toHaveClass('text-[15vw]', 'lg:text-[8vw]');

            const errorTitle = screen.getByText('Page Not Found');
            expect(errorTitle).toHaveClass('text-[4vw]', 'lg:text-[2vw]');

            const errorMessage = screen.getByText(
                "The page you are looking for doesn't exist or has been moved."
            );
            expect(errorMessage).toHaveClass('text-[2.5vw]', 'lg:text-[1vw]');
        });
    });
});