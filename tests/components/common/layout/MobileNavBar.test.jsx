import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MobileNavBar from 'Se_Frontend/src/components/common/layout/MobileNavbar.jsx';
import { describe, it, expect, vi } from 'vitest';

// Mock the useAuth hook
const mockLogout = vi.fn();
vi.mock('../../../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    logout: mockLogout,
    isAuthenticated: true,
    user: { id: 1, name: 'Test User' },
    loading: false
  })
}));

describe('MobileNavBar Component', () => {
  const renderWithRouter = (initialEntries) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="*" element={<MobileNavBar navItems={[
            { route: '/Dashboard', icon: <span>Courses</span> },
            { route: '/Notifications', icon: <span>Notifications</span> },
            { route: '/Account', icon: <span>Account</span> }
          ]} />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render the navigation links', () => {
    renderWithRouter(['/Dashboard']);

    // Check if the navigation links are rendered
    expect(screen.getByText(/courses/i)).toBeInTheDocument();
    expect(screen.getByText(/notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/account/i)).toBeInTheDocument();
  });

  it('should highlight the active link based on the current route', () => {
    renderWithRouter(['/Dashboard']);

    // Check if the Dashboard link is highlighted
    const dashboardLink = screen.getByText(/courses/i).closest('a');
    expect(dashboardLink).toHaveClass('text-[#F6BA18]');

    // Check if the other links are not highlighted
    const notificationsLink = screen.getByText(/notifications/i).closest('a');
    const accountLink = screen.getByText(/account/i).closest('a');
    expect(notificationsLink).toHaveClass('text-white');
    expect(accountLink).toHaveClass('text-white');
  });

  it('should change the active link when the route changes', () => {
    renderWithRouter(['/Notifications']);

    // Check if the Notifications link is highlighted
    const notificationsLink = screen.getByText(/notifications/i).closest('a');
    expect(notificationsLink).toHaveClass('text-[#F6BA18]');

    // Check if the other links are not highlighted
    const dashboardLink = screen.getByText(/courses/i).closest('a');
    const accountLink = screen.getByText(/account/i).closest('a');
    expect(dashboardLink).toHaveClass('text-white');
    expect(accountLink).toHaveClass('text-white');
  });
});