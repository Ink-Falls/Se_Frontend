import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../../src/contexts/AuthContext"; // Import AuthProvider
import TeacherCourseAssessment from "../../../src/pages/Teacher/TeacherCourseAssessment";
import { getCourseAssessments, deleteAssessment } from "../../../src/services/assessmentService";

// Mock API Services
vi.mock("../../../src/services/assessmentService", () => ({
  getCourseAssessments: vi.fn(),
  deleteAssessment: vi.fn(),
}));

// Mock useCourse Hook
vi.mock("../../../src/contexts/CourseContext", () => ({
  useCourse: () => ({
    selectedCourse: {
      id: 1,
      name: "Sample Course",
      code: "COURSE101",
    },
  }),
}));

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
];

describe("TeacherCourseAssessment Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCourseAssessments.mockResolvedValue({ success: true, assessments: mockAssessments });
  });

  it("renders the component correctly", async () => {
    render(
      <AuthProvider> {/* Wrap with AuthProvider */}
        <MemoryRouter>
          <TeacherCourseAssessment />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText("Sample Course")).toBeInTheDocument();
      expect(screen.getByText("COURSE101")).toBeInTheDocument();
      expect(screen.getByText("Mock Quiz")).toBeInTheDocument();
    });
  });

  it("shows a message when no assessments are available", async () => {
    getCourseAssessments.mockResolvedValue({ success: true, assessments: [] });

    render(
      <AuthProvider> {/* Wrap with AuthProvider */}
        <MemoryRouter>
          <TeacherCourseAssessment />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("No Assessments Available")).toBeInTheDocument();
    });
  });

  it("opens and closes the create assessment modal", async () => {
    // Mock API to return no assessments
    getCourseAssessments.mockResolvedValue({ success: true, assessments: [] });
  
    render(
      <AuthProvider>
        <MemoryRouter>
          <TeacherCourseAssessment />
        </MemoryRouter>
      </AuthProvider>
    );
  
    // Debug the DOM to verify the button is rendered
    screen.debug();
  
    // Query the button using its aria-label
    const createButton = screen.getByRole("button", { name: "Create Assessment" });
    expect(createButton).toBeInTheDocument();
  
    // Click the button
    fireEvent.click(createButton);
  
    // Verify that the modal opens
    await waitFor(() => {
      expect(screen.getByText("Create New Assessment")).toBeInTheDocument();
    });
  
    // Close the modal
    fireEvent.click(screen.getByText("Close"));
  
    // Verify that the modal closes
    await waitFor(() => {
      expect(screen.queryByText("Create New Assessment")).not.toBeInTheDocument();
    });
  });

  it("opens the edit modal when clicking on edit", async () => {
    render(
      <AuthProvider> {/* Wrap with AuthProvider */}
        <MemoryRouter>
          <TeacherCourseAssessment />
        </MemoryRouter>
      </AuthProvider>
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
      <AuthProvider> {/* Wrap with AuthProvider */}
        <MemoryRouter>
          <TeacherCourseAssessment />
        </MemoryRouter>
      </AuthProvider>
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
      <AuthProvider> {/* Wrap with AuthProvider */}
        <MemoryRouter>
          <TeacherCourseAssessment />
        </MemoryRouter>
      </AuthProvider>
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