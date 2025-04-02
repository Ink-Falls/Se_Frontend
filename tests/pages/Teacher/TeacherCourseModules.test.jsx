import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import TeacherCourseModules from '../../../src/pages/Teacher/TeacherCourseModules';
import * as moduleService from '../../../src/services/moduleService';

// Mock the useCourse hook
const mockUseCourse = vi.fn();

// Mock all required services
vi.mock('../../../src/services/moduleService', () => ({
  getModulesByCourseId: vi.fn(),
  createModule: vi.fn(),
  getModuleContents: vi.fn(),
  updateModule: vi.fn(),
  deleteModule: vi.fn(),
  addModuleContent: vi.fn(),
  deleteModuleContent: vi.fn()
}));

// Mock the CourseContext module
vi.mock('../../../src/contexts/CourseContext', () => ({
  useCourse: () => mockUseCourse()
}));

// Mock components
vi.mock('../../../src/components/common/layout/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}));

vi.mock('../../../src/components/common/layout/Header', () => ({
  default: () => <div data-testid="header">Header</div>
}));

vi.mock('../../../src/components/common/layout/MobileNavbar', () => ({
  default: () => <div data-testid="mobile-navbar">MobileNavbar</div>
}));

// Mock modals
vi.mock('../../../src/components/common/Modals/Create/CreateModuleModal', () => ({
  default: ({ onSubmit }) => (
    <div>
      <h2>Create New Module</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name: 'New Module',
          description: 'New Description'
        });
      }}>
        <button type="submit">Create Module</button>
      </form>
    </div>
  )
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('TeacherCourseModules Component', () => {
  const mockSelectedCourse = {
    id: 1,
    name: 'Test Course',
    code: 'TEST101'
  };

  const mockModules = [
    {
      id: 1,
      title: 'Module 1', 
      description: 'Description 1',
      resources: [
        { content_id: 1, title: 'Resource 1', link: 'http://test.com/1' }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Module 2',
      description: 'Description 2',
      resources: [],
      createdAt: new Date().toISOString()
    }
  ];

  // Render function with a cleaner approach for setting the mock value
  const renderComponent = (selectedCourse = mockSelectedCourse) => {
    mockUseCourse.mockReturnValue({
      selectedCourse,
      setSelectedCourse: vi.fn()
    });

    return render(
      <MemoryRouter>
        <TeacherCourseModules />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    moduleService.getModulesByCourseId.mockResolvedValue(mockModules);
    moduleService.getModuleContents.mockResolvedValue({ contents: [] });
  });

  describe('Initial Render', () => {
    it('should render basic components', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('mobile-navbar')).toBeInTheDocument();
      });
    });

    it('should redirect to dashboard if no course selected', async () => {
      renderComponent(null);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/Teacher/Dashboard');
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when course has no modules', async () => {
      moduleService.getModulesByCourseId.mockResolvedValueOnce([]);
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('No Modules Found')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create first module/i })).toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    it('should show error state when modules fail to load', async () => {
      moduleService.getModulesByCourseId.mockRejectedValueOnce(
        new Error('Failed to fetch modules')
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Failed to Load Modules')).toBeInTheDocument();
      });
    });
  });

  describe('Module Creation', () => {
    it('should handle module creation', async () => {
      moduleService.getModulesByCourseId.mockResolvedValueOnce([]);
      const newModule = {
        id: 3,
        name: 'New Module',
        description: 'New Description'
      };

      moduleService.createModule.mockResolvedValueOnce(newModule);
      renderComponent();

      // Wait for the empty state to render and click the create button
      const createButton = await screen.findByRole('button', { name: /create first module/i });
      fireEvent.click(createButton);

      // Find and click the submit button in the mock modal
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /create module/i });
        fireEvent.click(submitButton);
      });

      // Verify that createModule was called
      await waitFor(() => {
        expect(moduleService.createModule).toHaveBeenCalled();
      });
    });
  });
});
