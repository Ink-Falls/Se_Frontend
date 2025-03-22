import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TestComponents from 'Se_Frontend/src/components/test/TestComponents.jsx';
import { loginUser, logoutUser } from 'Se_Frontend/src/services/authService';
import tokenService from 'Se_Frontend/src/services/tokenService';

vi.mock('Se_Frontend/src/services/authService');
vi.mock('Se_Frontend/src/services/tokenService');

describe('TestComponents', () => {
  it('renders the TestComponents component', () => {
    render(<TestComponents />);
    expect(screen.getByText('Network Features Tester')).toBeInTheDocument();
    expect(screen.getByText('Auth Services Tester')).toBeInTheDocument();
    expect(screen.getByText('Test Error Boundary')).toBeInTheDocument();
    expect(screen.getByText('Test Loading Spinner')).toBeInTheDocument();
  });

  it('handles BuggyComponent error', () => {
    render(<TestComponents />);
    fireEvent.click(screen.getByText('Throw Error'));
    expect(() => screen.getByText('Throw Error')).toThrow();
  });

  it('handles loading spinner', async () => {
    render(<TestComponents />);
    fireEvent.click(screen.getByText('Show Loading Spinner'));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument(), { timeout: 3000 });
  });

  it('runs auth tests', async () => {
    loginUser.mockResolvedValue({
      token: 'test-token',
      refreshToken: 'test-refresh-token',
      user: { id: 1, name: 'Test User' },
    });
    tokenService.saveTokens.mockResolvedValue();
    tokenService.validateAuth.mockResolvedValue({ valid: true });
    tokenService.refreshToken.mockResolvedValue('new-test-token');
    logoutUser.mockResolvedValue();

    render(<TestComponents />);
    fireEvent.click(screen.getByText('Run Auth Tests'));

    await waitFor(() => expect(screen.getByText('Login successful')).toBeInTheDocument());
    expect(screen.getByText('Token and user data stored successfully')).toBeInTheDocument();
    expect(screen.getByText('Token valid')).toBeInTheDocument();
    expect(screen.getByText('Token refresh successful')).toBeInTheDocument();
    expect(screen.getByText('Logout successful')).toBeInTheDocument();
  });

  it('runs network tests', async () => {
    tokenService.getAccessToken.mockReturnValue('test-token');

    render(<TestComponents />);
    fireEvent.click(screen.getByText('Test Rate Limit'));
    await waitFor(() => expect(screen.getByText('Rate limit test completed')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Test Circuit Breaker'));
    await waitFor(() => expect(screen.getByText('Circuit breaker test completed')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Test Token Refresh'));
    await waitFor(() => expect(screen.getByText('Token refresh successful')).toBeInTheDocument());
  });
});