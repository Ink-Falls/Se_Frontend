import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import TeacherCourseAnnouncements from "Se_Frontend/src/pages/Teacher/TeacherCourseAnnouncements";
import { useCourse } from "Se_Frontend/src/contexts/CourseContext";
import { MemoryRouter } from "react-router-dom";

// Mock the useCourse context
vi.mock("Se_Frontend/src/contexts/CourseContext", () => ({
  useCourse: vi.fn(),
}));

// Mock the useAuth hook
vi.mock("Se_Frontend/src/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: { id: 1, name: "Test User", role: "teacher" },
    isAuthenticated: true,
  })),
}));

// Mock the navigate function from react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
  };
});

describe("TeacherCourseAnnouncements Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the return value of useCourse
    useCourse.mockReturnValue({
      selectedCourse: { id: 1, name: "Test Course", code: "TC101" },
    });
  });

  it("renders the component correctly", () => {
    render(
      <MemoryRouter>
        <TeacherCourseAnnouncements />
      </MemoryRouter>
    );

    // Use a more specific query to check if the page title is rendered
    expect(screen.getByRole('heading', { level: 1, name: "Test Course" }));

    expect(screen.getByText("Announcements")).toBeInTheDocument();
  });

  it("navigates to the dashboard if no course is selected", async () => {
    // Mock the return value of useCourse to simulate no course selected
    useCourse.mockReturnValue({ selectedCourse: null });

    render(
      <MemoryRouter>
        <TeacherCourseAnnouncements />
      </MemoryRouter>
    );

    // Wait for the navigation to be triggered
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/Teacher/Dashboard");
    });
  });

  it("adds a new announcement", async () => {
    render(
      <MemoryRouter>
        <TeacherCourseAnnouncements />
      </MemoryRouter>
    );

    // Open the modal
    fireEvent.click(screen.getByTestId("open-add-announcement-modal"));

    // Wait for the modal to open
    await waitFor(() => {
      expect(screen.getByText("Add New Announcement")).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Enter title"), {
      target: { value: "New Announcement" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter description"), {
      target: { value: "This is a new announcement." },
    });

    // Submit the form
    fireEvent.click(screen.getByTestId("add-announcement-button"));

    // Wait for the new announcement to be added
    await waitFor(() => {
      expect(screen.getByTestId("modal-title")).toHaveTextContent("Add New Announcement");
    });
  });

  it("edits an announcement", async () => {
    render(
      <MemoryRouter>
        <TeacherCourseAnnouncements />
      </MemoryRouter>
    );

    // Open the edit modal
    fireEvent.click(screen.getByText("Test Reminder"));

    // Wait for the modal to open
    await waitFor(() => {
      expect(screen.getByText("Edit Announcement")).toBeInTheDocument();
    });

    // Edit the announcement
    fireEvent.change(screen.getByPlaceholderText("Enter title"), {
      target: { value: "Updated Announcement" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter description"), {
      target: { value: "This is an updated announcement." },
    });

    // Save the changes
    fireEvent.click(screen.getByText("Save"));

    // Wait for the announcement to be updated
    await waitFor(() => {
      expect(screen.getByText("Updated Announcement")).toBeInTheDocument();
    });
  });

  it("deletes an announcement", async () => {
    render(
      <MemoryRouter>
        <TeacherCourseAnnouncements />
      </MemoryRouter>
    );

    // Open the delete confirmation
    fireEvent.click(screen.getByText("Test Reminder"));
    fireEvent.click(screen.getByText("Delete"));

    // Confirm the deletion
    fireEvent.click(screen.getByText("Confirm"));

    // Wait for the announcement to be deleted
    await waitFor(() => {
      expect(screen.queryByText("Test Reminder")).not.toBeInTheDocument();
    });
  });
});