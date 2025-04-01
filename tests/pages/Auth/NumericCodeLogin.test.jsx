import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import NumericCodeLogin from "../../../src/pages/Auth/NumericCodeLogin";
import { verifyMagicLinkToken } from "../../../src/services/authService";
import { useAuth } from "../../../src/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Mock dependencies
vi.mock("../../../src/services/authService", () => ({
  verifyMagicLinkToken: vi.fn(),
}));
vi.mock("../../../src/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    checkAuth: vi.fn(),
  })),
}));
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

describe("NumericCodeLogin Component", () => {
  const mockNavigate = vi.fn();
  const mockCheckAuth = vi.fn();

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useAuth).mockReturnValue({ checkAuth: mockCheckAuth });
  });

  it("renders the form correctly", () => {
    render(<NumericCodeLogin />);

    // Check if the input fields are rendered
    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(6);

    // Check if the submit button is rendered
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("shows an error when not all digits are entered", async () => {
    render(<NumericCodeLogin />);

    // Click the submit button without entering all digits
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    // Check for validation error
    expect(
      await screen.findByText(/please enter all 6 digits of the code/i)
    ).toBeInTheDocument();
  });

  it("allows only numeric input in the fields", () => {
    render(<NumericCodeLogin />);

    const inputs = screen.getAllByRole("textbox");

    // Enter a non-numeric value in the first input
    fireEvent.change(inputs[0], { target: { value: "a" } });

    // Check that the input value remains empty
    expect(inputs[0].value).toBe("");

    // Enter a numeric value in the first input
    fireEvent.change(inputs[0], { target: { value: "5" } });

    // Check that the input value is updated
    expect(inputs[0].value).toBe("5");
  });

  it("auto-focuses the next input when a digit is entered", () => {
    render(<NumericCodeLogin />);

    const inputs = screen.getAllByRole("textbox");

    // Enter a digit in the first input
    fireEvent.change(inputs[0], { target: { value: "5" } });

    // Check that the second input is focused
    expect(document.activeElement).toBe(inputs[1]);
  });

  it("moves to the previous input on backspace if the current input is empty", () => {
    render(<NumericCodeLogin />);

    const inputs = screen.getAllByRole("textbox");

    // Focus the second input and press backspace
    inputs[1].focus();
    fireEvent.keyDown(inputs[1], { key: "Backspace" });

    // Check that the first input is focused
    expect(document.activeElement).toBe(inputs[0]);
  });

  it("submits the form and navigates on successful code verification", async () => {
    // Mock the verifyMagicLinkToken function to resolve successfully
    vi.mocked(verifyMagicLinkToken).mockResolvedValueOnce({
      tokens: { accessToken: "mockAccessToken", refreshToken: "mockRefreshToken" },
      user: { role: "teacher" },
    });

    render(<NumericCodeLogin />);

    const inputs = screen.getAllByRole("textbox");

    // Enter a valid 6-digit code
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: `${index + 1}` } });
    });

    // Click the submit button
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    // Wait for navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/Teacher/Dashboard", {
        replace: true,
      });
    });

    // Check that the tokens are stored in localStorage
    expect(localStorage.getItem("accessToken")).toBe("mockAccessToken");
    expect(localStorage.getItem("refreshToken")).toBe("mockRefreshToken");
  });

  it("shows an error message when code verification fails", async () => {
    // Mock the verifyMagicLinkToken function to reject with an error
    vi.mocked(verifyMagicLinkToken).mockRejectedValueOnce(
      new Error("Invalid code")
    );

    render(<NumericCodeLogin />);

    const inputs = screen.getAllByRole("textbox");

    // Enter a valid 6-digit code
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: `${index + 1}` } });
    });

    // Click the submit button
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(
        screen.getByText(/invalid code. please try again./i)
      ).toBeInTheDocument();
    });
  });
});