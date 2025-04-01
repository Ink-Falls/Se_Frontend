import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddCourse from "Se_Frontend/src/components/common/Modals/Add/AddCourse";
import { vi } from "vitest";

const mockOnClose = vi.fn();
const mockOnCourseAdded = vi.fn();
const mockCreateCourse = vi.fn(() =>
  Promise.resolve({ id: 1, name: "New Course" })
);

vi.mock("../../../../services/courseService", () => ({
  createCourse: vi.fn(() => mockCreateCourse()),
}));

vi.mock("../../../../services/userService", () => ({
  getTeachers: vi.fn(() =>
    Promise.resolve([
      { id: 1, first_name: "John", last_name: "Doe", email: "john.doe@example.com" },
    ])
  ),
}));

vi.mock("../../../../services/groupService", () => ({
  getGroupsByType: vi.fn((type) => {
    if (type === "learner") {
      return Promise.resolve([{ id: 1, name: "Learner Group 1" }]);
    }
    if (type === "student_teacher") {
      return Promise.resolve([{ id: 2, name: "Student Teacher Group 1" }]);
    }
    return Promise.resolve([]);
  }),
}));

describe("AddCourse Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the modal correctly", async () => {
    render(
      <AddCourse isOpen={true} onClose={mockOnClose} onCourseAdded={mockOnCourseAdded} />
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("Add New Course")).toBeInTheDocument();
    });

    // Check that all fields are rendered
    expect(screen.getByTestId("course-name-input")).toBeInTheDocument();
    expect(screen.getByTestId("course-name-label")).toHaveTextContent("Course Name");
    expect(screen.getByText("Select Teacher")).toBeInTheDocument();
    expect(screen.getByText("Select Learner Group")).toBeInTheDocument();
    expect(screen.getByText("Select Student Teacher Group")).toBeInTheDocument();
  });

  it("handles form input changes correctly", async () => {
    render(
      <AddCourse isOpen={true} onClose={mockOnClose} onCourseAdded={mockOnCourseAdded} />
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("Add New Course")).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByTestId("course-name-input"), {
      target: { value: "Test Course" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "This is a test course." },
    });

    // Select a teacher
    fireEvent.click(screen.getByText("John Doe"));

    // Select a learner group
    fireEvent.click(screen.getByText("Learner Group 1"));

    // Select a student teacher group
    fireEvent.click(screen.getByText("Student Teacher Group 1"));

    // Verify form values
    expect(screen.getByTestId("course-name-input").value).toBe("Test Course");
    expect(screen.getByLabelText(/description/i).value).toBe("This is a test course.");
  });

  it("submits the form successfully", async () => {
    render(
      <AddCourse isOpen={true} onClose={mockOnClose} onCourseAdded={mockOnCourseAdded} />
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("Add New Course")).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByTestId("course-name-input"), {
      target: { value: "Test Course" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "This is a test course." },
    });

    // Select a teacher
    fireEvent.click(screen.getByText("John Doe"));

    // Select a learner group
    fireEvent.click(screen.getByText("Learner Group 1"));

    // Select a student teacher group
    fireEvent.click(screen.getByText("Student Teacher Group 1"));

    // Submit the form
    fireEvent.click(screen.getByText("Create Course"));

    // Wait for the form to be submitted
    await waitFor(() => {
      expect(mockCreateCourse).toHaveBeenCalledWith({
        name: "Test Course",
        description: "This is a test course.",
        user_id: 1,
        learner_group_id: 1,
        student_teacher_group_id: 2,
      });
      expect(mockOnCourseAdded).toHaveBeenCalledWith({ id: 1, name: "New Course" });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("shows an error message if required fields are missing", async () => {
    render(
      <AddCourse isOpen={true} onClose={mockOnClose} onCourseAdded={mockOnCourseAdded} />
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("Add New Course")).toBeInTheDocument();
    });

    // Submit the form without filling in required fields
    fireEvent.click(screen.getByText("Create Course"));

    // Check for error message
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Please fill in all required fields");
    });
  });
});