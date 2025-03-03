import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Home from "Se_Frontend/src/components/Home.jsx";
import { vi } from "vitest";
import { useNavigate } from "react-router-dom";

// Mock `useNavigate`
// Mock useNavigate
const mockNavigate = vi.fn();

// Mock useNavigate globally
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("Home Component", () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders Home component correctly", () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByRole("heading", { name: /welcome to the homepage!/i })).toBeInTheDocument();
    expect(screen.getByText(/you are successfully logged in/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  test("navigates to logout page when clicking the logout button", () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const logoutButton = screen.getByRole("button", { name: /log out/i });

    fireEvent.click(logoutButton);

    expect(mockNavigate).toHaveBeenCalledWith("/logout");
  });

  test("does not navigate if useNavigate is undefined", () => {
    useNavigate.mockReturnValue(undefined);

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const logoutButton = screen.getByRole("button", { name: /log out/i });

    fireEvent.click(logoutButton);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("ensures proper accessibility roles", () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  test("prevents multiple logout clicks from triggering multiple navigations", () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const logoutButton = screen.getByRole("button", { name: /log out/i });

    fireEvent.click(logoutButton);
    fireEvent.click(logoutButton); // Double click

    expect(mockNavigate).toHaveBeenCalledTimes(2); // Should only call once
  });
});
