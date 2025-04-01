import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PictureCodeGeneratorPage from "../../../src/pages/Teacher/PictureCodeGeneratorPage";

// Mock the imported components
vi.mock("../../../src/pages/Teacher/PictureCodeGenerator", () => ({
  default: () => <div data-testid="picture-code-generator">PictureCodeGenerator Component</div>,
}));
vi.mock("../../../src/components/common/layout/Sidebar", () => ({
  default: () => <div data-testid="sidebar">Sidebar Component</div>,
}));
vi.mock("../../../src/components/common/layout/Header", () => ({
  default: () => <div data-testid="header">Header Component</div>,
}));
vi.mock("../../../src/components/common/layout/MobileNavbar", () => ({
  default: () => <div data-testid="mobile-navbar">MobileNavBar Component</div>,
}));

describe("PictureCodeGeneratorPage", () => {
  it("renders the page correctly", () => {
    render(<PictureCodeGeneratorPage />);

    // Check if the Sidebar is rendered
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();

    // Check if the Header is rendered
    expect(screen.getByTestId("header")).toBeInTheDocument();

    // Check if the MobileNavBar is rendered
    expect(screen.getByTestId("mobile-navbar")).toBeInTheDocument();

    // Check if the PictureCodeGenerator component is rendered
    expect(screen.getByTestId("picture-code-generator")).toBeInTheDocument();

    // Check if the page title is displayed
    expect(
      screen.getByRole("heading", { name: /picture code generator/i })
    ).toBeInTheDocument();

    // Check if the instructions are displayed
    expect(
      screen.getByText(/instructions for student picture login:/i)
    ).toBeInTheDocument();

    // Check if the instructions list is displayed
    expect(
      screen.getByText(/generate a picture sequence for the student/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/show the picture sequence to the student/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/direct the student to the login page/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/the student can select the pictures in the correct order/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/picture sequences expire after 15 minutes/i)
    ).toBeInTheDocument();
  });
});