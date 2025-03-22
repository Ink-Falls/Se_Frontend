import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { PublicRoute } from 'Se_Frontend/src/routes/PublicRoute.jsx';
import { useAuth } from 'Se_Frontend/src/contexts/AuthContext';

vi.mock('Se_Frontend/src/contexts/AuthContext');

describe('PublicRoute', () => {
  it('renders children for public routes', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, user: null, loading: false });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <div>Public Content</div>
              </PublicRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Public Content')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, user: null, loading: true });

    render(
      <MemoryRouter>
        <PublicRoute>
          <div>Public Content</div>
        </PublicRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to dashboard if authenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'learner' }, loading: false });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <div>Public Content</div>
              </PublicRoute>
            }
          />
          <Route path="/Learner/Dashboard" element={<div>Learner Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Public Content')).not.toBeInTheDocument();
    expect(screen.getByText('Learner Dashboard')).toBeInTheDocument();
  });

  it('renders children for non-public routes when not authenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, user: null, loading: false });

    render(
      <MemoryRouter initialEntries={['/non-public']}>
        <Routes>
          <Route
            path="/non-public"
            element={
              <PublicRoute>
                <div>Non-Public Content</div>
              </PublicRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Non-Public Content')).toBeInTheDocument();
  });
});