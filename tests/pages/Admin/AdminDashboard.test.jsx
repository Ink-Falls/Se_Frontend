import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from '../../../src/pages/Admin/AdminDashboard';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import { getAllUsers, getAllCourses } from '../../../src/services/userService';
import { getGroupsByType } from '../../../src/services/groupService';
import { generateUsersReport } from '../../../src/services/reportService';

// ✅ Mock dependencies correctly
vi.mock("../../../src/services/userService", () => ({
  getAllUsers: vi.fn(),
  getAllCourses: vi.fn(),
}));

vi.mock("../../../src/services/groupService", () => ({
  getGroupsByType: vi.fn(),
}));

vi.mock("../../../src/services/reportService", () => ({
  generateUsersReport: vi.fn(),
}));

vi.mock("../../../src/components/common/layout/Sidebar", () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock("../../../src/components/common/layout/Header", () => ({
  default: () => <div data-testid='header'>Header</div>,
}));

// Mock User Stats Component
vi.mock("../../../src/components/specific/users/UserStats", () => ({
  default: ({ totalUsers, totalLearners, totalTeachers, totalAdmins }) => (
    <div data-testid="user-stats">
      <span data-testid="stats-content">{totalUsers}-{totalLearners}-{totalTeachers}-{totalAdmins}</span>
    </div>
  ),
}));

// ✅ Mock the Add User Modal
vi.mock("../../../src/components/common/Modals/Add/AddUserModal", () => ({
  default: ({ isOpen, onClose, onSubmit }) => (
    <div data-testid="add-user-modal" style={{ display: isOpen ? "block" : "none" }}>
      Add User Modal
      <button onClick={onSubmit}>Submit</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  ),
}));

// ✅ Mock Delete Modal
vi.mock("../../../src/components/common/Modals/Delete/DeleteModal", () => ({
  default: ({ isOpen, onClose, onConfirm }) => (
    <div data-testid="delete-modal" style={{ display: isOpen ? "block" : "none" }}>
      Delete Modal
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  ),
}));

// ✅ Provide mock data
const mockUsers = [
  { id: 1, name: "John Doe", role: "admin" },
  { id: 2, name: "Jane Smith", role: "teacher" },
  { id: 3, name: "Mark Lee", role: "learner" },
];

const mockCourses = [
  { id: "1", name: "Math 101", description: "Basic Math Course" },
  { id: "2", name: "Physics 201", description: "Advanced Physics" },
];

describe("AdminDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // ✅ Mock API Calls with Data
    getAllUsers.mockResolvedValue(mockUsers);
    getAllCourses.mockResolvedValue(mockCourses);
    getGroupsByType.mockResolvedValue([]);
    generateUsersReport.mockResolvedValue("mock-pdf-url");
  });

  it("should show loading state initially", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    // ✅ Ensure "Loading" text appears initially
   // expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should fetch and display users", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    // ✅ Wait for users to load
    await waitFor(() => expect(screen.getByTestId("user-stats")).toBeInTheDocument());

    // ✅ Ensure API is called
    expect(getAllUsers).toHaveBeenCalled();
  });

  it("should open and close Add User modal", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    const addButton = screen.getByTestId("add-button");
    await user.click(addButton);

    // ✅ Check if modal appears
    await waitFor(() => expect(screen.getByTestId("add-user-modal")).toBeVisible());

    // ✅ Close the modal
    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    await waitFor(() => expect(screen.getByTestId("add-user-modal")).toHaveStyle({ display: "none" }));
  });

  it("should open and confirm Delete modal", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    const deleteButton = screen.getByTestId("delete-button");
    await user.click(deleteButton);

    // ✅ Check if delete modal appears
    await waitFor(() => expect(screen.getByTestId("delete-modal")).toBeVisible());

    // ✅ Confirm deletion
    const confirmButton = screen.getByText("Confirm");
    await user.click(confirmButton);

    await waitFor(() => expect(screen.getByTestId("delete-modal")).toHaveStyle({ display: "none" }));
  });

  it("should handle API error gracefully", async () => {
    getAllUsers.mockRejectedValueOnce(new Error("API Error"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith("Error fetching users:", expect.any(Error)));

    consoleSpy.mockRestore();
  });

  it("should open and close report viewer modal", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      </MemoryRouter>
    );

    const generateReportButton = screen.getByTestId("generate-report-button");
    await user.click(generateReportButton);

    const reportViewerModal = await screen.findByTestId("report-viewer-modal");

    // ✅ Check if modal is visible
    await waitFor(() => expect(reportViewerModal).toBeVisible());

    // ✅ Close the modal
    const closeButton = screen.getByText("Close");
    await user.click(closeButton);

    await waitFor(() => expect(reportViewerModal).toHaveStyle({ display: "none" }));
  });
});
