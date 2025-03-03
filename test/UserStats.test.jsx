import React from "react"; // Add this line
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import UserStats from "../src/components/UserStats.jsx";

describe("UserStats Component", () => {
  it("renders without crashing", () => {
    expect(() => render(<UserStats />)).not.toThrow();
  });

  it("displays correct values when props are provided", () => {
    render(
      <UserStats
        totalUsers={10}
        totalLearners={20}
        totalTeachers={5}
        totalAdmins={2}
        totalGroups={3}
      />
    );

    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();

    expect(screen.getByText("Learners")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();

    expect(screen.getByText("Teachers")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();

    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    expect(screen.getByText("Groups")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
