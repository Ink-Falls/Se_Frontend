import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LearnerDashboard from 'Se_Frontend/src/pages/Learner/LearnerDashboard';
import { AuthProvider } from 'Se_Frontend/src/contexts/AuthContext';
import { CourseProvider } from 'Se_Frontend/src/contexts/CourseContext';
import { getLearnerCourses } from 'Se_Frontend/src/services/courseService';

vi.mock('Se_Frontend/src/services/courseService', () => ({
  getLearnerCourses: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LearnerDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sidebar, header, and courses correctly', async () => {
    getLearnerCourses.mockResolvedValueOnce([
      {
        id: 1,
        name: 'Course 1',
        code: 'COURSE101',
        description: 'Description for Course 1',
        imageUrl: 'https://via.placeholder.com/150',
        studentCount: 10,
      },
      {
        id: 2,
        name: 'Course 2',
        code: 'COURSE102',
        description: 'Description for Course 2',
        imageUrl: 'https://via.placeholder.com/150',
        studentCount: 20,
      },
    ]);

    render(
      <MemoryRouter>
        <AuthProvider>
          <CourseProvider>
            <LearnerDashboard />
          </CourseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Check if the sidebar is rendered
    const links = screen.getAllByRole('link');
    expect(links.some(link => link.textContent.includes('Courses'))).toBe(true);
    expect(links.some(link => link.textContent.includes('Notifications'))).toBe(true);

    // Check if the header is rendered
    const headers = screen.getAllByRole('heading', { name: /my courses/i });
    expect(headers[0]).toBeInTheDocument();

    // Wait for the courses to be fetched and rendered
    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
      expect(screen.getByText('Course 2')).toBeInTheDocument();
    });
  });

  it('displays a loading spinner while fetching courses', () => {
    getLearnerCourses.mockReturnValue(new Promise(() => {})); // Mock a pending promise

    render(
      <MemoryRouter>
        <AuthProvider>
          <CourseProvider>
            <LearnerDashboard />
          </CourseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Check if the loading spinner is displayed
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays an error message if fetching courses fails', async () => {
    getLearnerCourses.mockRejectedValueOnce(new Error('Failed to fetch courses'));

    render(
      <MemoryRouter>
        <AuthProvider>
          <CourseProvider>
            <LearnerDashboard />
          </CourseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to Load Courses')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch courses')).toBeInTheDocument();
    });
  });

  it('displays an empty state if no courses are available', async () => {
    getLearnerCourses.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <AuthProvider>
          <CourseProvider>
            <LearnerDashboard />
          </CourseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for the empty state to be displayed
    await waitFor(() => {
      expect(screen.getByText('No Subjects Available')).toBeInTheDocument();
      expect(screen.getByText('You are not enrolled in any subjects at the moment. Please wait for your enrollment to be processed or contact your administrator.')).toBeInTheDocument();
    });
  });

  it('navigates to the course modules page when a course is clicked', async () => {
    getLearnerCourses.mockResolvedValueOnce([
      {
        id: 1,
        name: 'Course 1',
        code: 'COURSE101',
        description: 'Description for Course 1',
        imageUrl: 'https://via.placeholder.com/150',
        studentCount: 10,
      },
    ]);

    render(
      <MemoryRouter>
        <AuthProvider>
          <CourseProvider>
            <Routes>
              <Route path="/" element={<LearnerDashboard />} />
            </Routes>
          </CourseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for the courses to be fetched and rendered
    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
    });

    // Simulate clicking on a course
    fireEvent.click(screen.getByText('Course 1'));

    // Check if the navigate function was called with the correct route
    expect(mockNavigate).toHaveBeenCalledWith('/Learner/CourseModules');
  });
});