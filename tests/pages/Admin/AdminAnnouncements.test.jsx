import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import AdminAnnouncements from 'Se_Frontend/src/pages/Admin/AdminAnnouncements';
import { AuthProvider } from 'Se_Frontend/src/contexts/AuthContext';

// Mock the required components
vi.mock('Se_Frontend/src/components/common/layout/Sidebar', () => ({
  default: ({ navItems }) => <div data-testid="sidebar">Sidebar</div>,
}));
vi.mock('Se_Frontend/src/components/common/layout/Header', () => ({
  default: ({ title }) => <div data-testid="header">{title}</div>,
}));
vi.mock('Se_Frontend/src/components/common/Button/Modal', () => ({
  default: ({ children }) => <div data-testid="modal">{children}</div>,
}));
vi.mock('Se_Frontend/src/components/common/Modals/Delete/DeleteModal', () => ({
  default: ({ onConfirm, onCancel }) => (
    <div data-testid="delete-modal">
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));
vi.mock('Se_Frontend/src/components/common/layout/MobileNavbar', () => ({
  default: ({ navItems }) => <div data-testid="mobile-navbar">Mobile Navbar</div>,
}));

describe('AdminAnnouncements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component correctly with announcements', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminAnnouncements />
        </AuthProvider>
      </MemoryRouter>
    );

    // Check if the sidebar, header, and mobile navbar are rendered
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-navbar')).toBeInTheDocument();

    // Check if the announcements are rendered
    await waitFor(() => {
      expect(screen.getByText('New Course Launch')).toBeInTheDocument();
      expect(screen.getByText('Holiday Schedule')).toBeInTheDocument();
    });
  });

  it('expands and collapses announcement details when clicked', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminAnnouncements />
        </AuthProvider>
      </MemoryRouter>
    );

    // Expand the first announcement
    fireEvent.click(screen.getByText('New Course Launch'));
    await waitFor(() => {
      expect(screen.getByText('We are excited to announce the launch of our new course on Advanced Machine Learning. Enroll now to get early bird discounts!')).toBeInTheDocument();
    });

    // Collapse the first announcement
    fireEvent.click(screen.getByText('New Course Launch'));
    await waitFor(() => {
      expect(screen.queryByText('We are excited to announce the launch of our new course on Advanced Machine Learning. Enroll now to get early bird discounts!')).not.toBeInTheDocument();
    });
  });

  it('opens and closes the delete modal', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminAnnouncements />
        </AuthProvider>
      </MemoryRouter>
    );

    // Open the delete modal for the first announcement
    fireEvent.click(screen.getByLabelText('delete-announcement-1'));
    await waitFor(() => {
      expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
    });

    // Close the delete modal
    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => {
      expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
    });
  });

  it('opens and closes the add announcement modal', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminAnnouncements />
        </AuthProvider>
      </MemoryRouter>
    );

    // Open the add announcement modal
    fireEvent.click(screen.getByRole('button', { name: /add announcement/i }));
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    // Close the add announcement modal
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('handles adding a new announcement', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminAnnouncements />
        </AuthProvider>
      </MemoryRouter>
    );

    // Open the add announcement modal
    fireEvent.click(screen.getByRole('button', { name: /add announcement/i }));
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    // Fill in the new announcement details
    fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'New Announcement' } });
    fireEvent.change(screen.getByPlaceholderText('Content'), { target: { value: 'This is a new announcement.' } });

    // Add the new announcement
    fireEvent.click(screen.getByText('Add'));
    await waitFor(() => {
      expect(screen.getByText('New Announcement')).toBeInTheDocument();
      expect(screen.getByText('This is a new announcement.')).toBeInTheDocument();
    });
  });
});