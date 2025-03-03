// StudentDashboard.test.jsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import StudentDashboard from "../src/components/StudentDashboard"; // Adjust path if necessary
import { vi } from "vitest";

// Mock the components to isolate StudentDashboard testing
vi.mock("../src/components/Sidebar", () => {
  const MockSidebar = ({ children }) => (
    <div data-testid="mock-sidebar">{children}</div>
  );
  MockSidebar.SidebarItem = ({ text }) => (
    <div data-testid={`mock-sidebar-item-${text}`}>{text}</div>
  );
  return {
    // Return an object with a default key
    default: MockSidebar,
    SidebarItem: MockSidebar.SidebarItem, // If Sidebar also exports SidebarItem as a named export
  };
});
vi.mock("../src/components/Header", () => ({
  default: ({ title }) => <div data-testid="mock-header">{title}</div>,
}));
vi.mock("../src/components/UserStats", () => ({
  default: () => <div data-testid="mock-user-stats">UserStats Mock</div>,
}));
vi.mock("../src/components/UserTable", () => ({
  default: () => <div data-testid="mock-user-table">UserTable Mock</div>,
}));
vi.mock("react-router-dom", () => ({
  Outlet: () => <div data-testid="mock-outlet">Outlet Mock</div>, // Mock Outlet
}));

describe("StudentDashboard Component", () => {
  beforeEach(() => {
    global.fetch = vi.fn(); // Mock fetch API before each test
  });

  afterEach(() => {
    vi.clearAllMocks(); // Clear mocks after each test
  });

  it("renders component structure with Sidebar, Header, UserStats, and UserTable", () => {
    render(<StudentDashboard />);
    expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-header")).toHaveTextContent("Users"); // Check Header title prop
    expect(screen.getByTestId("mock-user-stats")).toBeInTheDocument();
    expect(screen.getByTestId("mock-user-table")).toBeInTheDocument();
    expect(screen.getByTestId("mock-outlet")).toBeInTheDocument(); // Check Outlet is rendered
    expect(screen.getByTestId("mock-sidebar-item-Users")).toBeInTheDocument(); // Check SidebarItems
    expect(screen.getByTestId("mock-sidebar-item-Courses")).toBeInTheDocument();
    expect(
      screen.getByTestId("mock-sidebar-item-Notifications")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("mock-sidebar-item-Announcements")
    ).toBeInTheDocument();
  });

  it("fetches user stats from API and passes them to UserStats", async () => {
    const mockUserStatsData = {
      totalUsers: 100,
      totalLearners: 80,
      totalTeachers: 15,
      totalAdmins: 5,
      totalGroups: 10,
    };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserStatsData,
    });

    render(<StudentDashboard />);

    // Wait for fetch to complete and UserStats to potentially update (though mocked, good practice)
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith("/api/userStats");
    });
  });

  it("handles API fetch error for user stats gracefully (no error test)", async () => {
    global.fetch.mockRejectedValueOnce(new Error("API Error"));

    render(<StudentDashboard />);

    // Wait for a short period to allow useEffect to attempt fetch and potentially handle error
    await waitFor(
      () => {
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith("/api/userStats");
        // In a more detailed test, you might assert that some fallback UI is displayed
        // or that the UserStats component receives default/zero values.
      },
      { timeout: 100 }
    ); // Short timeout as we are just checking fetch call, not error UI
  });
});
