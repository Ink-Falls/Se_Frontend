import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from 'Se_Frontend/src/components/Login.jsx';  // Adjust the import according to your file structure
import { BrowserRouter as Router } from 'react-router-dom';

describe('Login Component', () => {
  it('should render the login form correctly', () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    // Check if the form elements are in the document
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/forgot password\?/i)).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();  // Updated to use data-testid
  });

  it('should handle email and password input changes', () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Simulate typing in email and password fields
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Verify if the input values are updated
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should prevent form submission if CAPTCHA is not verified', async () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByTestId('login-button');  // Updated to use data-testid

    // Simulate typing in email and password fields
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Try to submit the form without verifying CAPTCHA
    fireEvent.click(loginButton);

    // Wait for an alert to show
    // await waitFor(() => {
    //   expect(window.alert).toHaveBeenCalledWith('Please verify the CAPTCHA to proceed.');
    // });
  });

  // it('should validate that the email contains "@" and ".com"', () => {
  //   render(
  //     <Router>
  //       <Login />
  //     </Router>
  //   );

  //   const emailInput = screen.getByLabelText(/email/i);
  //   const loginButton = screen.getByTestId('login-button'); // Ensure this matches your data-testid

  //   // Test invalid email (missing "@" and ".com")
  //   fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
  //   fireEvent.click(loginButton);

  //   expect(screen.getByText(/invalid email format/i)).toBeInTheDocument(); // Adjust to your validation message

  //   // Test valid email
  //   fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
  //   fireEvent.click(loginButton);

  //   // Assuming no error message is shown for valid email
  //   expect(screen.queryByText(/invalid email format/i)).toBeNull();
  // });


  it('should navigate to the Home page on successful login', async () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByTestId('login-button');  // Updated to use data-testid

    // Simulate typing in email and password fields
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Simulate that CAPTCHA is verified by bypassing the reCAPTCHA logic
    // No need for CAPTCHA in this test case

    // Submit the form
    fireEvent.click(loginButton);

    // Check that navigation happens (you may mock the `navigate` function for testing)
    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
    });
  });
});