import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Sidebar from 'Se_Frontend/src/components/common/layout/Sidebar.jsx'; // Adjust the import according to your file structure
import { describe, it, expect, vi } from 'vitest';
import { Book, Bell, User } from "lucide-react";
import { logoutUser } from 'Se_Frontend/src/services/authService.js'; // Adjust the import according to your file structure

vi.mock('Se_Frontend/src/services/authService.js', () => ({
  logoutUser: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const navItems = [
  { icon: <Book size={24} />, text: 'Courses', route: '/Dashboard' },
  { icon: <Bell size={24} />, text: 'Notifications', route: '/Notifications' },
  { icon: <User size={24} />, text: 'Account', route: '/Profile' },
];

describe('Sidebar Component', () => {
  const renderWithRouter = (initialEntries) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="*" element={<Sidebar navItems={navItems} isSidebarOpen={true} setIsSidebarOpen={() => {}} />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render the sidebar with navigation items', () => {
    renderWithRouter(['/Dashboard']);

    // Check if the navigation items are rendered
    expect(screen.getByText(/courses/i)).toBeInTheDocument();
    expect(screen.getByText(/notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/account/i)).toBeInTheDocument();
  });

  it('should toggle the expanded/collapsed state', () => {
    renderWithRouter(['/Dashboard']);

    // Check if the sidebar is initially expanded
    expect(screen.getByAltText('ARALKADEMY Logo')).toHaveClass('w-40');

    // Click the toggle button to collapse the sidebar
    fireEvent.click(screen.getByRole('button', { name: /collapse sidebar/i }));
    expect(screen.getByAltText('ARALKADEMY Logo')).toHaveClass('w-0');

    // Click the toggle button to expand the sidebar
    fireEvent.click(screen.getByRole('button', { name: /expand sidebar/i }));
    expect(screen.getByAltText('ARALKADEMY Logo')).toHaveClass('w-40');
  });

  it('should navigate to different routes', () => {
    renderWithRouter(['/Dashboard']);

    // Click the Notifications link
    fireEvent.click(screen.getByText(/notifications/i));
    expect(screen.getByText(/notifications/i).closest('li')).toHaveClass('bg-[#F6BA18] text-black');

    // Click the Account link
    fireEvent.click(screen.getByText(/account/i));
    expect(screen.getByText(/account/i).closest('li')).toHaveClass('bg-[#F6BA18] text-black');
  });

  it('should handle logout', async () => {
    renderWithRouter(['/Dashboard']);

    // Mock the logout function
    logoutUser.mockResolvedValueOnce();

    // Click the logout button
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    // Check if the logout function was called
    expect(logoutUser).toHaveBeenCalledTimes(1);

    // Check if the user is redirected to the login page
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});