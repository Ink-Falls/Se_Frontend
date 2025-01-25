import { render, screen, within } from "@testing-library/react";
import UserStats from "Se_Frontend/src/components/UserStats.jsx";

describe("UserStats Component", () => {
  it("renders all stat categories with correct values", () => {
    // Arrange: Define props
    const mockData = {
      totalUsers: 100,
      totalLearners: 60,
      totalTeachers: 20,
      totalAdmins: 10,
      totalGroups: 5,
    };

    // Act: Render the component with the mock data
    render(<UserStats {...mockData} />);

    // Assert: Check that each stat is displayed correctly
    expect(screen.getByText(/users/i)).toBeInTheDocument();
    expect(screen.getByText(mockData.totalUsers.toString())).toBeInTheDocument();

    expect(screen.getByText(/learners/i)).toBeInTheDocument();
    expect(
      screen.getByText(mockData.totalLearners.toString())
    ).toBeInTheDocument();

    expect(screen.getByText(/teachers/i)).toBeInTheDocument();
    expect(
      screen.getByText(mockData.totalTeachers.toString())
    ).toBeInTheDocument();

    expect(screen.getByText(/admin/i)).toBeInTheDocument();
    expect(
      screen.getByText(mockData.totalAdmins.toString())
    ).toBeInTheDocument();

    expect(screen.getByText(/groups/i)).toBeInTheDocument();
    expect(
      screen.getByText(mockData.totalGroups.toString())
    ).toBeInTheDocument();
  });

  it("renders default values when no props are passed", () => {
    // Act: Render the component without any props
    render(<UserStats />);

    // Assert: Default values (0) are rendered for all categories
    const usersSection = screen.getByText(/users/i).closest("div");
    expect(within(usersSection).getByText("0")).toBeInTheDocument();

    const learnersSection = screen.getByText(/learners/i).closest("div");
    expect(within(learnersSection).getByText("0")).toBeInTheDocument();

    const teachersSection = screen.getByText(/teachers/i).closest("div");
    expect(within(teachersSection).getByText("0")).toBeInTheDocument();

    const adminSection = screen.getByText(/admin/i).closest("div");
    expect(within(adminSection).getByText("0")).toBeInTheDocument();

    const groupsSection = screen.getByText(/groups/i).closest("div");
    expect(within(groupsSection).getByText("0")).toBeInTheDocument();
  });
});
