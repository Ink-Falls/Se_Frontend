import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Notifications from '../../../src/pages/Learner/LearnerNotifications';
import { AuthProvider } from '../../../src/contexts/AuthContext';

describe('Notifications Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sidebar, header, and notifications component correctly', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Notifications />
        </AuthProvider>
      </MemoryRouter>
    );

    // Check if the sidebar is rendered
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();

    // Check if the header is rendered
    expect(screen.getByText('All Notifications')).toBeInTheDocument();

    // Check if the notifications component is rendered
    expect(screen.getByText('Environmental Science class schedule updated')).toBeInTheDocument();
    expect(screen.getByText('New assignment posted in Computer Programming')).toBeInTheDocument();
  });

  it('navigates to the correct route when a sidebar item is clicked', () => {
    const mockNavigate = vi.fn();
    render(
      <MemoryRouter>
        <AuthProvider>
          <Notifications />
        </AuthProvider>
      </MemoryRouter>
    );

    // Simulate clicking on the "Courses" sidebar item
    fireEvent.click(screen.getByText('Courses'));

    // Check if the navigate function was called with the correct route
    expect(mockNavigate).toHaveBeenCalledWith('/Learner/Dashboard');
  });

  it('displays the correct number of notifications', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Notifications />
        </AuthProvider>
      </MemoryRouter>
    );

    // Check if the correct number of notifications is displayed
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('sorts notifications by newest first', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Notifications />
        </AuthProvider>
      </MemoryRouter>
    );

    const sortButton = screen.getByText('Newest first');
    fireEvent.click(sortButton);

    const sortedNotifications = screen.getAllByRole('listitem');
    expect(sortedNotifications[0]).toHaveTextContent('Environmental Science class schedule updated');
    expect(sortedNotifications[1]).toHaveTextContent('New assignment posted in Computer Programming');
  });

  it('sorts notifications by oldest first', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Notifications />
        </AuthProvider>
      </MemoryRouter>
    );

    const sortButton = screen.getByText('Newest first');
    fireEvent.click(sortButton);

    const oldestFirstButton = screen.getByText('Oldest first');
    fireEvent.click(oldestFirstButton);

    const sortedNotifications = screen.getAllByRole('listitem');
    expect(sortedNotifications[0]).toHaveTextContent('New assignment posted in Computer Programming');
    expect(sortedNotifications[1]).toHaveTextContent('Environmental Science class schedule updated');
  });

  it('toggles the sort order dropdown', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Notifications />
        </AuthProvider>
      </MemoryRouter>
    );

    const sortButton = screen.getByText('Newest first');
    fireEvent.click(sortButton);

    expect(screen.getByText('Oldest first')).toBeInTheDocument();
    expect(screen.getByText('Newest first')).toBeInTheDocument();

    fireEvent.click(sortButton);

    expect(screen.queryByText('Oldest first')).not.toBeInTheDocument();
    expect(screen.queryByText('Newest first')).not.toBeInTheDocument();
  });
});