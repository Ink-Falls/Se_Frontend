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

  // Click the submit button without entering an email
  fireEvent.click(screen.getByRole("button", { name: /send magic link/i }));

  // Debug the DOM to inspect the rendered output
  screen.debug();

  // Check for validation error
  await waitFor(() => {
    expect(
      screen.getByText((content) => content.includes("Email is required"))
    ).toBeInTheDocument();
  });
});

  it("shows an error for an invalid email", async () => {
    render(<MagicLinkLogin />);

    // Enter an invalid email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "invalid-email" },
    });

    // Click the submit button
    fireEvent.click(screen.getByRole("button", { name: /send magic link/i }));

    // Check for validation error
    expect(
      await screen.findByText(/please enter a valid email address/i)
    ).toBeInTheDocument();
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

    // Wait for the success message to appear
    await waitFor(() => {
      expect(
        screen.getByText(/we've sent a magic link to test@example.com/i)
      ).toBeInTheDocument();
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

    // Wait for the error message to appear
    await waitFor(() => {
      expect(
        screen.getByText(/failed to send magic link. please try again./i)
      ).toBeInTheDocument();
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
    // await waitFor(() => {
    //   expect(
    //     screen.getByText(/we've sent a magic link to test@example.com/i)
    //   ).toBeInTheDocument();
    // });

    // Click the "Back" button
    fireEvent.click(screen.getByRole("button", { name: /back/i }));

    // Check if the form is displayed again
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
});