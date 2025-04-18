import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotificationsComponent from 'Se_Frontend/src/pages/Learner/NotificationsComponent';

describe('NotificationsComponent', () => {
  const notifications = [
    {
      id: 1,
      type: 'Course Update',
      description: 'New course material available',
      time: '2 hours ago',
      userImage: 'https://via.placeholder.com/150',
    },
    {
      id: 2,
      type: 'Assignment Due',
      description: 'Assignment 1 is due tomorrow',
      time: '1 day ago',
      userImage: 'https://via.placeholder.com/150',
    },
  ];

  const renderComponent = (notifications) => {
    render(
      <MemoryRouter>
        <NotificationsComponent notifications={notifications} />
      </MemoryRouter>
    );
  };

  it('renders notifications correctly', () => {
    renderComponent(notifications);

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('New course material available')).toBeInTheDocument();
    expect(screen.getByText('Assignment 1 is due tomorrow')).toBeInTheDocument();
  });

  it('displays "No new notifications" when there are no notifications', () => {
    renderComponent([]);

    expect(screen.getByText('No new notifications')).toBeInTheDocument();
  });

  it('sorts notifications by newest first', () => {
    renderComponent(notifications);

    const sortButton = screen.getByRole('button', { name: /newest first/i });
    fireEvent.click(sortButton);

    const sortedNotifications = screen.getAllByRole('listitem');
    expect(sortedNotifications[1]).toHaveTextContent('New course material available');
    expect(sortedNotifications[0]).toHaveTextContent('Assignment 1 is due tomorrow');
  });

  it('sorts notifications by oldest first', () => {
    renderComponent(notifications);

    const sortButton = screen.getByRole('button', { name: /newest first/i });
    fireEvent.click(sortButton);

    const oldestFirstButton = screen.getByRole('button', { name: /oldest first/i });
    fireEvent.click(oldestFirstButton);

    const sortedNotifications = screen.getAllByRole('listitem');
    expect(sortedNotifications[1]).toHaveTextContent('Assignment 1 is due tomorrow');
    expect(sortedNotifications[0]).toHaveTextContent('New course material available');
  });

  it('toggles the sort order dropdown', () => {
    renderComponent(notifications);

    const sortButton = screen.getByRole('button', { name: /newest first/i });
    fireEvent.click(sortButton);

    expect(screen.getByText('Oldest first')).toBeInTheDocument();
    //expect(screen.getByText('Newest first')).toBeInTheDocument();

    fireEvent.click(sortButton);

    expect(screen.queryByRole('button', { name: /oldest first/i })).not.toBeInTheDocument();
   // expect(screen.queryByRole('button', { name: /newest first/i })).not.toBeInTheDocument();
  });
});