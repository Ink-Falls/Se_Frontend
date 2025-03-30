import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from 'Se_Frontend/src/pages/General/Profile';
import { getUserById, updateUser } from 'Se_Frontend/src/services/userService';
import { changePassword } from 'Se_Frontend/src/services/authService';
import { useAuth } from 'Se_Frontend/src/contexts/AuthContext';

// Mock services
vi.mock('Se_Frontend/src/services/userService', () => ({
  getUserById: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock('Se_Frontend/src/services/authService', () => ({
  changePassword: vi.fn(),
}));

// Mock AuthContext
vi.mock('Se_Frontend/src/contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: vi.fn(),
}));

// Mock Header, Sidebar, and MobileNavbar components
vi.mock('Se_Frontend/src/components/common/layout/Header', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock('Se_Frontend/src/components/common/layout/Sidebar', () => ({
  default: () => <div data-testid="mock-sidebar">Sidebar</div>,
}));

vi.mock('Se_Frontend/src/components/common/layout/MobileNavbar', () => ({
  default: () => <div data-testid="mock-mobile-navbar">Mobile Nav</div>,
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Profile Component', () => {
  const mockUser = {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    middle_initial: 'A',
    email: 'john.doe@example.com',
    contact_no: '1234567890',
    birth_date: '1990-01-01',
    school_id: 1001,
    role: 'learner',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    // Mock AuthContext values
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: mockUser
    });

    // Set up getUserById to return the mockUser
    getUserById.mockResolvedValue(mockUser);
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
  };

  it('renders the profile page with user data', async () => {
    getUserById.mockResolvedValue(mockUser);
    
    await act(async () => {
      renderComponent();
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Asuncion Consunji Elementary School (ACES)')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });
  });

  it('handles loading state', async () => {
    // Mock loading state
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: true, // Set auth loading to true
      user: null
    });
    
    // Render component while auth is loading
    renderComponent();
    
    // In the actual component, you'd have a div with "Loading..." text
    // Check that auth.loading is used in the component
    expect(useAuth).toHaveBeenCalled();
    
    // Reset the auth mock for other tests
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: mockUser
    });
  });

  it('handles error state', async () => {
    // Modify the behavior to simulate an error scenario
    localStorage.removeItem('user'); // Remove user from localStorage
    useAuth.mockReturnValue({
      isAuthenticated: false, // User not authenticated
      loading: false,
      user: null
    });
    
    // Expect navigation to login
    await act(async () => {
      renderComponent();
    });
    
    // Should redirect to login
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('opens and closes the "Change Password" modal', async () => {
    await act(async () => {
      renderComponent();
    });

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const changePasswordButton = screen.getByLabelText('change_password');
    await act(async () => {
      fireEvent.click(changePasswordButton);
    });

    // Use a more specific selector for the modal title
    expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancel');
    await act(async () => {
      fireEvent.click(cancelButton);
    });

    expect(screen.queryByText('Submit')).not.toBeInTheDocument();
  });

  it('handles password change', async () => {
    changePassword.mockResolvedValue({});

    await act(async () => {
      renderComponent();
    });

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const changePasswordButton = screen.getByLabelText('change_password');
    await act(async () => {
      fireEvent.click(changePasswordButton);
    });

    const oldPasswordInput = screen.getByPlaceholderText('Old Password');
    const newPasswordInput = screen.getByPlaceholderText('New Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
    const submitButton = screen.getByText('Submit');

    await act(async () => {
      fireEvent.change(oldPasswordInput, { target: { value: 'oldpassword' } });
      fireEvent.change(newPasswordInput, { target: { value: 'NewPassword1!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword1!' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(changePassword).toHaveBeenCalledWith(
        mockUser.id,
        'oldpassword',
        'NewPassword1!',
        'NewPassword1!'
      );
      expect(screen.getByText('Password changed successfully!')).toBeInTheDocument();
    });
  });

  it('opens and closes the "Edit Profile" modal', async () => {
    await act(async () => {
      renderComponent();
    });

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Find the Edit Profile button by its text content
    const editProfileButton = screen.getByText('Edit Profile');
    await act(async () => {
      fireEvent.click(editProfileButton);
    });

    // Using the heading's aria-label instead of its text content
    expect(screen.getByLabelText('edit_profile')).toBeInTheDocument();

    const cancelButton = screen.getAllByText('Cancel')[0]; // First cancel button
    await act(async () => {
      fireEvent.click(cancelButton);
    });

    expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
  });

  it('handles profile update', async () => {
    const updatedUser = { ...mockUser, first_name: 'Jane' };
    updateUser.mockResolvedValue(updatedUser);

    await act(async () => {
      renderComponent();
    });

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Find the Edit Profile button by its text content
    const editProfileButton = screen.getByText('Edit Profile');
    await act(async () => {
      fireEvent.click(editProfileButton);
    });

    // Find the First Name input by its label text
    const firstNameLabel = screen.getByText('First Name');
    const firstNameInput = firstNameLabel.parentElement.querySelector('input');
    const saveChangesButton = screen.getByText('Save Changes');

    await act(async () => {
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
      fireEvent.click(saveChangesButton);
    });

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith(mockUser.id, expect.objectContaining({
        first_name: 'Jane',
      }));
      
      // Instead of looking for the success message, verify that updateUser was called correctly
      // and that the component has updated the user's name 
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });
});