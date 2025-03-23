import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Login from '../../../src/pages/General/Login';
import { loginUser } from '../../../src/services/authService';
import { useAuth } from '../../../src/contexts/AuthContext';

vi.mock('../../../src/services/authService', () => ({
  loginUser: vi.fn(),
}));

vi.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('Login Component', () => {
  const mockCheckAuth = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({ checkAuth: mockCheckAuth });
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form elements correctly', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByText('Enroll')).toBeInTheDocument();
  });

  it('validates email and password inputs', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Log In'));

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'invalid-email' } });
    fireEvent.click(screen.getByText('Log In'));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Log In'));

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('handles successful login', async () => {
    loginUser.mockResolvedValueOnce({ token: 'test-token', user: { role: 'admin' } });
    mockCheckAuth.mockResolvedValueOnce({ user: { role: 'admin' } });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Log In'));

    await waitFor(() => {
      expect(mockCheckAuth).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/Admin/Dashboard', { replace: true });
    });
  });

  it('handles login failure', async () => {
    loginUser.mockRejectedValueOnce(new Error('Login failed'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Log In'));

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const toggleButton = screen.getByRole('button', { name: /eye/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('navigates to forgot password page', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Forgot Password?'));

    expect(mockNavigate).toHaveBeenCalledWith('/ForgotPassword');
  });

  it('navigates to enrollment page', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Enroll'));

    expect(mockNavigate).toHaveBeenCalledWith('/Enrollment');
  });
});
