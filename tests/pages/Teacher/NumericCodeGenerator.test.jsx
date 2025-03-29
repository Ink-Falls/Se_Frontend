import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NumericCodeGenerator from "../../../src/pages/Teacher/NumericCodeGenerator";
import { requestNumericCode } from "../../../src/services/authService";

// Mock the `requestNumericCode` API
vi.mock("../../../src/services/authService", () => ({
  requestNumericCode: vi.fn(),
}));

describe("NumericCodeGenerator Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component correctly", () => {
    render(<NumericCodeGenerator />);

    // Check if the title and description are rendered
    expect(
      screen.getByText("Generate Student Login Code")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Generate a 6-digit code for student login")
    ).toBeInTheDocument();

    // Check if the email input and submit button are rendered
    expect(screen.getByLabelText("Student Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate Code" })).toBeInTheDocument();
  });

  it("validates the email input", async () => {
    render(<NumericCodeGenerator />);
  
    // Click the submit button without entering an email
    fireEvent.click(screen.getByRole("button", { name: "Generate Code" }));
  
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText("Student email is required")).toBeInTheDocument();
    });
  
    // Enter an invalid email and submit
    fireEvent.change(screen.getByLabelText("Student Email"), {
      target: { value: "invalid-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate Code" }));
  
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    });
  });

  it("handles successful code generation", async () => {
    // Mock the API response
    requestNumericCode.mockResolvedValue({
      code: "123456",
      qrCodeUrl: "https://example.com/qrcode",
    });

    render(<NumericCodeGenerator />);

    // Enter a valid email and submit
    fireEvent.change(screen.getByLabelText("Student Email"), {
      target: { value: "student@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate Code" }));

    // Check if the loading state is displayed
    expect(screen.getByText("Generating...")).toBeInTheDocument();

    // Wait for the API response and check if the code and QR code are displayed
    await waitFor(() => {
      expect(screen.getByText("Login Code:")).toBeInTheDocument();
      expect(screen.getByText("123456")).toBeInTheDocument();
      expect(screen.getByText("This code will expire in 15 minutes")).toBeInTheDocument();
      expect(screen.getByText("Student: student@example.com")).toBeInTheDocument();
    });

    // Check if the QR code is rendered
    expect(screen.getByRole("img", { name: /qr code/i })).toBeInTheDocument();
  });

  it("handles errors during code generation", async () => {
    // Mock the API to throw an error
    requestNumericCode.mockRejectedValue(new Error("Failed to generate code"));

    render(<NumericCodeGenerator />);

    // Enter a valid email and submit
    fireEvent.change(screen.getByLabelText("Student Email"), {
      target: { value: "student@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate Code" }));

    // Wait for the error message
    await waitFor(() => {
      expect(
        screen.getByText("Failed to generate code. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("resets the form to generate a new code", async () => {
    // Mock the API response
    requestNumericCode.mockResolvedValue({
      code: "123456",
      qrCodeUrl: "https://example.com/qrcode",
    });

    render(<NumericCodeGenerator />);

    // Enter a valid email and submit
    fireEvent.change(screen.getByLabelText("Student Email"), {
      target: { value: "student@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate Code" }));

    // Wait for the API response
    await waitFor(() => {
      expect(screen.getByText("Login Code:")).toBeInTheDocument();
    });

    // Click the "Generate Another Code" button
    fireEvent.click(screen.getByRole("button", { name: "Generate Another Code" }));

    // Check if the form is reset
    expect(screen.getByLabelText("Student Email")).toHaveValue("student@example.com");
    expect(screen.getByRole("button", { name: "Generate Code" })).toBeInTheDocument();
  });
});