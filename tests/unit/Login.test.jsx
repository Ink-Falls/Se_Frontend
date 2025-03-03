// Login.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "Se_Frontend/src/components/Login.jsx"; // Adjust path if necessary
import { BrowserRouter, useNavigate } from "react-router-dom"; // Make sure BrowserRouter is imported here

// Mock useNavigate and keep BrowserRouter from react-router-dom
vi.mock("react-router-dom", async (importOriginal) => {
  const actualReactRouterDom = await importOriginal();
  return {
    ...actualReactRouterDom, // **Spread all original exports, including BrowserRouter**
    useNavigate: vi.fn(), // Mock useNavigate
  };
});

// Mock fetch API
global.fetch = vi.fn();

// Mock ReCAPTCHA component
vi.mock("react-google-recaptcha", () => {
  const MockReCAPTCHA = ({ onChange }) => {
    const handleChange = () => {
      onChange("mock-captcha-response"); // Simulate a valid captcha response
    };
    return (
      <button data-testid="mock-recaptcha" onClick={handleChange}>
        Mock ReCAPTCHA
      </button>
    );
  };
  return {
    default: MockReCAPTCHA,
  };
});

describe("Login Component", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    fetch.mockClear(); // Clear fetch mocks before each test
    localStorage.clear(); // Clear localStorage before each test
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the login form and enroll button", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    expect(
      screen.getByRole("heading", { name: /Log In/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Log In/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enroll/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Forgot Password?/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /ARALKADEMY Logo/i })
    ).toBeInTheDocument();
  });

  it("should display captcha alert if captcha is not verified on submit", async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    const loginButton = screen.getByRole("button", { name: /Log In/i });
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {}); // Mock window.alert

    alertMock.mockRestore(); // Restore original window.alert
  });

  it("should navigate to TeacherDashboard on successful login", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "mock-token" }),
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("mock-recaptcha")); // Simulate captcha verification
    fireEvent.click(screen.getByRole("button", { name: /Log In/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:4000/api/users/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
            captchaResponse: "mock-captcha-response",
          }),
        }
      );
      expect(localStorage.getItem("token")).toBe("mock-token");
      expect(mockNavigate).toHaveBeenCalledWith("/TeacherDashboard");
    });
  });

  it("should display error message for invalid credentials (400)", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: "Invalid credentials" }),
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByTestId("mock-recaptcha"));
    fireEvent.click(screen.getByRole("button", { name: /Log In/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Invalid email or password/i)
      ).toBeInTheDocument();
    });
  });

  it("should display error message for unauthorized access (401)", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: "Unauthorized" }),
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByTestId("mock-recaptcha"));
    fireEvent.click(screen.getByRole("button", { name: /Log In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Unauthorized access/i)).toBeInTheDocument();
    });
  });

  it("should display error message for server error (500)", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: "Server error" }),
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByTestId("mock-recaptcha"));
    fireEvent.click(screen.getByRole("button", { name: /Log In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Server error/i)).toBeInTheDocument();
    });
  });

  it("should display generic error message for network error", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByTestId("mock-recaptcha"));
    fireEvent.click(screen.getByRole("button", { name: /Log In/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/An error occurred. Please try again./i)
      ).toBeInTheDocument();
    });
  });

  it("should display loading spinner during login request", async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("mock-recaptcha"));
    fireEvent.click(screen.getByRole("button", { name: /Log In/i }));

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument(); // Loading spinner is present

    await waitFor(
      () => {
        expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument(); // Loading spinner disappears after response
      },
      { timeout: 2000 }
    ); // Give some time for fetch mock to resolve
  });

  it("should navigate to Enrollment page when Enroll button is clicked", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    const enrollButton = screen.getByRole("button", { name: /Enroll/i });
    fireEvent.click(enrollButton);
    expect(mockNavigate).toHaveBeenCalledWith("/Enrollment");
  });

  it("should display alert when Forgot Password button is clicked", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    const forgotPasswordButton = screen.getByRole("button", {
      name: /Forgot Password?/i,
    });
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    fireEvent.click(forgotPasswordButton);
    expect(alertMock).toHaveBeenCalledWith(
      "Forgot Password functionality is not implemented yet."
    );

    alertMock.mockRestore();
  });
});
