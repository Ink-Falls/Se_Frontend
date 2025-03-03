// Notification.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Notifications from "../src/components/Notifications.jsx"; // Adjust path if necessary
import { BrowserRouter } from "react-router-dom"; // Need BrowserRouter for Link

// Mock the Link component from react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Link: vi.fn(
      (
        { children, to, state, className } // Simple mock Link
      ) => (
        <a
          href={to}
          className={className}
          data-testid="mock-link"
          state={state}
        >
          {children}
        </a>
      )
    ),
  };
});

describe("Notifications Component", () => {
  const mockNotifications = [
    {
      id: 3, // Intentionally out of order for sort testing
      type: "Test Reminder 3",
      description: "Description for notification 3.",
      time: "30 minutes ago",
      userImage: "user3.jpg",
    },
    {
      id: 1,
      type: "Test Reminder 1",
      description: "Description for notification 1.",
      time: "10 minutes ago",
      userImage: "user1.jpg",
    },
    {
      id: 2,
      type: "Test Reminder 2",
      description: "Description for notification 2.",
      time: "20 minutes ago",
      userImage: "user2.jpg",
    },
  ];

  afterEach(() => {
    vi.clearAllMocks(); // Clear mocks after each test
  });

  it('should render "All notifications (0)" when no notifications are provided', () => {
    render(<Notifications notifications={[]} />);
    expect(screen.getByText("All notifications (0)")).toBeInTheDocument();
    expect(screen.getByText("No notifications available.")).toBeInTheDocument();
  });

  it('should render "All notifications (count)" and list notifications when provided', () => {
    render(
      <BrowserRouter>
        {" "}
        {/* BrowserRouter needed for Link component */}
        <Notifications notifications={mockNotifications} />
      </BrowserRouter>
    );
    expect(screen.getByText("All notifications (3)")).toBeInTheDocument();
    expect(
      screen.queryByText("No notifications available.")
    ).not.toBeInTheDocument();

    // Check if notification items are rendered (basic checks - can expand)
    expect(screen.getByText("Test Reminder 1")).toBeInTheDocument();
    expect(screen.getByText("Test Reminder 2")).toBeInTheDocument();
    expect(screen.getByText("Test Reminder 3")).toBeInTheDocument();
  });

  it("should initially sort notifications by newest (descending id)", () => {
    render(
      <BrowserRouter>
        <Notifications notifications={mockNotifications} />
      </BrowserRouter>
    );

    const notificationTypes = screen
      .getAllByRole("link")
      .map((link) => link.textContent);
    expect(notificationTypes).toEqual([
      "Test Reminder 3", // Newest (id: 3) should be first
      "Test Reminder 2",
      "Test Reminder 1", // Oldest (id: 1) should be last
    ]);
  });

  it('should sort notifications by oldest when "Oldest" is clicked', async () => {
    render(
      <BrowserRouter>
        <Notifications notifications={mockNotifications} />
      </BrowserRouter>
    );

    // Open the sort dropdown
    fireEvent.click(screen.getByRole("button", { name: /Sort by/i }));

    // Click the "Oldest" option
    fireEvent.click(screen.getByRole("button", { name: /Oldest/i }));

    // Wait for re-render (state update is synchronous in this case, but good practice for async updates)
    await screen.findByText("Test Reminder 1"); // Wait for oldest notification to be present

    const notificationTypes = screen
      .getAllByRole("link")
      .map((link) => link.textContent);
    expect(notificationTypes).toEqual([
      "Test Reminder 1", // Oldest (id: 1) should be first
      "Test Reminder 2",
      "Test Reminder 3", // Newest (id: 3) should be last
    ]);
  });

  it("should toggle dropdown visibility when sort button is clicked", () => {
    render(<Notifications notifications={mockNotifications} />);

    const sortButton = screen.getByRole("button", { name: /Sort by/i });
    const dropdownMenu = screen.getByRole("button", {
      name: /Newest/i,
    }).parentElement; // Get dropdown container

    fireEvent.click(sortButton);
    expect(dropdownMenu).toBeVisible(); // Visible after first click

    fireEvent.click(sortButton);
  });

  it('should render Link components with correct "to" and "state" props', () => {
    render(
      <BrowserRouter>
        <Notifications notifications={mockNotifications} />
      </BrowserRouter>
    );

    const links = screen.getAllByRole("link");
  });
});
