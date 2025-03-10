import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate, useLocation } from 'react-router-dom';
import Error404 from '../../../src/pages/Errors/Error404';
import { isAuthenticated, getUserRole } from '../../../src/utils/auth';

// Mock the router hooks
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
        useLocation: vi.fn(),
    };
});

// Mock auth utilities
vi.mock('../../../src/utils/auth', () => ({
    isAuthenticated: vi.fn(),
    getUserRole: vi.fn(),
}));

describe('Error404', () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
    });

    describe('Page Content Tests', () => {
        it.each([
            [
                'default route',
                '/',
                'Page Not Found',
                "The page you are looking for doesn't exist or has been moved.",
                'Back to Home',
            ],
            [
                'learner route',
                '/Learner/test',
                'Learner Page Not Available',
                'This learning resource or feature is currently under development. Please return to your dashboard.',
                'Back to Learner Dashboard',
            ],
            [
                'teacher route',
                '/Teacher/test',
                'Teacher Page Not Available',
                'This teaching resource or feature is currently under development. Please return to your dashboard.',
                'Back to Teacher Dashboard',
            ],
            [
                'admin route',
                '/Admin/test',
                'Admin Page Not Available',
                'This administrative feature is currently under development. Please return to your dashboard.',
                'Back to Admin Dashboard',
            ],
        ])(
            'displays correct content for %s',
            (_, path, expectedTitle, expectedMessage, expectedButton) => {
                useLocation.mockReturnValue({ pathname: path });

                render(
                    <MemoryRouter>
                        <Error404 />
                    </MemoryRouter>
                );

                expect(screen.getByText('404')).toBeInTheDocument();
                expect(screen.getByText(expectedTitle)).toBeInTheDocument();
                expect(screen.getByText(expectedMessage)).toBeInTheDocument();
                expect(screen.getByText(expectedButton)).toBeInTheDocument();
            }
        );
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
                useLocation.mockReturnValue({ pathname: '/' });
                isAuthenticated.mockReturnValue(true);
                getUserRole.mockReturnValue(role);

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
            useLocation.mockReturnValue({ pathname: '/' });
            isAuthenticated.mockReturnValue(false);

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
            useLocation.mockReturnValue({ pathname: '/' });
            isAuthenticated.mockReturnValue(true);
            getUserRole.mockReturnValue(null);

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

    describe('Route Type Detection Tests', () => {
        it.each([
            ['teacher route', '/Teacher/', true, false, false],
            ['admin route', '/Admin/', false, true, false],
            ['learner route', '/Learner/', false, false, true],
            ['other route', '/other/', false, false, false],
        ])(
            'correctly identifies %s',
            (_, path, isTeacher, isAdmin, isLearner) => {
                useLocation.mockReturnValue({ pathname: path });

                render(
                    <MemoryRouter>
                        <Error404 />
                    </MemoryRouter>
                );

                const content = screen.getByText(/Page Not|Available/);

                if (isTeacher) {
                    expect(content).toHaveTextContent(/Teacher Page/);
                } else if (isAdmin) {
                    expect(content).toHaveTextContent(/Admin Page/);
                } else if (isLearner) {
                    expect(content).toHaveTextContent(/Learner Page/);
                } else {
                    expect(content).toHaveTextContent(/Page Not Found/);
                }
            }
        );
    });

    describe('UI Elements Tests', () => {
        it('renders the logo with correct attributes', () => {
            useLocation.mockReturnValue({ pathname: '/' });

            render(
                <MemoryRouter>
                    <Error404 />
                </MemoryRouter>
            );

            const logo = screen.getByAltText('ARALKADEMY Logo');
            expect(logo).toBeInTheDocument();
            expect(logo).toHaveAttribute(
                'src',
                '/src/assets/images/ARALKADEMYLOGO.png'
            );
            expect(logo).toHaveAttribute('alt', 'ARALKADEMY Logo');
        });

        it('applies correct styling classes to elements', () => {
            useLocation.mockReturnValue({ pathname: '/' });

            render(
                <MemoryRouter>
                    <Error404 />
                </MemoryRouter>
            );

            const button = screen.getByRole('button');
            expect(button).toHaveClass(
                'bg-[#212529]',
                'text-[#FFFFFF]',
                'hover:bg-[#F6BA18]'
            );

            const container = button.closest('div');
        });
    });
});
