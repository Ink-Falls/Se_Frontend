import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import TeacherModules from "../../src/pages/Teacher/TeacherCourseModules";
import { act } from 'react-dom/test-utils';

describe("TeacherModules Component", () => {
  test("renders module list correctly", () => {
    render(
      <BrowserRouter>
        <TeacherModules />
      </BrowserRouter>
    );
    expect(screen.getByText("Module Title 1")).toBeInTheDocument();
    expect(screen.getByText("Module Title 2")).toBeInTheDocument();
  });

  test("expands and collapses module details", async () => {
    render(
      <BrowserRouter>
        <TeacherModules />
      </BrowserRouter>
    );
    
    const toggleButton = screen.getByText("Module Title 1");
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(screen.getByText("Introduction to AI")).toBeInTheDocument();
    });
    
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(screen.queryByText("Introduction to AI")).not.toBeInTheDocument();
    });
  });

 
  

  
  test("opens and closes dropdown menu", async () => {
    render(
      <BrowserRouter>
        <TeacherModules />
      </BrowserRouter>
    );
  
    // Select the first menu button
    const menuButton = screen.getAllByRole("button")[0];
  
    // Click to open the menu
    userEvent.click(menuButton);
  
    // Wait for dropdown menu to appear
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes("Edit"))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes("Delete"))).toBeInTheDocument();
    });
  
    // Click outside to close the menu
    userEvent.click(document.body);
  
    // Ensure dropdown disappears
    await waitFor(() => {
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });
  });
  

  test("adds a new module", async () => {
    render(
      <BrowserRouter>
        <TeacherModules />
      </BrowserRouter>
    );

    userEvent.click(screen.getByRole("button", { name: /add/i }));
    await waitFor(() => expect(screen.getByText("Add New Module")).toBeInTheDocument());
    
    userEvent.type(screen.getByLabelText("Title"), "New Module");
    userEvent.type(screen.getByLabelText("Description"), "New module description");
    userEvent.click(screen.getByRole("button", { name: /add module/i }));
    
    await waitFor(() => {
      expect(screen.getByText("New Module")).toBeInTheDocument();
    });
  });

  test("deletes a module", async () => {
    render(
      <BrowserRouter>
        <TeacherModules />
      </BrowserRouter>
    );
  
    // Open the dropdown menu
    const menuButton = screen.getAllByTestId("menu-btn")[0];
    userEvent.click(menuButton);
  
    // Wait for the Delete button to appear
    await waitFor(() => expect(screen.getByText("Delete")).toBeInTheDocument());
  
    // Click the Delete button
    userEvent.click(screen.getByText("Delete"));
  
    // Confirm module is removed
    await waitFor(() => {
      expect(screen.queryByText("Module Title 1")).not.toBeInTheDocument();
    });
  });
  
});
