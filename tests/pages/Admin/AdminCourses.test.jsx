import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import AdminCourses from 'Se_Frontend/src/pages/Admin/AdminCourses';
import { AuthProvider } from 'Se_Frontend/src/contexts/AuthContext';
import { getAllCourses } from 'Se_Frontend/src/services/courseService';

// Mock the required services and components
vi.mock('Se_Frontend/src/services/courseService', () => ({
  getAllCourses: vi.fn(),
}));

const mockCourses = [
  {
    id: '1',
    name: 'Test Course 1',
    description: 'Test Description 1',
    teacher: 'Teacher 1',
    learner_group: 'Group 1',
    student_teacher_group: 'ST Group 1',
  },
  {
    id: '2',
    name: 'Test Course 2',
    description: 'Test Description 2',
    teacher: 'Teacher 2',
    learner_group: 'Group 2',
    student_teacher_group: 'ST Group 2',
  },
];

describe('AdminCourses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAllCourses.mockResolvedValue(mockCourses);
  });

  it('renders the component correctly with courses', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminCourses />
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for courses to load
    await waitFor(() => {
      expect(screen.getByText('Test Course 1')).toBeInTheDocument();
      expect(screen.getByText('Test Course 2')).toBeInTheDocument();
    });
  });

  it('shows an error message when course data fails to load', async () => {
    getAllCourses.mockRejectedValue(new Error('Failed to load courses'));

    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminCourses />
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to Load Courses')).toBeInTheDocument();
    });
  });
});