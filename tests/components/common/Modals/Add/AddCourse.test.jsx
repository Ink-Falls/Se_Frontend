import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddCourse from "../../../../../src/components/common/Modals/Add/AddCourse";
import { vi } from "vitest";
import * as courseService from "../../../../../src/services/courseService";
import * as userService from "../../../../../src/services/userService";
import * as groupService from "../../../../../src/services/groupService";

const mockOnClose = vi.fn();
const mockOnCourseAdded = vi.fn();
const mockCreateCourse = vi.fn(() =>
  Promise.resolve({ id: 1, name: "New Course" })
);

const mockTeachers = [
  { id: 1, first_name: "John", last_name: "Doe", email: "john.doe@example.com" },
];

const mockLearnerGroups = [
  { id: 1, name: "Learner Group 1" }
];

const mockStudentTeacherGroups = [
  { id: 2, name: "Student Teacher Group 1" }
];

// Setup mocks before tests
vi.mock("../../../../../src/services/courseService", () => ({
  createCourse: vi.fn()
}));

vi.mock("../../../../../src/services/userService", () => ({
  getTeachers: vi.fn()
}));

vi.mock("../../../../../src/services/groupService", () => ({
  getGroupsByType: vi.fn()
}));

describe("AddCourse Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configure mock implementations for each test
    courseService.createCourse.mockImplementation(mockCreateCourse);
    userService.getTeachers.mockResolvedValue(mockTeachers);
    groupService.getGroupsByType.mockImplementation((type) => {
      if (type === "learner") {
        return Promise.resolve(mockLearnerGroups);
      }
      if (type === "student_teacher") {
        return Promise.resolve(mockStudentTeacherGroups);
      }
      return Promise.resolve([]);
    });
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
    
    // Wait for teachers to load
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
    
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
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Learner Group 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Student Teacher Group 1/i)).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByTestId("course-name-input"), {
      target: { value: "Test Course" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "This is a test course." },
    });

    // Select a teacher
    const teacherElement = screen.getByText(/John Doe/i).closest('div[role="button"]') || 
                           screen.getByText(/John Doe/i).closest('div');
    fireEvent.click(teacherElement);

    // Select a learner group
    const learnerGroupElement = screen.getByText(/Learner Group 1/i).closest('div[role="button"]') || 
                                screen.getByText(/Learner Group 1/i).closest('div');
    fireEvent.click(learnerGroupElement);

    // Select a student teacher group
    const studentTeacherGroupElement = screen.getByText(/Student Teacher Group 1/i).closest('div[role="button"]') || 
                                       screen.getByText(/Student Teacher Group 1/i).closest('div');
    fireEvent.click(studentTeacherGroupElement);

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
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Learner Group 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Student Teacher Group 1/i)).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByTestId("course-name-input"), {
      target: { value: "Test Course" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "This is a test course." },
    });

    // Select a teacher
    const teacherElement = screen.getByText(/John Doe/i).closest('div[role="button"]') || 
                           screen.getByText(/John Doe/i).closest('div');
    fireEvent.click(teacherElement);

    // Select a learner group
    const learnerGroupElement = screen.getByText(/Learner Group 1/i).closest('div[role="button"]') || 
                                screen.getByText(/Learner Group 1/i).closest('div');
    fireEvent.click(learnerGroupElement);

    // Select a student teacher group
    const studentTeacherGroupElement = screen.getByText(/Student Teacher Group 1/i).closest('div[role="button"]') || 
                                       screen.getByText(/Student Teacher Group 1/i).closest('div');
    fireEvent.click(studentTeacherGroupElement);

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

    // Fill in only a name field but leave the rest empty
    fireEvent.change(screen.getByTestId("course-name-input"), {
      target: { value: "Test Course" },
    });

    // Mock the preventDefault function for form submission
    const mockPreventDefault = vi.fn();

    // Get the form element and submit it directly to trigger validation
    const form = screen.getByText("Create Course").closest('form');
    fireEvent.submit(form || document.querySelector('form'), { preventDefault: mockPreventDefault });

    // Now look for the error text instead of the role
    await waitFor(() => {
      expect(screen.getByText("Please fill in all required fields")).toBeInTheDocument();
    });
  });
});