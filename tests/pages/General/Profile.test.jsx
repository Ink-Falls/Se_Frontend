import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from 'Se_Frontend/src/pages/General/Profile';
import { getUserById, updateUser } from 'Se_Frontend/src/services/userService';
import { changePassword } from 'Se_Frontend/src/services/authService';
import { AuthProvider } from 'Se_Frontend/src/contexts/AuthContext';

vi.mock('Se_Frontend/src/services/userService', () => ({
  getUserById: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock('Se_Frontend/src/services/authService', () => ({
  changePassword: vi.fn(),
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
  });

  const renderComponent = () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </AuthProvider>
    );
  };

  it('renders the profile page with user data', async () => {
    getUserById.mockResolvedValueOnce(mockUser);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Asuncion Consunji Elementary School (ACES)')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });
  });

  it('handles loading state', () => {
    renderComponent();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    getUserById.mockRejectedValueOnce(new Error('Failed to fetch user data'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch user data')).toBeInTheDocument();
    });
  });

  it('opens and closes the "Change Password" modal', async () => {
    renderComponent();

    const changePasswordButton = screen.getByText('Change Password');
    fireEvent.click(changePasswordButton);

    expect(screen.getByText('Change Password')).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Change Password')).not.toBeInTheDocument();
  });

  it('handles password change', async () => {
    changePassword.mockResolvedValueOnce();

    renderComponent();

    const changePasswordButton = screen.getByText('Change Password');
    fireEvent.click(changePasswordButton);

    const oldPasswordInput = screen.getByPlaceholderText('Old Password');
    const newPasswordInput = screen.getByPlaceholderText('New Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
    const submitButton = screen.getByText('Submit');

    fireEvent.change(oldPasswordInput, { target: { value: 'oldpassword' } });
    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword1!' } });
    fireEvent.click(submitButton);

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
    renderComponent();

    const editProfileButton = screen.getAllByText('Edit Profile');
    fireEvent.click(editProfileButton);

    expect(screen.getByText('Edit Profile')).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
  });

  it('handles profile update', async () => {
    updateUser.mockResolvedValueOnce({ ...mockUser, first_name: 'Jane' });

    renderComponent();

    const editProfileButton = screen.getByText('Edit Profile');
    fireEvent.click(editProfileButton);

    const firstNameInput = screen.getByLabelText('First Name');
    const saveChangesButton = screen.getByText('Save Changes');

    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.click(saveChangesButton);

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith(mockUser.id, {
        ...mockUser,
        first_name: 'Jane',
      });
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });
  });
});