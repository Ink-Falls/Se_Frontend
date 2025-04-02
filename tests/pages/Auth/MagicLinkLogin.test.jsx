import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MagicLinkLogin from "../../../src/pages/Auth/MagicLinkLogin";
import { requestMagicLink } from "../../../src/services/authService";

// Mock the requestMagicLink function
vi.mock("../../../src/services/authService", () => ({
  requestMagicLink: vi.fn(),
}));

describe("MagicLinkLogin Component", () => {
  it("renders the form correctly", () => {
    render(<MagicLinkLogin />);

    // Check if the email input is rendered
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    // Check if the submit button is rendered
    expect(
      screen.getByRole("button", { name: /send magic link/i })
    ).toBeInTheDocument();
  });

  it("shows an error when the email is empty", async () => {
    render(<MagicLinkLogin />);

    // Get the email input and set it to empty explicitly
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: "" } });

    // Get the form and submit it directly to bypass HTML5 validation
    const form = emailInput.closest("form");
    fireEvent.submit(form);

    // Check for validation error using data-testid
    await waitFor(() => {
      const errorElement = screen.getByTestId("error-message");
      expect(errorElement).toBeInTheDocument();
      expect(errorElement.textContent).toBe("Email is required");
    });
  });

  it("shows an error for an invalid email", async () => {
    render(<MagicLinkLogin />);

    // Enter an invalid email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "invalid-email" },
    });

    // Get the form and submit it directly to bypass HTML5 validation
    const form = screen.getByLabelText(/email/i).closest("form");
    fireEvent.submit(form);

    // Check for validation error using data-testid
    await waitFor(() => {
      const errorElement = screen.getByTestId("error-message");
      expect(errorElement).toBeInTheDocument();
      expect(errorElement.textContent).toBe("Please enter a valid email address");
    });
  });

  it("submits the form and shows success message on valid email", async () => {
    // Mock the requestMagicLink function to resolve successfully
    requestMagicLink.mockResolvedValueOnce();

    render(<MagicLinkLogin />);

    // Enter a valid email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });

    // Click the submit button
    fireEvent.click(screen.getByRole("button", { name: /send magic link/i }));

    // Wait for the success message to appear using a more flexible matcher
    await waitFor(() => {
      expect(screen.getByText("Check your email")).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes("test@example.com"))).toBeInTheDocument();
    });
  });

  it("shows an error message when the request fails", async () => {
    // Mock the requestMagicLink function to reject with an error
    requestMagicLink.mockRejectedValueOnce(new Error("Request failed"));

    render(<MagicLinkLogin />);

    // Enter a valid email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });

    // Click the submit button
    fireEvent.click(screen.getByRole("button", { name: /send magic link/i }));

    // Wait for the error message to appear (looking for the actual text)
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
      expect(screen.getByTestId("error-message").textContent).toBe("Request failed");
    });
  });

  it("allows the user to go back after success", async () => {
    // Mock the requestMagicLink function to resolve successfully
    requestMagicLink.mockResolvedValueOnce();

    render(<MagicLinkLogin />);

    // Enter a valid email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });

    // Click the submit button
    fireEvent.click(screen.getByRole("button", { name: /send magic link/i }));

    // Wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByText("Check your email")).toBeInTheDocument();
    });

    // Click the "Back" button by exact text content
    fireEvent.click(screen.getByText("Back"));

    // Check if the form is displayed again
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
});