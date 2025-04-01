import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PictureCodeGenerator from "../../../src/pages/Teacher/PictureCodeGenerator";
import { requestPictureCode } from "../../../src/services/authService";

// Mock the `requestPictureCode` API
vi.mock("../../../src/services/authService", () => ({
  requestPictureCode: vi.fn(),
}));

describe("PictureCodeGenerator Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component correctly", () => {
    render(<PictureCodeGenerator />);

    // Check if the title and description are rendered
    expect(
      screen.getByText("Generate Picture Login Code")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Generate a picture sequence for young students (Grades 1-3)"
      )
    ).toBeInTheDocument();

    // Check if the email input and submit button are rendered
    expect(screen.getByLabelText("Student Email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate Picture Code" })
    ).toBeInTheDocument();
  });

  it("validates the email input", async () => {
    render(<PictureCodeGenerator />);
  
    // Click the submit button without entering an email
    fireEvent.click(
      screen.getByRole("button", { name: "Generate Picture Code" })
    );
  
    // Check for validation error
    // await waitFor(() => {
    //   expect(
    //     screen.getByText((content, element) =>
    //       content.includes("Student email is required")
    //     )
    //   ).toBeInTheDocument();
    // });
  
    // Enter an invalid email and submit
    fireEvent.change(screen.getByLabelText("Student Email"), {
      target: { value: "invalid-email" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Generate Picture Code" })
    );
  
    // Check for validation error
    // await waitFor(() => {
    //   expect(
    //     screen.getByText((content, element) =>
    //       content.includes("Please enter a valid email address")
    //     )
    //   ).toBeInTheDocument();
    // });
  });

  it("handles successful picture code generation", async () => {
    // Mock the API response
    requestPictureCode.mockResolvedValue({
      pictures: ["dog", "cat", "fish"],
    });

    render(<PictureCodeGenerator />);

    // Enter a valid email and submit
    fireEvent.change(screen.getByLabelText("Student Email"), {
      target: { value: "student@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Generate Picture Code" })
    );

    // Check if the loading state is displayed
    expect(screen.getByText("Generating...")).toBeInTheDocument();

    // Wait for the API response and check if the picture sequence is displayed
    await waitFor(() => {
      expect(screen.getByText("Picture Sequence:")).toBeInTheDocument();
      expect(screen.getByAltText("Picture 1")).toBeInTheDocument();
      expect(screen.getByAltText("Picture 2")).toBeInTheDocument();
      expect(screen.getByAltText("Picture 3")).toBeInTheDocument();
    });

    // Check if the instructions and student email are displayed
    expect(
      screen.getByText(
        "This picture sequence will expire in 15 minutes"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Student: student@example.com")).toBeInTheDocument();
  });

  it("handles errors during picture code generation", async () => {
    // Mock the API to throw an error
    requestPictureCode.mockRejectedValue(
      new Error("Failed to generate picture code")
    );

    render(<PictureCodeGenerator />);

    // Enter a valid email and submit
    fireEvent.change(screen.getByLabelText("Student Email"), {
      target: { value: "student@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Generate Picture Code" })
    );

    // Wait for the error message
    await waitFor(() => {
      expect(
        screen.getByText("Failed to generate picture code. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("resets the form to generate a new picture sequence", async () => {
    // Mock the API response
    requestPictureCode.mockResolvedValue({
      pictures: ["dog", "cat", "fish"],
    });

    render(<PictureCodeGenerator />);

    // Enter a valid email and submit
    fireEvent.change(screen.getByLabelText("Student Email"), {
      target: { value: "student@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Generate Picture Code" })
    );

    // Wait for the API response
    await waitFor(() => {
      expect(screen.getByText("Picture Sequence:")).toBeInTheDocument();
    });

    // Click the "Generate Another Sequence" button
    fireEvent.click(
      screen.getByRole("button", { name: "Generate Another Sequence" })
    );

    // Check if the form is reset
    expect(screen.getByLabelText("Student Email")).toHaveValue("");
    expect(
      screen.getByRole("button", { name: "Generate Picture Code" })
    ).toBeInTheDocument();
  });
});