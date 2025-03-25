import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NotificationDetails from 'Se_Frontend/src/pages/Learner/LearnerNotificationDetails';
import { AuthProvider } from 'Se_Frontend/src/contexts/AuthContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('NotificationDetails Component', () => {
  const mockNotification = {
    id: 1,
    type: 'Course Update',
    description: 'New course material available',
    time: '2 hours ago',
    userImage: 'https://via.placeholder.com/150',
  };

  const renderComponent = (notification) => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/Learner/NotificationDetails/1', state: { notification } }]}>
        <AuthProvider>
          <Routes>
            <Route path="/Learner/NotificationDetails/:id" element={<NotificationDetails />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('renders the notification details correctly', () => {
    renderComponent(mockNotification);

    // Check if the sidebar is rendered
    const links = screen.getAllByRole('link');
    expect(links.some(link => link.textContent.includes('Courses'))).toBe(true);
    expect(links.some(link => link.textContent.includes('Notifications'))).toBe(true);

    // Check if the header is rendered
    const headers = screen.getAllByRole('heading', { name: /notification/i });
    expect(headers[0]).toBeInTheDocument();

    // Check if the notification details are rendered
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('New course material available')).toBeInTheDocument();
    expect(screen.getByText('Course Update')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });

  it('displays a message if the notification is not found', () => {
    renderComponent(null);

    // Check if the notification not found message is displayed
    expect(screen.getByText('Notification not found.')).toBeInTheDocument();

    // Check if the back to notifications button is rendered
    const backButton = screen.getByRole('button', { name: /back to notifications/i });
    expect(backButton).toBeInTheDocument();
  });
  it('navigates back to the notifications page when the back button is clicked', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/Learner/NotificationDetails/1', state: { notification: null } }]}>
        <AuthProvider>
          <Routes>
            <Route path="/Learner/NotificationDetails/:id" element={<NotificationDetails />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Find the button with a flexible matcher
    const backButton = screen.getByRole('button', { name: /back to notifications/i });
    expect(backButton).toBeInTheDocument();

    // Simulate button click
    fireEvent.click(backButton);

    // Verify navigation call
    expect(mockNavigate).toHaveBeenCalledWith('/Learner/Notifications');
  });
});