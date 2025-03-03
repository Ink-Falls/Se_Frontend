import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar, { SidebarItem } from 'Se_Frontend/src/components/Sidebar.jsx'; // Adjust the import path
import { LogOut, Home, User } from 'lucide-react'; // Assuming these are the icons
import { vi, describe, it, expect } from 'vitest';
import React from 'react'; // Explicitly import React
// Mock the logo import
// vi.mock('/src/assets/ARALKADEMYLOGO.png', () => 'ARALKADEMYLOGO.png');

// Mock SidebarContext
vi.mock('react', async () => {
    const actualReact = await vi.importActual('react');
    const SidebarContext = actualReact.createContext(); // Define SidebarContext
    const SidebarContextValue = {
        expanded: true, // Default value, can be adjusted in tests
        currentPath: '/',
    };

    return {
        ...actualReact,
        createContext: () => ({
            Provider: ({ children }) => {
                return (
                    <SidebarContext.Provider value={SidebarContextValue}>
                        {children}
                    </SidebarContext.Provider>
                );
            },
            Consumer: ({ children }) => children(SidebarContextValue), //mock the context
        }),
        useContext: () => SidebarContextValue,
        useState: vi.fn(() => [true, vi.fn()]) // Default to expanded = true
    };
});

const navItems = [
    { icon: <Home />, text: 'Dashboard', route: '/dashboard' },
    { icon: <User />, text: 'Users', route: '/users' },
];

describe('Sidebar Component', () => {

    it('should render the logo and toggle button', () => {
        render(
            <MemoryRouter>
                <Sidebar navItems={navItems} />
            </MemoryRouter>
        );
    
        // Ensure the logo is found (case insensitive)
        expect(screen.getByAltText(/aralkademy logo/i)).toBeInTheDocument();
    
        // Ensure the toggle button exists
        expect(screen.getByRole('button')).toBeInTheDocument();
    });
    

    it('should render navigation items', () => {
        render(
            <MemoryRouter>
                <Sidebar navItems={navItems} />
            </MemoryRouter>
        );

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Users')).toBeInTheDocument();
    });


    it('should render the logout button', () => {
        render(
            <MemoryRouter>
                <Sidebar navItems={navItems} />
            </MemoryRouter>
        );

        expect(screen.getByText('Logout')).toBeInTheDocument();
    });


    it('should toggle the sidebar expansion on button click', () => {
         const useStateMock = vi.fn();
        useStateMock.mockReturnValue([true, vi.fn()]);

        vi.spyOn(React, 'useState').mockImplementation((initState) => {
             const useStateMock = vi.fn(() => [initState, vi.fn()]);
            return useStateMock()
        });

        render(
            <MemoryRouter>
                <Sidebar navItems={navItems} />
            </MemoryRouter>
        );

        const toggleButton = screen.getByRole('button');

        fireEvent.click(toggleButton);
    });

    it('should apply active class to the active route', () => {

        const wrapper = ({ children }) => (
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route path="*" element={children} />
                </Routes>
            </MemoryRouter>
        );
        render(
            <Sidebar navItems={navItems} />, { wrapper }
        );

        const dashboardLink = screen.getByText('Dashboard').closest('li');
        expect(dashboardLink).toHaveClass("bg-[#F6BA18]");
    });
});

describe('SidebarItem Component', () => {
    it('should render a link with the correct route and text', () => {
        render(
            <MemoryRouter>
                <SidebarItem icon={<Home />} text="Dashboard" route="/dashboard" />
            </MemoryRouter>
        );

        const linkElement = screen.getByText('Dashboard').closest('a');
        expect(linkElement).toBeInTheDocument();
        expect(linkElement).toHaveAttribute('href', '/dashboard');
    });

    it('should display the text when the sidebar is expanded', () => {
        render(
            <MemoryRouter>
                <SidebarItem icon={<Home />} text="Dashboard" route="/dashboard" />
            </MemoryRouter>
        );

        expect(screen.getByText('Dashboard')).toBeVisible();
    });
});