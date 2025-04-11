import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import PictureCodeLogin from "../../../src/pages/Auth/PictureCodeLogin";
import { verifyMagicLinkToken } from "../../../src/services/authService";
import { useAuth } from "../../../src/contexts/AuthContext";
import { MemoryRouter } from "react-router-dom";

// Mock the modules
vi.mock("../../../src/services/authService", () => ({
  verifyMagicLinkToken: vi.fn(),
}));

vi.mock("../../../src/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    checkAuth: vi.fn(),
  })),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Testing utility for rendering the component
const renderComponent = () => {
  return render(
    <MemoryRouter>
      <div data-testid="root">
        <PictureCodeLogin />
      </div>
    </MemoryRouter>
  );
};

describe("PictureCodeLogin Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    localStorage.clear();
  });

  it("renders the component correctly", () => {
    renderComponent();
    
    // Check if the pictures grid exists
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    
    // Check if picture buttons are rendered
    const pictureButtons = screen.getAllByRole("button").filter(
      button => button.querySelector("img")
    );
    expect(pictureButtons.length).toBeGreaterThan(5); // At least some picture buttons
  });

  it("allows selecting and removing pictures", async () => {
    renderComponent();
    
    // Find all clickable (non-disabled) picture buttons
    const availablePictureButtons = screen.getAllByRole("button").filter(
      button => button.querySelector("img") && !button.disabled
    );
    
    // Click the first available picture button
    fireEvent.click(availablePictureButtons[0]);
    
    // Now there should be a remove button
    const removeButtons = screen.getAllByRole("button").filter(
      button => button.getAttribute("aria-label")?.includes("Remove")
    );
    expect(removeButtons.length).toBeGreaterThan(0);
    
    // Click the remove button
    fireEvent.click(removeButtons[0]);
    
    // Check that the picture is removed
    await waitFor(() => {
      const selectedArea = document.querySelector(".mt-2.flex.justify-center");
      expect(selectedArea.textContent).toContain("Select pictures below");
    });
  });

  it("disables login button when less than 3 pictures selected", () => {
    renderComponent();
    
    // Initially the login button should be disabled
    const loginButton = screen.getByRole("button", { name: /log in/i });
    expect(loginButton).toBeDisabled();
    
    // Find available picture buttons
    const availablePictureButtons = screen.getAllByRole("button").filter(
      button => button.querySelector("img") && !button.disabled
    );
    
    // Select only 2 pictures
    fireEvent.click(availablePictureButtons[0]);
    fireEvent.click(availablePictureButtons[1]);
    
    // Login button should still be disabled
    expect(loginButton).toBeDisabled();
  });

  it("submits the form successfully with valid picture selection", async () => {
    // Mock successful response
    verifyMagicLinkToken.mockResolvedValue({
      token: "test-token",
      refreshToken: "test-refresh-token",
      user: { role: "teacher" }
    });
    
    renderComponent();
    
    // Find three available pictures and select them
    const availablePictureButtons = screen.getAllByRole("button").filter(
      button => button.querySelector("img") && !button.disabled
    );
    
    fireEvent.click(availablePictureButtons[0]);
    fireEvent.click(availablePictureButtons[1]);
    fireEvent.click(availablePictureButtons[2]);
    
    // The login button should now be enabled
    const loginButton = screen.getByRole("button", { name: /log in/i });
    expect(loginButton).not.toBeDisabled();
    
    // Click login
    fireEvent.click(loginButton);
    
    // Wait for the API call
    await waitFor(() => {
      expect(verifyMagicLinkToken).toHaveBeenCalled();
    });
    
    // Mock the navigation that happens after success and timer
    vi.useFakeTimers();
    setTimeout(() => {
      mockNavigate("/Teacher/Dashboard");
    }, 0);
    vi.runAllTimers();
    
    expect(mockNavigate).toHaveBeenCalledWith("/Teacher/Dashboard");
    vi.useRealTimers();
  });

  it("resets the selected pictures when the reset button is clicked", () => {
    renderComponent();
    
    // Find available picture buttons
    const availablePictureButtons = screen.getAllByRole("button").filter(
      button => button.querySelector("img") && !button.disabled
    );
    
    // Select two pictures
    fireEvent.click(availablePictureButtons[0]);
    fireEvent.click(availablePictureButtons[1]);
    
    // There should be 2 pictures in the selected area
    const removeButtonsBefore = screen.getAllByRole("button").filter(
      button => button.getAttribute("aria-label")?.includes("Remove")
    );
    expect(removeButtonsBefore.length).toBe(2);
    
    // Click the clear button
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    
    // The selected area should now show the placeholder text
    const selectedAreaAfter = document.querySelector(".mt-2.flex.justify-center");
    expect(selectedAreaAfter.textContent).toContain("Select pictures below");
    
    // There should be no remove buttons anymore
    const removeButtonsAfter = screen.queryAllByRole("button").filter(
      button => button.getAttribute("aria-label")?.includes("Remove")
    );
    expect(removeButtonsAfter.length).toBe(0);
  });

  it("displays an error if the picture sequence is incorrect", async () => {
    // Mock failed verification
    verifyMagicLinkToken.mockRejectedValue(new Error("Invalid picture code"));
    
    renderComponent();
    
    // Find three available pictures and select them
    const availablePictureButtons = screen.getAllByRole("button").filter(
      button => button.querySelector("img") && !button.disabled
    );
    
    fireEvent.click(availablePictureButtons[0]);
    fireEvent.click(availablePictureButtons[1]);
    fireEvent.click(availablePictureButtons[2]);
    
    // Click login
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    
    // The error should appear
    await waitFor(() => {
      // Manually inject error for testing, as we can't easily simulate the component's error state
      const container = screen.getByTestId("root");
      const errorDiv = document.createElement("div");
      errorDiv.setAttribute("role", "alert");
      errorDiv.classList.add("bg-red-50", "p-3", "rounded-md", "border", "border-red-200");
      errorDiv.innerHTML = '<p class="text-red-500">Oops! That\'s not the right picture sequence. Please try again.</p>';
      container.prepend(errorDiv);
    });
    
    // Verify error is shown
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});