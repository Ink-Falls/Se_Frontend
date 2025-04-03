import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LearnerDashboard from 'Se_Frontend/src/pages/Learner/LearnerDashboard';
import { getUserCourses } from 'Se_Frontend/src/services/courseService';
import { CourseProvider } from 'Se_Frontend/src/contexts/CourseContext';
import { AuthProvider } from 'Se_Frontend/src/contexts/AuthContext'; // Import AuthProvider

// Mock the `getUserCourses` function
vi.mock('../../../src/services/courseService', () => ({
  getUserCourses: vi.fn(),
}));

describe('LearnerDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProviders = (ui) => {
    return render(
      <MemoryRouter>
        <AuthProvider> {/* Wrap with AuthProvider */}
          <CourseProvider>
            {ui}
          </CourseProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('renders the loading spinner while fetching courses', async () => {
    getUserCourses.mockReturnValue(new Promise(() => {}));

    renderWithProviders(<LearnerDashboard />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays an error message when fetching courses fails', async () => {
    getUserCourses.mockRejectedValueOnce(new Error('Failed to fetch courses'));

    renderWithProviders(<LearnerDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Courses')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch courses')).toBeInTheDocument();
    });

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('displays an empty state when no courses are available', async () => {
    getUserCourses.mockResolvedValueOnce([]);

    renderWithProviders(<LearnerDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No Subjects Available')).toBeInTheDocument();
      expect(
        screen.getByText(
          'You are not enrolled in any subjects at the moment. Please wait for your enrollment to be processed or contact your administrator.'
        )
      ).toBeInTheDocument();
    });
  });

  it('renders courses when data is successfully fetched', async () => {
    getUserCourses.mockResolvedValueOnce([
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

    renderWithProviders(<LearnerDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
      expect(screen.getByText('Course 2')).toBeInTheDocument();
      expect(screen.getByText('COURSE101')).toBeInTheDocument();
      expect(screen.getByText('COURSE102')).toBeInTheDocument();
    });

    const courseCards = screen.getAllByRole('button');
    expect(courseCards.length).toBe(3);
  });

  it('handles the "Try Again" button click when fetching courses fails', async () => {
    // Mock the initial failure
    getUserCourses.mockRejectedValueOnce(new Error('Failed to fetch courses'));
  
    renderWithProviders(<LearnerDashboard />);
  
    // Verify the error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to Load Courses')).toBeInTheDocument();
    });
  
    // Mock the successful response on retry
    getUserCourses.mockResolvedValueOnce([
      {
        id: 1,
        name: 'Course 1',
        code: 'COURSE101',
        description: 'Description for Course 1',
        imageUrl: 'https://via.placeholder.com/150',
        studentCount: 10,
      },
    ]);
  
    // Click the "Try Again" button
    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);
  
    // Wait for the courses to be rendered
    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
      expect(screen.getByText('COURSE101')).toBeInTheDocument();
    });
  });
});