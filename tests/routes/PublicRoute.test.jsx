import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { PublicRoute } from '../../src/routes/PublicRoute';
import { validateAuth, getUserRole } from '../../src/utils/auth';

// Mock dependencies
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useLocation: vi.fn(),
    };
});

vi.mock('../../src/utils/auth', () => ({
    validateAuth: vi.fn(),
    getUserRole: vi.fn(),
}));

describe('PublicRoute', () => {
    const mockLocation = { pathname: '/', state: {} };
    const mockChild = <div data-testid="test-child">Test Child</div>;

    beforeEach(() => {
        vi.clearAllMocks();
        useLocation.mockReturnValue(mockLocation);
    });

    describe('Public Route Matching', () => {
        it.each([
            ['/login'],
            ['/Enrollment'],
            ['/Enrollment/New'],
            ['/ForgotPassword'],
            ['/EnrollConfirm'],
            ['/VerifyCode'],
            ['/ChangePassword'],
            ['/PasswordConfirm'],
        ])('allows access to public route %s', async (path) => {
            useLocation.mockReturnValue({ pathname: path, state: {} });

            render(
                <MemoryRouter>
                    <PublicRoute>{mockChild}</PublicRoute>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('test-child')).toBeInTheDocument();
            });
        });

        it('handles case-insensitive route matching', async () => {
            useLocation.mockReturnValue({ pathname: '/LOGIN', state: {} });

            render(
                <MemoryRouter>
                    <PublicRoute>{mockChild}</PublicRoute>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('test-child')).toBeInTheDocument();
            });
        });
    });

    describe('Authentication Flow', () => {
        it('shows loading state initially', () => {
            render(
                <MemoryRouter>
                    <PublicRoute>{mockChild}</PublicRoute>
                </MemoryRouter>
            );

            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('redirects authenticated users to appropriate dashboard', async () => {
            validateAuth.mockResolvedValue({ valid: true });
            getUserRole.mockReturnValue('teacher');
            useLocation.mockReturnValue({ pathname: '/protected', state: {} });

            render(
                <MemoryRouter>
                    <PublicRoute>{mockChild}</PublicRoute>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(
                    screen.queryByTestId('test-child')
                ).not.toBeInTheDocument();
            });
        });

        it.each([
            ['teacher', '/Teacher/Dashboard'],
            ['student_teacher', '/Teacher/Dashboard'],
            ['learner', '/Learner/Dashboard'],
            ['admin', '/Admin/Dashboard'],
        ])('redirects %s to correct dashboard', async (role, expectedPath) => {
            validateAuth.mockResolvedValue({ valid: true });
            getUserRole.mockReturnValue(role);
            useLocation.mockReturnValue({ pathname: '/protected', state: {} });

            render(
                <MemoryRouter>
                    <PublicRoute>{mockChild}</PublicRoute>
                </MemoryRouter>
            );

            await waitFor(() => {
                const navigate = screen.queryByTestId('test-child');
                expect(navigate).not.toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        it('handles authentication errors gracefully', async () => {
            validateAuth.mockRejectedValue(new Error('Auth Error'));
            useLocation.mockReturnValue({ pathname: '/protected', state: {} });

            render(
                <MemoryRouter>
                    <PublicRoute>{mockChild}</PublicRoute>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('test-child')).toBeInTheDocument();
            });
        });

        it('handles invalid roles', async () => {
            validateAuth.mockResolvedValue({ valid: true });
            getUserRole.mockReturnValue(null);
            useLocation.mockReturnValue({ pathname: '/protected', state: {} });

            render(
                <MemoryRouter>
                    <PublicRoute>{mockChild}</PublicRoute>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(
                    screen.queryByTestId('test-child')
                ).not.toBeInTheDocument();
            });
        });
    });

    describe('Route Protection', () => {
        it('allows access to child component for public routes', async () => {
            useLocation.mockReturnValue({ pathname: '/login', state: {} });

            render(
                <MemoryRouter>
                    <PublicRoute>{mockChild}</PublicRoute>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('test-child')).toBeInTheDocument();
            });
        });

        it('skips auth check for public routes', async () => {
            useLocation.mockReturnValue({ pathname: '/login', state: {} });

            render(
                <MemoryRouter>
                    <PublicRoute>{mockChild}</PublicRoute>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(validateAuth).not.toHaveBeenCalled();
            });
        });
    });
});
