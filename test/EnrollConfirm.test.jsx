// EnrollmentConfirm.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EnrollConfirm from "../src/components/EnrollConfirm.jsx"; // Adjust path if necessary
import { BrowserRouter, useNavigate } from "react-router-dom";

// **Modified mock to partially mock react-router-dom**
vi.mock("react-router-dom", async (importOriginal) => {
  const actualReactRouterDom = await importOriginal(); // Import the original module
  return {
    ...actualReactRouterDom, // Spread all original exports
    useNavigate: vi.fn(), // Override or add mocks for specific exports
  };
});

describe("EnrollConfirm Component", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the success message and buttons with correct text", () => {
    render(
      <BrowserRouter>
        <EnrollConfirm />
      </BrowserRouter>
    );
    expect(screen.getByText("Successful Enrollment!")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Please wait for the verification email, or periodically check your enrollment status directly on the enrollment page."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Log In/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Back to Login/i })
    ).toBeInTheDocument();
  });

  it('should navigate to "/Login" when "Log In" button is clicked in header', () => {
    render(
      <BrowserRouter>
        <EnrollConfirm />
      </BrowserRouter>
    );
    const loginHeaderButton = screen.getByRole("button", { name: /Log In/i });
    fireEvent.click(loginHeaderButton);
    expect(mockNavigate).toHaveBeenCalledWith("/Login");
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate to "/Login" when "Back to Login" button is clicked in main content', () => {
    render(
      <BrowserRouter>
        <EnrollConfirm />
      </BrowserRouter>
    );
    const backToLoginButton = screen.getByRole("button", {
      name: /Back to Login/i,
    });
    fireEvent.click(backToLoginButton);
    expect(mockNavigate).toHaveBeenCalledWith("/Login");
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it("should render the logo image", () => {
    render(
      <BrowserRouter>
        <EnrollConfirm />
      </BrowserRouter>
    );
    const logoImage = screen.getByRole("img", { name: /ARALKADEMY Logo/i });
    expect(logoImage).toBeInTheDocument();
    // expect(logoImage).toHaveAttribute('src', expect.stringContaining('ARALKADEMYLOGO.png'));
  });

  it("should have some key CSS classes applied (basic styling check)", () => {
    const { container } = render(
      <BrowserRouter>
        <EnrollConfirm />
      </BrowserRouter>
    );

    const header = screen.getByRole("banner");
    // Instead of getByRole('main'), let's select the main content div by traversing the DOM:
    const mainContentDiv = container.firstChild.children[1]; // Access the second child of the outermost div

    expect(header).toHaveClass(
      "bg-[#121212]",
      "text-[#F6BA18]",
      "flex",
      "justify-between",
      "items-center",
      "shadow-xl"
    );
    expect(container.firstChild).toHaveClass(
      "min-h-screen",
      "bg-cover",
      "bg-center"
    ); // Check for background image container (outermost div)
    expect(mainContentDiv.firstChild).toHaveClass(
      "bg-white",
      "rounded-lg",
      "shadow-2xl",
      "relative"
    ); // Success message box (first child of mainContentDiv)
  });
});
