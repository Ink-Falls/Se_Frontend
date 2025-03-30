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

// Mock the ReCAPTCHA component properly
vi.mock('react-google-recaptcha', () => ({
  __esModule: true,
  default: function ReCAPTCHA(props) {
    return <div data-testid="recaptcha-mock">ReCAPTCHA Mock</div>;
  }
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
    vi.clearAllMocks();
    
    // Set up a global captcha response for testing
    global.captchaResponse = 'test-captcha-response';
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete global.captchaResponse;
  });

  it('renders login form elements correctly', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Log In' })).toBeInTheDocument();
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

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    
    // First directly set email field as empty and trigger blur
    fireEvent.change(emailInput, { target: { value: '' } });
    fireEvent.blur(emailInput);
    
    // Wait for validation messages to appear
    await waitFor(() => {
      expect(screen.queryByText('Email is required')).toBeInTheDocument();
    });
    
    // Enter invalid email and trigger blur
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.queryByText('Please enter a valid email address')).toBeInTheDocument();
    });
    
    // Clear password field and trigger blur
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.blur(passwordInput);
    
    await waitFor(() => {
      expect(screen.queryByText('Password is required')).toBeInTheDocument();
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

    // Fill in form with valid data
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password' } });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('login-button'));

    // Verify loginUser was called with correct arguments
    expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password', expect.any(String));
    
    // Wait for navigation to happen after successful login
    await waitFor(() => {
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

    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password' } });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('login-button'));
    
    // Verify loginUser was called with correct arguments
    expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password', expect.any(String));
    
    // Check for error message after failed login
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Login failed. Please try again.');
    });
  });

  it('toggles password visibility', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const passwordInput = screen.getByTestId('password-input');
    const toggleButton = screen.getByTestId('password-toggle');

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
