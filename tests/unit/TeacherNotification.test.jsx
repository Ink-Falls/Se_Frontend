import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
// Update import path to match new file name
import TeacherNotifications from "../../src/pages/Teacher/TeacherNotifications";

describe("TeacherNotifications Component", () => {
  test("renders sidebar with navigation items", () => {
    render(
      <BrowserRouter>
        <TeacherNotifications />
      </BrowserRouter>
    );

    expect(screen.getByText("Courses")).toBeInTheDocument();
    const headers = screen.getAllByText("Notifications");

    // Ensure the header exists
    expect(headers.length).toBeGreaterThan(0);
  
    // Check that at least one header is in a heading tag (avoiding the sidebar link)
    expect(headers.some((el) => el.tagName.toLowerCase() === "h1")).toBe(true);
  });

  test("renders notifications list", () => {
    render(
      <BrowserRouter>
        <TeacherNotifications />
      </BrowserRouter>
    );

    expect(screen.getByText("New Submission")).toBeInTheDocument();
    expect(
      screen.getByText("New Submission for Activity 1 - Environmental Science")
    ).toBeInTheDocument();
    expect(screen.getByText("10 minutes ago")).toBeInTheDocument();
    
    expect(screen.getByText("New Announcement")).toBeInTheDocument();
    expect(
      screen.getByText("A new announcement regarding upcoming events has been posted.")
    ).toBeInTheDocument();
    expect(screen.getByText("30 minutes ago")).toBeInTheDocument();
  });
});
