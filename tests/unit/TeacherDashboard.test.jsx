import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import TeacherDashboard from "../../src/components/TeacherDashboard";
import { act } from 'react-dom/test-utils';

// Mock useNavigate
const mockNavigate = vi.fn();
// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate, // Ensure it returns mockNavigate
  };
});

describe("TeacherDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });


  test("renders loading state initially", () => {
    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    );
    expect(screen.getByText(/Loading courses/i)).toBeInTheDocument();
  });

  test("renders course list correctly after loading", async () => {
    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Environmental Science")).toBeInTheDocument();
      expect(screen.getByText("ENV-101")).toBeInTheDocument();
    });
  });

  test("handles API error state", async () => {
    vi.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Failed to fetch courses." }), // ✅ Fixed
      })
    );
  
    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    );
  
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch courses/i)).toBeInTheDocument();
    });
  });
  

  test("navigates to course details page on course click", async () => {
    render(
      <BrowserRouter>
        <TeacherDashboard />
      </BrowserRouter>
    );

    await waitFor(() =>
      expect(screen.getByText("Environmental Science")).toBeInTheDocument()
    );

    const courseElement = screen.getByText("Environmental Science");
    userEvent.click(courseElement);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/TeacherCoursePage", {
        state: { courseTitle: "Environmental Science", courseCode: "ENV-101" },
      });
    });
  });
});
