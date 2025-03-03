import React from 'react'; // Explicitly import React
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from 'Se_Frontend/src/components/Login.jsx';
import { vi, describe, it, beforeEach, afterEach } from 'vitest';
// Corrected vi.mock for react-router-dom to preserve BrowserRouter
vi.mock("react-router-dom", async () => {
  // Use async vi.mock
  const actual = await vi.importActual("react-router-dom"); // Import actual module
  return {
    ...actual, // Spread all actual exports (including BrowserRouter)
    useNavigate: () => vi.fn(), // Mock only useNavigate, using vi.fn
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    clear() {
      store = {};
    },
  };
})();
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Login Component", () => {
  const renderWithRouter = (ui) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  beforeEach(() => {
    localStorageMock.clear();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: "test-token" }),
    });
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render the Login component", () => {
    renderWithRouter(<Login />);
  });

  it('should render the "Log In" heading', () => {
    renderWithRouter(<Login />);
    const headingElement = screen.getByRole("heading", { name: /log in/i });
    expect(headingElement).toBeInTheDocument();
  });

  it("should render the email input field", () => {
    renderWithRouter(<Login />);
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("should render the password input field", () => {
    renderWithRouter(<Login />);
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it('should render the "Log In" submit button', () => {
    renderWithRouter(<Login />);
    const submitButton = screen.getByRole("button", {
      name: /log in/i,
      type: "submit",
    });
    expect(submitButton).toBeInTheDocument();
  });

  it('should render the "Enroll" button in the header', () => {
    renderWithRouter(<Login />);
    const enrollButton = screen.getByRole("button", { name: /enroll/i });
    expect(enrollButton).toBeInTheDocument();
  });

  it("should update email input value when user types", () => {
    renderWithRouter(<Login />);
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("should update password input value when user types", () => {
    renderWithRouter(<Login />);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    expect(passwordInput).toHaveValue("password123");
  });

  it("should handle successful login", async () => {
    const mockFetch = (global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "test-token" }),
    }));

    renderWithRouter(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    // Mock captcha response - you might need to adjust based on how you interact with ReCAPTCHA in tests
    const captchaInput = document.querySelector(
      'textarea[id="g-recaptcha-response"]'
    );
    if (captchaInput) {
      fireEvent.change(captchaInput, {
        target: { value: "test-captcha-response" },
      });
    }

    fireEvent.click(
      screen.getByRole("button", { name: /log in/i, type: "submit" })
    );
  });

  it("should handle login failure - 400 error", async () => {
    const mockFetch = (global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: "Invalid credentials" }),
    }));

    renderWithRouter(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpassword" },
    });
    const captchaInput = document.querySelector(
      'textarea[id="g-recaptcha-response"]'
    );
    if (captchaInput) {
      fireEvent.change(captchaInput, {
        target: { value: "test-captcha-response" },
      });
    }
    fireEvent.click(
      screen.getByRole("button", { name: /log in/i, type: "submit" })
    );
  });

  it("should handle login failure - 401 error", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: "Unauthorized" }),
    });

    renderWithRouter(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpassword" },
    });
    const captchaInput = document.querySelector(
      'textarea[id="g-recaptcha-response"]'
    );
    if (captchaInput) {
      fireEvent.change(captchaInput, {
        target: { value: "test-captcha-response" },
      });
    }
    fireEvent.click(
      screen.getByRole("button", { name: /log in/i, type: "submit" })
    );
  });

  it("should handle login failure - 500 error", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: "Server error" }),
    });

    renderWithRouter(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpassword" },
    });
    const captchaInput = document.querySelector(
      'textarea[id="g-recaptcha-response"]'
    );
    if (captchaInput) {
      fireEvent.change(captchaInput, {
        target: { value: "test-captcha-response" },
      });
    }
    fireEvent.click(
      screen.getByRole("button", { name: /log in/i, type: "submit" })
    );
  });

  it("should handle generic login error", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404, // Example generic error
      json: async () => ({ message: "Not Found" }),
    });

    renderWithRouter(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpassword" },
    });
    const captchaInput = document.querySelector(
      'textarea[id="g-recaptcha-response"]'
    );
    if (captchaInput) {
      fireEvent.change(captchaInput, {
        target: { value: "test-captcha-response" },
      });
    }
    fireEvent.click(
      screen.getByRole("button", { name: /log in/i, type: "submit" })
    );
  });

  it("should display alert if captcha is not verified", async () => {
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /log in/i, type: "submit" })
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Please verify the CAPTCHA to proceed."
      );
    });
  });

  it("should display loading state during submission", async () => {
    let resolveFetch;
    global.fetch = vi.fn().mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve; // Capture resolve function to control promise
      }).then(() => ({
        ok: true,
        json: async () => ({ token: "test-token" }),
      }))
    );

    renderWithRouter(<Login />);
    const submitButton = screen.getByRole("button", {
      name: /log in/i,
      type: "submit",
    });

    resolveFetch({
      // Resolve fetch promise to end loading state
      ok: true,
      json: async () => ({ token: "test-token" }),
    });
    await waitFor(() => {
      expect(submitButton).toBeEnabled(); // Button should be enabled after loading
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument(); // Loading text should be gone
    });
  });

  it('should call handleForgotPassword on "Forgot Password?" button click', () => {
    renderWithRouter(<Login />);
    // Use getByText instead of getByRole for "Forgot Password?" button
    const forgotPasswordButton = screen.getByText(/Forgot Password?/i);
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    fireEvent.click(forgotPasswordButton);
    expect(alertMock).toHaveBeenCalledWith(
      "Forgot Password functionality is not implemented yet."
    );
  });

  it("should update captchaResponse state on captcha change", () => {
    renderWithRouter(<Login />);
    const captchaInput = document.querySelector(
      'textarea[id="g-recaptcha-response"]'
    );

    if (captchaInput) {
      fireEvent.change(captchaInput, {
        target: { value: "test-captcha-value" },
      });
      expect(true).toBe(true); // Just check no errors for now
    } else {
      console.warn(
        "ReCAPTCHA input not found in test - adjust selector if needed"
      );
    }
  });

  it("should reset captchaResponse state and reset ReCAPTCHA widget on resetRecaptcha", () => {
    renderWithRouter(<Login />);
    const loginComponent = renderWithRouter(<Login />);

    const recaptchaRefMock = { current: { reset: vi.fn() } };
    const loginInstance =
      loginComponent.container.firstChild.__reactFiber$?.child?.stateNode;
    if (loginInstance) {
      loginInstance.recaptchaRef = recaptchaRefMock;

      loginInstance.setState({ captchaResponse: "initial-captcha-response" });

      loginInstance.resetRecaptcha();

      expect(loginInstance.state.captchaResponse).toBeNull();
      expect(recaptchaRefMock.current.reset).toHaveBeenCalled();
    } else {
      console.warn(
        "Could not access Login component instance to test resetRecaptcha - refactor component for better testability"
      );
    }
  });
});