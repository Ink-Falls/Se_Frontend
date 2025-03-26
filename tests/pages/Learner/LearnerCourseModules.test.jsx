import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LearnerCourseModules from 'Se_Frontend/src/pages/Learner/LearnerCourseModules';
import { getModulesByCourseId, getModuleContents } from 'Se_Frontend/src/services/moduleService';
import { CourseProvider } from 'Se_Frontend/src/contexts/CourseContext';
import { AuthProvider } from 'Se_Frontend/src/contexts/AuthContext';

vi.mock('Se_Frontend/src/services/moduleService', () => ({
  getModulesByCourseId: vi.fn(),
  getModuleContents: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LearnerCourseModules Component', () => {
  const mockSelectedCourse = {
    id: 1,
    name: 'Sample Course',
    code: 'COURSE101',
  };

  const mockModules = [
    {
      id: 1,
      name: 'Module 1',
      description: 'Description for Module 1',
      resources: [
        {
          id: 1,
          name: 'Resource 1',
          link: 'https://example.com/resource1',
        },
      ],
    },
    {
      id: 2,
      name: 'Module 2',
      description: 'Description for Module 2',
      resources: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <AuthProvider>
        <CourseProvider value={{ selectedCourse: mockSelectedCourse }}>
          <MemoryRouter>
            <LearnerCourseModules />
          </MemoryRouter>
        </CourseProvider>
      </AuthProvider>
    );
  };

  it('renders the loading state', () => {
    getModulesByCourseId.mockReturnValue(new Promise(() => {})); // Mock a pending promise

    renderComponent();

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders the error state', async () => {
    getModulesByCourseId.mockRejectedValueOnce(new Error('Failed to fetch modules'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Failed to load modules. Please try again.')).toBeInTheDocument();
    });
  });

  it('renders "No Modules Available" when no modules are found', async () => {
    getModulesByCourseId.mockResolvedValueOnce([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No Modules Available')).toBeInTheDocument();
    });
  });

  it('renders the modules and their contents', async () => {
    getModulesByCourseId.mockResolvedValueOnce(mockModules);
    getModuleContents.mockResolvedValueOnce(mockModules[0].resources);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Module 1')).toBeInTheDocument();
      expect(screen.getByText('Module 2')).toBeInTheDocument();
    });
  });

  it('expands and collapses a module', async () => {
    getModulesByCourseId.mockResolvedValueOnce(mockModules);
    getModuleContents.mockResolvedValueOnce(mockModules[0].resources);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Module 1')).toBeInTheDocument();
    });

    const toggleButton = screen.getAllByRole('button', { name: /module/i })[0];
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('Resource 1')).toBeInTheDocument();
    });

    fireEvent.click(toggleButton);

    expect(screen.queryByText('Resource 1')).not.toBeInTheDocument();
  });

  it('navigates back to the dashboard when no course is selected', async () => {
    render(
      <AuthProvider>
        <CourseProvider value={{ selectedCourse: null }}>
          <MemoryRouter>
            <LearnerCourseModules />
          </MemoryRouter>
        </CourseProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/Learner/Dashboard');
    });
  });
});