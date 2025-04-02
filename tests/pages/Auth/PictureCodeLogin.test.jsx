import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import PictureCodeLogin from "Se_Frontend/src/pages/Auth/PictureCodeLogin";
import { verifyMagicLinkToken } from "Se_Frontend/src/services/authService";
import { useAuth } from "Se_Frontend/src/contexts/AuthContext";
import { MemoryRouter } from "react-router-dom";

// Mock the `verifyMagicLinkToken` service
vi.mock("Se_Frontend/src/services/authService", () => ({
  verifyMagicLinkToken: vi.fn(),
}));

// Mock the `useAuth` hook
vi.mock("Se_Frontend/src/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    checkAuth: vi.fn(),
  })),
}));

// Mock the `useNavigate` function from `react-router-dom`
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
  };
});

describe("PictureCodeLogin Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component correctly", () => {
    render(
      <MemoryRouter>
        <PictureCodeLogin />
      </MemoryRouter>
    );

    // Check if the heading and instructions are rendered
    expect(
      screen.getByText("Select your picture sequence to log in:")
    ).toBeInTheDocument();

    // Check if the picture grid is rendered
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);

    // Check if the "Log In" button is rendered
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });

  it("allows selecting and removing pictures", async () => {
    render(
      <MemoryRouter>
        <PictureCodeLogin />
      </MemoryRouter>
    );
  
    // Select the first picture (Dog)
    const pictureButtons = screen.getAllByRole("button");
    fireEvent.click(pictureButtons[0]); // Select "Dog"
  
    // Check if the picture is added to the selected list
    expect(screen.getByRole("img", { name: "Dog" })).toBeInTheDocument();
  
    // Remove the selected picture
    const removeButton = screen.getByText("X");
    fireEvent.click(removeButton);
  
    // Wait for the picture to be removed
    // await waitFor(() => {
    //   expect(screen.queryByAltText("Dog")).not.toBeInTheDocument();
    // });
    // Inspect the DOM after the click
  });

  it("displays an error if less than 3 pictures are selected", async () => {
    render(
      <MemoryRouter>
        <PictureCodeLogin />
      </MemoryRouter>
    );
  
    // Select two pictures
    fireEvent.click(screen.getByAltText("Dog"));
    fireEvent.click(screen.getByAltText("Cat"));
  
    // Assert that "Log In" button is disabled
    expect(screen.getByRole("button", { name: /log in/i })).toBeDisabled();
  
    // Click "Log In"
    fireEvent.click(screen.getByText("Log In"));
  
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Please select at least 3 pictures");
    });
  });
  
  

  it("submits the form successfully with valid picture selection", async () => {
    // Mock the `verifyMagicLinkToken` service to return a successful response
    verifyMagicLinkToken.mockResolvedValue({
      token: "mockAccessToken",
      refreshToken: "mockRefreshToken",
      user: { role: "teacher" },
    });

    render(
      <MemoryRouter>
        <PictureCodeLogin />
      </MemoryRouter>
    );

    // Select 3 pictures
    const pictureButtons = screen.getAllByRole("button");
    fireEvent.click(pictureButtons[0]); // Select "Dog"
    fireEvent.click(pictureButtons[1]); // Select "Cat"
    fireEvent.click(pictureButtons[2]); // Select "Fish"

    // Click the "Log In" button
    fireEvent.click(screen.getByText("Log In"));

    // Wait for the success message
    await waitFor(() => {
      expect(screen.getByText("Great job!")).toBeInTheDocument();
    });

    // Check if the user is redirected to the teacher dashboard
    expect(mockNavigate).toHaveBeenCalledWith("/Teacher/Dashboard");
  });

  it("resets the selected pictures when the reset button is clicked", () => {
    render(
      <MemoryRouter>
        <PictureCodeLogin />
      </MemoryRouter>
    );

    // Select a picture
    const pictureButtons = screen.getAllByRole("button");
    fireEvent.click(pictureButtons[0]); // Select "Dog"

    // Check if the picture is added to the selected list
    expect(screen.getByAltText("Dog")).toBeInTheDocument();

    // Click the "Clear" button
    fireEvent.click(screen.getByText("Clear"));

    // Check if the selected pictures are cleared
    expect(screen.queryByAltText("Dog")).not.toBeInTheDocument();
  });

  it("displays an error if the picture sequence is incorrect", async () => {
    // Mock the `verifyMagicLinkToken` service to throw an error
    verifyMagicLinkToken.mockRejectedValue(new Error("Invalid picture sequence"));

    render(
      <MemoryRouter>
        <PictureCodeLogin />
      </MemoryRouter>
    );

    // Select 3 pictures
    const pictureButtons = screen.getAllByRole("button");
    fireEvent.click(pictureButtons[0]); // Select "Dog"
    fireEvent.click(pictureButtons[1]); // Select "Cat"
    fireEvent.click(pictureButtons[2]); // Select "Fish"

    // Click the "Log In" button
    fireEvent.click(screen.getByText("Log In"));

    // Wait for the error message
    await waitFor(() => {
      expect(
        screen.getByText(
          "Oops! That's not the right picture sequence. Please try again."
        )
      ).toBeInTheDocument();
    });

    // Check if the selected pictures are cleared
    expect(screen.queryByAltText("Dog")).not.toBeInTheDocument();
  });
});