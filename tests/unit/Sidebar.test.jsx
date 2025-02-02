import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router, MemoryRouter, Route, Routes } from 'react-router-dom';
import Sidebar, { SidebarItem } from 'Se_Frontend/src/components/Sidebar.jsx'; // Adjust the path
import { ChevronRight, ChevronFirst } from "lucide-react";



describe('Sidebar Component', () => {
  it('should render the sidebar with the logo and minimize button', () => {
    render(
      <Router>
        <Sidebar>
          <div></div>
        </Sidebar>
      </Router>
    );

    expect(screen.getByRole('img', { name: /ARALKADEMY Logo/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // it('should display the chevron first icon when expanded', () => {
  //   render(
  //     <Router>
  //       <Sidebar>
  //         <div></div>
  //       </Sidebar>
  //     </Router>
  //   );

  //   expect(screen.getByRole('button').querySelector('svg[data-lucide="chevron-first"]')).toBeVisible();
  //   expect(screen.queryByRole('button').querySelector('svg[data-lucide="chevron-last"]')).toBeNull();
  // });

  // it('should display the chevron last icon when collapsed', () => {
  //   render(
  //     <Router>
  //       <Sidebar>
  //         <div></div>
  //       </Sidebar>
  //     </Router>
  //   );

  //   // Click the button to collapse the sidebar
  //   const button = screen.getByRole('button');
  //   fireEvent.click(button);

  //   // Get the chevron-last icon
  //   const chevronLast = screen.getByRole('button').querySelector('svg[data-lucide="chevron-right"]');
  //   const chevronFirst = screen.getByRole('button').querySelector('svg[data-lucide="chevron-left"]');

  //   // Assert that chevron-last is visible and chevron-first is not present
  //   expect(chevronLast).toBeInTheDocument(); // Ensure it exists
  //   expect(chevronLast).toBeVisible(); // Now check visibility
  //   expect(chevronFirst).toBeNull(); // Ensure chevron-first is gone
  // });


  it('should expand and collapse the sidebar on button click', () => {
    render(
      <Router>
        <Sidebar>
          <div></div>
        </Sidebar>
      </Router>
    );

    const minimizeButton = screen.getByRole('button');
    const logoImage = screen.getByRole('img', { name: /ARALKADEMY Logo/i });
    expect(logoImage).toHaveClass('w-40');

    fireEvent.click(minimizeButton);
    expect(logoImage).toHaveClass('w-0');

    fireEvent.click(minimizeButton);
    expect(logoImage).toHaveClass('w-40');

  });

  it('should render sidebar items correctly', () => {
    render(
      <Router>
        <Sidebar>
          <SidebarItem text="Dashboard" icon={<svg data-testid="dashboard-icon" />} route="/dashboard" />
          <SidebarItem text="Courses" icon={<svg data-testid="course-icon" />} route="/courses" alert />
        </Sidebar>
      </Router>
    );
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/courses/i)).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-icon')).toBeInTheDocument();
    expect(screen.getByTestId('course-icon')).toBeInTheDocument();
  });

  it('should hide the item text when the sidebar is collapsed', async () => {
    render(
      <Router>
        <Sidebar>
          <SidebarItem text="Dashboard" icon={<svg data-testid="dashboard-icon" />} route="/dashboard" />
          <SidebarItem text="Courses" icon={<svg data-testid="course-icon" />} route="/courses" alert />
        </Sidebar>
      </Router>
    );

    const minimizeButton = screen.getByRole('button');
    const dashboardText = screen.getByText(/dashboard/i)
    const coursesText = screen.getByText(/courses/i)


    fireEvent.click(minimizeButton)

    expect(dashboardText).toHaveClass('w-0');
    expect(coursesText).toHaveClass('w-0');

    fireEvent.click(minimizeButton)

    expect(dashboardText).toHaveClass('w-52');
    expect(coursesText).toHaveClass('w-52');
  });

  it('should display a tooltip when hovering over a minimized sidebar item', () => {
    render(
      <Router>
        <Sidebar>
          <SidebarItem
            text="Dashboard"
            icon={<svg data-testid="dashboard-icon" />}
            route="/dashboard"
          />
        </Sidebar>
      </Router>
    );
  
    // Collapse the sidebar
    const minimizeButton = screen.getByRole('button');
    fireEvent.click(minimizeButton);
  
    // Hover over the sidebar item
    const sidebarItem = screen.getByRole('listitem');
    fireEvent.mouseOver(sidebarItem);
  
    // Check tooltip visibility and class
    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toBeVisible();
    expect(tooltip).toHaveClass('group-hover:translate-x-0');
  
    // Stop hovering and check tooltip invisibility
    fireEvent.mouseOut(sidebarItem);
    expect(tooltip).toHaveClass('opacity-0');
    expect(tooltip).not.toBeVisible();
  });
  
  



  it('should render an active item with the correct styles', () => {
    render(
      <Router>
        <Sidebar>
          <SidebarItem
            text="Dashboard"
            icon={<svg data-testid="dashboard-icon" />}
            route="/dashboard"
            active
          />
        </Sidebar>
      </Router>
    );

    const listItem = screen.getByRole('listitem');
    expect(listItem).toHaveClass('text-black');
    expect(listItem).not.toHaveClass('text-gray-50');
  });



  test('should navigate to the correct page when a sidebar item is clicked', async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar>
          <SidebarItem
            text="Dashboard"
            icon={<svg data-testid="dashboard-icon" />}
            route="/dashboard"
          />
        </Sidebar>
        <Routes>
          <Route
            path="/dashboard"
            element={<div data-testid="dashboard-page">Dashboard Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    // Click the sidebar item
    fireEvent.click(screen.getByText(/dashboard/i));

    // Check navigation
    expect(await screen.findByTestId('dashboard-page')).toBeInTheDocument();
  });

});