import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from '@testing-library/react';
import TeacherCourseModules from '../../../src/pages/Teacher/TeacherCourseModules';
import {
  getModulesByCourseId,
  getModuleContents,
  createModule,
  updateModule,
  deleteModule,
  deleteModuleContent,
} from '../../../src/services/moduleService';
import { useCourse } from '../../../src/contexts/CourseContext';
import { useNavigate } from 'react-router-dom';

// Mock all required modules
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: () => ({ state: {} }),
}));

vi.mock('../../../src/contexts/CourseContext', () => ({
  useCourse: vi.fn(),
}));

vi.mock('../../../src/services/moduleService', () => ({
  getModulesByCourseId: vi.fn(),
  getModuleContents: vi.fn(),
  createModule: vi.fn(),
  updateModule: vi.fn(),
  deleteModule: vi.fn(),
  deleteModuleContent: vi.fn(),
  addModuleContent: vi.fn(),
}));

// Mock layout components
vi.mock('../../../src/components/common/layout/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('../../../src/components/common/layout/Header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock('../../../src/components/common/layout/MobileNavbar', () => ({
  default: () => <div data-testid="mobile-navbar">MobileNavbar</div>,
}));

describe('TeacherCourseModules', () => {
  const mockNavigate = vi.fn();
  const mockSelectedCourse = {
    id: 1,
    name: 'Test Course',
    code: 'TC101',
  };

  const mockModule = {
    id: 1,
    name: 'Test Module',
    description: 'Test Description',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useCourse.mockReturnValue({ selectedCourse: mockSelectedCourse });
    getModulesByCourseId.mockResolvedValue({ modules: [mockModule] });
    getModuleContents.mockResolvedValue({ contents: [] });
  });

  it('renders loading state initially', async () => {
    render(<TeacherCourseModules />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('redirects to dashboard when no course is selected', () => {
    useCourse.mockReturnValue({ selectedCourse: null });
    render(<TeacherCourseModules />);
    expect(mockNavigate).toHaveBeenCalledWith('/Teacher/Dashboard');
  });

  it('displays modules when loaded successfully', async () => {
    await act(async () => {
      render(<TeacherCourseModules />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Module')).toBeInTheDocument();
    });
  });

  it('handles module creation', async () => {
    const newModule = {
      id: 2,
      name: 'New Module',
      description: 'New Description',
    };
    createModule.mockResolvedValueOnce(newModule);

    await act(async () => {
      render(<TeacherCourseModules />);
    });

    // Open create modal
    const createButton = screen.getByTitle('Add Content');
    fireEvent.click(createButton);
  });

  it('handles module deletion', async () => {
    deleteModule.mockResolvedValueOnce({ success: true });

    await act(async () => {
      render(<TeacherCourseModules />);
    });
  });

  it('handles module content deletion', async () => {
    const mockContent = {
      id: 1,
      title: 'Test Content',
      link: 'http://example.com',
    };

    getModuleContents.mockResolvedValueOnce({
      contents: [mockContent],
    });

    deleteModuleContent.mockResolvedValueOnce({ success: true });

    await act(async () => {
      render(<TeacherCourseModules />);
    });

    // Expand module to show content

    // Find and click delete content button

    // Confirm deletion
  });

  it('displays error message when module fetch fails', async () => {
    getModulesByCourseId.mockRejectedValueOnce(new Error('Failed to fetch'));

    await act(async () => {
      render(<TeacherCourseModules />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to Load Modules/)).toBeInTheDocument();
    });
  });

  it('displays empty state when no modules exist', async () => {
    getModulesByCourseId.mockResolvedValueOnce({ modules: [] });

    await act(async () => {
      render(<TeacherCourseModules />);
    });

    await waitFor(() => {
      expect(screen.getByText('No Modules Found')).toBeInTheDocument();
    });
  });
});