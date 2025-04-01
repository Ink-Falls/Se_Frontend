import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import StudentCodeGenerator from "../../../src/pages/Teacher/StudentCodeGenerator";

// Mock the imported components
vi.mock("../../../src/pages/Teacher/NumericCodeGenerator", () => ({
  default: () => <div data-testid="numeric-code-generator">NumericCodeGenerator Component</div>,
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

describe("StudentCodeGenerator Component", () => {
  it("renders the component correctly", () => {
    render(
      <MemoryRouter>
        <StudentCodeGenerator />
      </MemoryRouter>
    );

    // Check if the Sidebar is rendered
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();

    // Check if the Header is rendered
    expect(screen.getByTestId("header")).toBeInTheDocument();

    // Check if the MobileNavBar is rendered
    expect(screen.getByTestId("mobile-navbar")).toBeInTheDocument();

    // Check if the NumericCodeGenerator component is rendered
    expect(screen.getByTestId("numeric-code-generator")).toBeInTheDocument();

    // Check if the page title is displayed
    expect(
      screen.getByRole("heading", { name: /student login code generator/i })
    ).toBeInTheDocument();

    // Check if the instructions are displayed
    expect(
      screen.getByText(/generate login codes for students in grades 4-6/i)
    ).toBeInTheDocument();

    // Check if the instructions list is displayed
    expect(
      screen.getByText(/generate a code for the student using their email address/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/share the 6-digit code or qr code with the student/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/direct the student to the login page/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/the student can enter the code or scan the qr code to log in/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/codes expire after 15 minutes for security/i)
    ).toBeInTheDocument();
  });
});