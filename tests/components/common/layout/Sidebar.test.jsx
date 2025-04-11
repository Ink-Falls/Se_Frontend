import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Sidebar from 'Se_Frontend/src/components/common/layout/Sidebar.jsx'; // Adjust the import according to your file structure
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Book, Bell, User } from "lucide-react";

// Mock window.location.replace for logout test
Object.defineProperty(window, 'location', {
  writable: true,
  value: { replace: vi.fn() }
});

vi.mock('Se_Frontend/src/services/authService.js', () => ({
  logoutUser: vi.fn(),
}));

// Create a mockLogout function we can track
const mockLogout = vi.fn().mockImplementation(() => Promise.resolve());

// Mock the AuthContext's useAuth hook
vi.mock('Se_Frontend/src/contexts/AuthContext.jsx', async () => {
  const actual = await vi.importActual('Se_Frontend/src/contexts/AuthContext.jsx');
  return {
    ...actual,
    useAuth: () => ({
      logout: mockLogout,
      user: { name: 'Test User' },
      isAuthenticated: true
    })
  };
});

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

    // Get the toggle button by its class since it doesn't have a name
    const toggleButton = screen.getByRole('button', { 
      name: '' // The button doesn't have an accessible name
    });
    
    // Click to collapse
    fireEvent.click(toggleButton);
    
    // The logo should now have w-0 class
    expect(screen.getByAltText('ARALKADEMY Logo')).toHaveClass('w-0');

    // Click to expand again
    fireEvent.click(toggleButton);
    
    // The logo should have w-40 class again
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

    // Click the logout button
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    // Wait for async operations to complete
    await waitFor(() => {
      // Check if the logout function was called
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    // Check if location.replace was called with '/login'
    expect(window.location.replace).toHaveBeenCalledWith('/login');
  });
});