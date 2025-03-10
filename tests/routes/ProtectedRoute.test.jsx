import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../../src/routes/ProtectedRoute';
import { isAuthenticated } from '../../src/utils/auth';

// Mock the auth utility
vi.mock('../../src/utils/auth', () => ({
    isAuthenticated: vi.fn(),
}));

describe('ProtectedRoute', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Clean up after each test
        vi.resetAllMocks();
    });

    it('should redirect to login when user is not authenticated', () => {
        // Setup
        vi.mocked(isAuthenticated).mockReturnValue(false);

        // Render
        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        // Assert
        expect(screen.getByText('Login Page')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        expect(isAuthenticated).toHaveBeenCalledTimes(1);
    });

    it('should render children when user is authenticated', () => {
        // Setup
        vi.mocked(isAuthenticated).mockReturnValue(true);

        // Render
        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        // Assert
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
        expect(isAuthenticated).toHaveBeenCalledTimes(1);
    });

    it('should pass location state when redirecting to login', () => {
        // Setup
        vi.mocked(isAuthenticated).mockReturnValue(false);

        // Render
        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route
                        path="/login"
                        element={<div data-testid="login">Login Page</div>}
                    />
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        // Assert
        expect(screen.getByTestId('login')).toBeInTheDocument();
    });
});
