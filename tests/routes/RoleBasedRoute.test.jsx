import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { RoleBasedRoute } from 'Se_Frontend/src/routes/RoleBasedRoute.jsx';
import { useAuth } from 'Se_Frontend/src/contexts/AuthContext';

vi.mock('Se_Frontend/src/contexts/AuthContext');

describe('RoleBasedRoute', () => {
  it('renders loading state', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, user: null, loading: true });

    render(
      <MemoryRouter>
        <RoleBasedRoute allowedRoles={['admin']}>
          <div>Protected Content</div>
        </RoleBasedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('redirects to login if not authenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, user: null, loading: false });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <div>Protected Content</div>
              </RoleBasedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to unauthorized if user role is not allowed', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'learner' }, loading: false });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <div>Protected Content</div>
              </RoleBasedRoute>
            }
          />
          <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
  });

  it('renders children if user role is allowed', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'admin' }, loading: false });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <div>Protected Content</div>
              </RoleBasedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});