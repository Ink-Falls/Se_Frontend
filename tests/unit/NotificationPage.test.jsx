import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import NotificationPage from "Se_Frontend/src/components/Home.jsx";
import { useNavigate, useLocation } from "react-router-dom";


const mockNavigate = vi.fn();

// Mock useNavigate globally
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: () => ({ id: "123" }),
     useLocation: vi.fn(),
  };
});
describe("NotificationPage Component", () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders NotificationPage correctly with notification data", () => {
    useLocation.mockReturnValue({
      state: {
        notification: {
          userImage: "https://example.com/avatar.jpg",
          type: "Assignment Submission",
          time: "2 hours ago",
          description: "A student submitted an assignment.",
        },
      },
    });

    render(
      <BrowserRouter>
        <NotificationPage />
      </BrowserRouter>
    );

    // Check Sidebar and Header exist
    expect(screen.getByText(/Courses/i)).toBeInTheDocument();
    
    expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Notification/i })).toBeInTheDocument();

    // Check notification content
    expect(screen.getByText(/Assignment Submission/i)).toBeInTheDocument();
    expect(screen.getByText(/Learner’s Name/i)).toBeInTheDocument();
    expect(screen.getByText(/2 hours ago/i)).toBeInTheDocument();
    expect(screen.getByText(/A student submitted an assignment./i)).toBeInTheDocument();

    // Check image
    const userImage = screen.getByRole("img", { name: /User Avatar/i });
    expect(userImage).toBeInTheDocument();
    expect(userImage).toHaveAttribute("src", "https://example.com/avatar.jpg");

    // Check buttons
    expect(screen.getByRole("button", { name: /↩ Back/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Go to submission/i })).toBeInTheDocument();
  });

  test("navigates to /TeacherNotification when clicking Back button", () => {
    useLocation.mockReturnValue({
      state: {
        notification: {
          userImage: "https://example.com/avatar.jpg",
          type: "Assignment Submission",
          time: "2 hours ago",
          description: "A student submitted an assignment.",
        },
      },
    });

    render(
      <BrowserRouter>
        <NotificationPage />
      </BrowserRouter>
    );

    const backButton = screen.getByRole("button", { name: /↩ Back/i });

    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/TeacherNotification");
  });

  test("shows error message if notification data is missing", () => {
    useLocation.mockReturnValue({
      state: null, // No notification data
    });

    render(
      <BrowserRouter>
        <NotificationPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Notification not found./i)).toBeInTheDocument();

    const goBackButton = screen.getByRole("button", { name: /Go Back/i });
    expect(goBackButton).toBeInTheDocument();

    // Click Go Back should navigate
    fireEvent.click(goBackButton);
    expect(mockNavigate).toHaveBeenCalledWith("/TeacherNotification");
  });

  test("does not break if notification type, description, or image are missing", () => {
    useLocation.mockReturnValue({
      state: {
        notification: {
          type: null,
          time: "Just now",
          description: null,
          userImage: null, // Missing Image
        },
      },
    });

    render(
      <BrowserRouter>
        <NotificationPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Learner’s Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Just now/i)).toBeInTheDocument();

    // Check image fallback
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  test("handles Go to submission button click (future expansion)", () => {
    useLocation.mockReturnValue({
      state: {
        notification: {
          userImage: "https://example.com/avatar.jpg",
          type: "Assignment Submission",
          time: "2 hours ago",
          description: "A student submitted an assignment.",
        },
      },
    });

    render(
      <BrowserRouter>
        <NotificationPage />
      </BrowserRouter>
    );

    const submissionButton = screen.getByRole("button", { name: /Go to submission/i });

    fireEvent.click(submissionButton);

    // Modify this test once the action is implemented
    // expect(mockNavigate).toHaveBeenCalledWith("/submission-page");
  });
});
