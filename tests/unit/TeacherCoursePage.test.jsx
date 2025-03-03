import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import TeacherCoursePage from "../../src/components/TeacherCoursePage"; // Ensure correct import

vi.mock("./Sidebar", () => ({
    default: () => <div data-testid="sidebar">Mock Sidebar</div>,
  }));
  
  vi.mock("./Header", () => ({
    default: ({ title, subtitle }) => (
      <div>
        <h1>{title}</h1>
        <h2>{subtitle}</h2>
      </div>
    ),
  }));
  
  vi.mock("./BlackHeader", () => ({
    default: ({ title, count, children }) => (
      <div>
        <h3>{title}</h3>
        <span>{count}</span>
        {children}
      </div>
    ),
  }));
  
  vi.mock("./Announcements", () => ({
    default: ({ announcements }) => (
      <ul>
        {announcements.map((ann) => (
          <li key={ann.id}>{ann.type}</li>
        ))}
      </ul>
    ),
  }));
  
  vi.mock("./Modal", () => ({
    default: ({ isOpen, onClose, children }) =>
      isOpen ? (
        <div data-testid="modal">
          {children}
          <button onClick={onClose}>Close</button>
        </div>
      ) : null,
  }));

  
describe("TeacherCoursePage Component", () => {
    test("renders the page with course title and announcements", () => {
        render(
          <BrowserRouter>
            <TeacherCoursePage />
          </BrowserRouter>
        );
        // Check course title and subtitle
        expect(screen.getByText("Course Name")).toBeInTheDocument();
      
        // Ensure at least one "Announcements" text exists
        const announcementHeaders = screen.getAllByText(/Announcements/i);
        expect(announcementHeaders.length).toBeGreaterThan(0);
      
        // Check for specific reminders
        expect(screen.getByText("Test Reminder")).toBeInTheDocument();
        expect(screen.getByText("Project Reminder")).toBeInTheDocument();
        expect(screen.getByText("Tutoring Available")).toBeInTheDocument();
      });
      

  test("toggles sorting order of announcements", () => {
    render(
      <BrowserRouter>
        <TeacherCoursePage />
      </BrowserRouter>
    );

    // Find the Sort Button (Using `title` for better reliability)
    const sortButton = document.querySelector(".hover\\:bg-gray-700");
    fireEvent.click(sortButton);
    

    // Expect the first announcement to change order
    const firstAnnouncement = screen.getAllByText(/Reminder/i)[0];
    expect(firstAnnouncement.textContent).toContain("Test Reminder");
  });

  test("opens and closes the modal", async () => {
    render(
      <BrowserRouter>
        <TeacherCoursePage />
      </BrowserRouter>
    );

    // Find and click the Add Announcement Button
    const addButton = document.querySelector(".hover\\:bg-gray-700");
    fireEvent.click(addButton);

    // Ensure modal opens
    expect(screen.getByPlaceholderText("Enter title")).toBeInTheDocument();

    // Close the modal by clicking "Add"
    const closeButton = screen.getByText("Add").closest("button");
    fireEvent.click(closeButton);

    // Ensure modal is removed (wait for state update)
    await waitFor(() => {
    expect(screen.queryByPlaceholderText("Enter title")).not.toBeInTheDocument();
  });
});

  test("navigates to announcement details when clicked", () => {
    render(
      <BrowserRouter>
        <TeacherCoursePage />
      </BrowserRouter>
    );

    // Simulate clicking on an announcement
    const announcement = screen.getByText("Test Reminder");
    fireEvent.click(announcement);

    // Ensure navigation happened
    expect(window.location.pathname).toBe("/AnnouncementPage/1");
  });
});
