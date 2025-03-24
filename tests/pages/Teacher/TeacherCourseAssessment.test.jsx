import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { CourseContext } from "Se_Frontend/src/contexts/CourseContext";
import TeacherCourseAssessment from "Se_Frontend/src/pages/Teacher/TeacherCourseAssessment";
import { getCourseAssessments, deleteAssessment } from "Se_Frontend/src/services/assessmentService";

// Mock API Services
vi.mock("Se_Frontend/src/services/assessmentService", () => ({
  getCourseAssessments: vi.fn(),
  deleteAssessment: vi.fn(),
}));

// Mock Course Data
const mockCourse = {
  id: 1,
  name: "Sample Course",
  code: "COURSE101",
};

// Mock Assessments Data
const mockAssessments = [
  {
    id: 1,
    title: "Mock Quiz",
    description: "This is a mock quiz",
    type: "quiz",
    duration_minutes: 30,
    passing_score: 50,
    max_score: 100,
    due_date: "2025-12-31T23:59:59Z",
    questions: [],
  },
  {
    id: 2,
    title: "Mock Assignment",
    description: "This is a mock assignment",
    type: "assignment",
    duration_minutes: 60,
    passing_score: 70,
    max_score: 100,
    due_date: "2025-11-30T23:59:59Z",
    questions: [],
  },
];

describe("TeacherCourseAssessment Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCourseAssessments.mockResolvedValue({ success: true, assessments: mockAssessments });
  });

  it("renders the component correctly", async () => {
    render(
      <MemoryRouter>
        <CourseContext.Provider value={{ selectedCourse: mockCourse }}>
          <TeacherCourseAssessment />
        </CourseContext.Provider>
      </MemoryRouter>
    );

    // Check if the course title appears
    await waitFor(() => {
      expect(screen.getByText("Sample Course")).toBeInTheDocument();
      expect(screen.getByText("COURSE101")).toBeInTheDocument();
    });

    // Check if assessments are loaded
    await waitFor(() => {
      expect(screen.getByText("Mock Quiz")).toBeInTheDocument();
      expect(screen.getByText("Mock Assignment")).toBeInTheDocument();
    });
  });

  it("shows a message when no assessments are available", async () => {
    getCourseAssessments.mockResolvedValue({ success: true, assessments: [] });

    render(
      <MemoryRouter>
        <CourseContext.Provider value={{ selectedCourse: mockCourse }}>
          <TeacherCourseAssessment />
        </CourseContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No Assessments Available")).toBeInTheDocument();
    });
  });

  it("opens and closes the create assessment modal", async () => {
    render(
      <MemoryRouter>
        <CourseContext.Provider value={{ selectedCourse: mockCourse }}>
          <TeacherCourseAssessment />
        </CourseContext.Provider>
      </MemoryRouter>
    );

    // Click the "Create Assessment" button
    fireEvent.click(screen.getByText("Create Assessment"));

    // Expect modal to be open
    await waitFor(() => {
      expect(screen.getByText("Create New Assessment")).toBeInTheDocument();
    });

    // Close the modal (assuming there's a close button)
    fireEvent.click(screen.getByText("Close"));

    await waitFor(() => {
      expect(screen.queryByText("Create New Assessment")).not.toBeInTheDocument();
    });
  });

  it("opens the edit modal when clicking on edit", async () => {
    render(
      <MemoryRouter>
        <CourseContext.Provider value={{ selectedCourse: mockCourse }}>
          <TeacherCourseAssessment />
        </CourseContext.Provider>
      </MemoryRouter>
    );

    // Open the menu and click edit
    fireEvent.click(screen.getAllByRole("button", { name: /more/i })[0]);
    fireEvent.click(screen.getByText("Edit Assessment"));

    // Expect edit modal to open
    await waitFor(() => {
      expect(screen.getByText("Edit Assessment")).toBeInTheDocument();
    });
  });

  it("deletes an assessment successfully", async () => {
    deleteAssessment.mockResolvedValue({ success: true });

    render(
      <MemoryRouter>
        <CourseContext.Provider value={{ selectedCourse: mockCourse }}>
          <TeacherCourseAssessment />
        </CourseContext.Provider>
      </MemoryRouter>
    );

    // Open the menu and click delete
    fireEvent.click(screen.getAllByRole("button", { name: /more/i })[0]);
    fireEvent.click(screen.getByText("Delete Assessment"));

    // Confirm deletion
    fireEvent.click(screen.getByText("Confirm"));

    await waitFor(() => {
      expect(screen.queryByText("Mock Quiz")).not.toBeInTheDocument();
    });
  });

  it("shows a success message after creating an assessment", async () => {
    render(
      <MemoryRouter>
        <CourseContext.Provider value={{ selectedCourse: mockCourse }}>
          <TeacherCourseAssessment />
        </CourseContext.Provider>
      </MemoryRouter>
    );

    // Simulate a success message
    fireEvent.click(screen.getByText("Create Assessment"));
    await waitFor(() => screen.getByText("Create New Assessment"));

    fireEvent.click(screen.getByText("Save")); // Assume there's a save button
    await waitFor(() => {
      expect(screen.getByText("Assessment created successfully")).toBeInTheDocument();
    });

    // Success message should disappear after 5 seconds
    await waitFor(
      () => {
        expect(screen.queryByText("Assessment created successfully")).not.toBeInTheDocument();
      },
      { timeout: 6000 }
    );
  });
});