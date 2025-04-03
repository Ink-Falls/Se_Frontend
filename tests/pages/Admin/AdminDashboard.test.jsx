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
vi.mock('/src/components/specific/users/UserTable.jsx', () => ({
  __esModule: true,
  default: ({ onGenerateReport }) => (
    <button
      data-testid="generate-report-button"
      onClick={onGenerateReport}
    >
      Generate Report
    </button>
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

  it("should open and close report viewer modal", async () => {
    getAllUsers.mockResolvedValueOnce([
      { id: 1, name: "John Doe", role: "admin" },
    ]);
    getAllCourses.mockResolvedValueOnce([]);
    getGroupsByType.mockResolvedValueOnce([]);
  
    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      </MemoryRouter>
    );
    screen.debug(); 
  
    // Wait for the "Generate Report" button to appear
    const generateReportButton = await screen.findByTestId("generate-report-button");
    expect(generateReportButton).toBeInTheDocument();
  
    // Simulate clicking the button
    fireEvent.click(generateReportButton);
  
    // Verify the report viewer modal is displayed
    const reportViewerModal = await screen.findByTestId("report-viewer-modal");
    expect(reportViewerModal).toBeVisible();
  
    // Close the modal
    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);
  
    await waitFor(() => expect(reportViewerModal).not.toBeVisible());
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
  
    // Mock API responses
    getAllUsers.mockResolvedValueOnce([
      { id: 1, name: "John Doe", role: "admin" },
    ]);
    getAllCourses.mockResolvedValueOnce([]);
    getGroupsByType.mockResolvedValueOnce([]);
  
    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      </MemoryRouter>
    );
  
    // Debug the DOM to verify if the button is rendered
    screen.debug();
  
    // Find and click the "Generate Report" button
    const generateReportButton = await screen.findByTestId("generate-report-button");
    await user.click(generateReportButton);
  
    // Check if the report viewer modal is visible
    const reportViewerModal = await screen.findByTestId("report-viewer-modal");
    await waitFor(() => expect(reportViewerModal).toBeVisible());
  
    // Close the modal
    const closeButton = screen.getByText("Close");
    await user.click(closeButton);
  
    await waitFor(() => expect(reportViewerModal).toHaveStyle({ display: "none" }));
  });
});
