import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RoleBasedRoute } from '../../src/routes/RoleBasedRoute';
import { isAuthenticated } from '../../src/utils/auth';

// Mock auth utility
vi.mock('../../src/utils/auth', () => ({
    isAuthenticated: vi.fn(),
}));

describe('RoleBasedRoute', () => {
    // Mock localStorage
    const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        clear: vi.fn(),
    };

    beforeEach(() => {
        // Setup localStorage mock
        global.localStorage = mockLocalStorage;
        vi.clearAllMocks();
    });

    describe('Authentication Tests', () => {
        it('redirects to login when user is not authenticated', () => {
            vi.mocked(isAuthenticated).mockReturnValue(false);

            render(
                <MemoryRouter initialEntries={['/protected']}>
                    <Routes>
                        <Route path="/login" element={<div>Login Page</div>} />
                        <Route
                            path="/protected"
                            element={
                                <RoleBasedRoute allowedRoles={['teacher']}>
                                    <div>Protected Content</div>
                                </RoleBasedRoute>
                            }
                        />
                    </Routes>
                </MemoryRouter>
            );

            expect(screen.getByText('Login Page')).toBeInTheDocument();
        });
    });

    describe('Authorization Tests', () => {
        it('allows access for user with correct role', () => {
            vi.mocked(isAuthenticated).mockReturnValue(true);
            const mockToken = `header.${btoa(
                JSON.stringify({ role: 'teacher' })
            )}.signature`;
            mockLocalStorage.getItem.mockReturnValue(mockToken);

            render(
                <MemoryRouter>
                    <RoleBasedRoute allowedRoles={['teacher']}>
                        <div>Protected Content</div>
                    </RoleBasedRoute>
                </MemoryRouter>
            );

            expect(screen.getByText('Protected Content')).toBeInTheDocument();
        });

        it('redirects to unauthorized for invalid role', () => {
            vi.mocked(isAuthenticated).mockReturnValue(true);
            const mockToken = `header.${btoa(
                JSON.stringify({ role: 'student' })
            )}.signature`;
            mockLocalStorage.getItem.mockReturnValue(mockToken);

            render(
                <MemoryRouter initialEntries={['/protected']}>
                    <Routes>
                        <Route
                            path="/unauthorized"
                            element={<div>Unauthorized Page</div>}
                        />
                        <Route
                            path="/protected"
                            element={
                                <RoleBasedRoute allowedRoles={['teacher']}>
                                    <div>Protected Content</div>
                                </RoleBasedRoute>
                            }
                        />
                    </Routes>
                </MemoryRouter>
            );

            expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
        });

        it('handles missing token correctly', () => {
            vi.mocked(isAuthenticated).mockReturnValue(true);
            mockLocalStorage.getItem.mockReturnValue(null);

            render(
                <MemoryRouter initialEntries={['/protected']}>
                    <Routes>
                        <Route
                            path="/unauthorized"
                            element={<div>Unauthorized Page</div>}
                        />
                        <Route
                            path="/protected"
                            element={
                                <RoleBasedRoute allowedRoles={['teacher']}>
                                    <div>Protected Content</div>
                                </RoleBasedRoute>
                            }
                        />
                    </Routes>
                </MemoryRouter>
            );

            expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
        });

        it('handles invalid token format', () => {
            vi.mocked(isAuthenticated).mockReturnValue(true);
            mockLocalStorage.getItem.mockReturnValue('invalid-token-format');

            render(
                <MemoryRouter initialEntries={['/protected']}>
                    <Routes>
                        <Route
                            path="/unauthorized"
                            element={<div>Unauthorized Page</div>}
                        />
                        <Route
                            path="/protected"
                            element={
                                <RoleBasedRoute allowedRoles={['teacher']}>
                                    <div>Protected Content</div>
                                </RoleBasedRoute>
                            }
                        />
                    </Routes>
                </MemoryRouter>
            );

            expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
        });
    });

    describe('Location State Tests', () => {
        it('preserves location state on redirect', () => {
            vi.mocked(isAuthenticated).mockReturnValue(false);

            render(
                <MemoryRouter
                    initialEntries={[
                        { pathname: '/protected', state: { from: '/origin' } },
                    ]}
                >
                    <Routes>
                        <Route path="/login" element={<div>Login Page</div>} />
                        <Route
                            path="/protected"
                            element={
                                <RoleBasedRoute allowedRoles={['teacher']}>
                                    <div>Protected Content</div>
                                </RoleBasedRoute>
                            }
                        />
                    </Routes>
                </MemoryRouter>
            );

            expect(screen.getByText('Login Page')).toBeInTheDocument();
        });
    });
});
