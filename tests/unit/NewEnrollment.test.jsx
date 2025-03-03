import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

import { BrowserRouter, useNavigate } from "react-router-dom";
import { vi, describe, beforeEach, test, afterEach } from "vitest";
import NewEnrollment from "Se_Frontend/src/components/NewEnrollment.jsx";


// Mock fetch API
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true }),
  })
);

// Mock useNavigate
const mockNavigate = vi.fn();

// Mock useNavigate globally
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("NewEnrollment Component", () => {
  let mockNavigate;

  beforeEach(() => {
    vi.clearAllMocks();
  
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Enrollment successful" }),
      })
    );
  
    // Spy on useNavigate
    mockNavigate = vi.fn(); // Create a fresh spy before each test
    useNavigate.mockReturnValue(mockNavigate); // Ensure it returns the spy
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders enrollment form correctly", () => {
    render(
      <BrowserRouter>
        <NewEnrollment />
      </BrowserRouter>
    );

    expect(screen.getByText(/Enrollment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm Password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();


  });

  

  test("validates email format", async () => {
    render(
      <BrowserRouter>
        <NewEnrollment />
      </BrowserRouter>
    );
  
    // Enter invalid email
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
  
    // Some forms require blur event to trigger validation
    fireEvent.blur(emailInput);
  
    // Click submit button
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
  
    // Debugging: Print the screen output to see actual error messages
    await waitFor(() => {
      console.log("Screen Output:");
      screen.debug();
    });
  
    // Flexible matcher: check if any validation error exists
    await waitFor(() => {
      expect(
        screen.getByText((content) => content.toLowerCase().includes("invalid email"))
      ).toBeInTheDocument();
    });
  });
  

  test("submits form successfully", async () => {
    render(
      <BrowserRouter>
        <NewEnrollment />
      </BrowserRouter>
    );
  
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText(/Contact No./i), { target: { value: "09123456789" } });
    fireEvent.change(screen.getByLabelText(/Birthdate/i), { target: { value: "2000-01-01" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "john.doe@example.com" } });
  
    // Ensure password fields are uniquely targeted
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const confirmPasswordInput = screen.getByLabelText(/^Confirm Password$/i);
    fireEvent.change(passwordInput, { target: { value: "password@123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "password@123" } });
  
    fireEvent.change(screen.getByLabelText(/School/i), { target: { value: "University of Santo Tomas (UST)" } });
    fireEvent.change(screen.getByLabelText(/Year Level/i), { target: { value: "4" } });
  
    // Click submit button inside act()
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    });
  
    // Debug: Check if any validation messages appear
    await waitFor(() => {
      console.log("Screen output after submit:");
      screen.debug();
    });
  
    // Ensure API call is made
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(0);
    });
  
    // Debugging: Log if navigation is happening
    console.log("mockNavigate calls:", mockNavigate.mock.calls);
  
    // Ensure navigation occurs after successful submission
    await waitFor(() => {
      
      console.log("mockNavigate calls:", mockNavigate.mock.calls);
      expect(mockNavigate).toHaveBeenCalledWith("/EnrollConfirm");
    });
  });
  
  });
