import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
//import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LearnerCourseAssessment from 'Se_Frontend/src/pages/Learner/LearnerCourseAssessment';
import { useCourse } from 'Se_Frontend/src/contexts/CourseContext';
import { getCourseAssessments, getUserSubmission } from 'Se_Frontend/src/services/assessmentService';
import { AuthProvider } from 'Se_Frontend/src/contexts/AuthContext';

// Mock the useCourse hook
vi.mock('Se_Frontend/src/contexts/CourseContext', () => ({
  useCourse: vi.fn(),
}));

// Mock the assessment service functions
vi.mock('Se_Frontend/src/services/assessmentService', () => ({
  getCourseAssessments: vi.fn(),
  getUserSubmission: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LearnerCourseAssessment Component', () => {
  const mockCourse = { id: 1, name: 'Test Course', code: 'TC101' };
  const mockAssessment = {
    id: 1,
    title: 'Test Assessment',
    description: 'This is a test assessment.',
    duration_minutes: 60,
    passing_score: 70,
    due_date: '2025-12-31T23:59:59Z',
    type: 'quiz',
    questions: [
      {
        id: 1,
        question_text: 'What is 2 + 2?',
        question_type: 'multiple_choice',
        points: 10,
        options: [
          { id: 1, text: '3', is_correct: false },
          { id: 2, text: '4', is_correct: true },
        ],
      },
    ],
  };

  const mockSubmission = {
    id: 1,
    assessment_id: 1,
    status: 'submitted',
    submit_time: '2025-12-30T23:59:59Z',
    is_late: false,
    answers: [
      { question_id: 1, selected_option_id: 2, points_awarded: 10 },
    ],
    total_score: 10,
  };

  const renderComponent = () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[{ pathname: '/Learner/CourseAssessment' }]}>
          <Routes>
            <Route path="/Learner/CourseAssessment" element={<LearnerCourseAssessment />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useCourse.mockReturnValue({ selectedCourse: mockCourse });
    getCourseAssessments.mockResolvedValue({ success: true, assessments: [mockAssessment] });
    getUserSubmission.mockResolvedValue({ success: true, submission: mockSubmission });
  });

  it('renders without crashing', async () => {
    renderComponent();

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Test Assessment/i)).toBeInTheDocument());
  });

  it('displays assessment details correctly', async () => {
    renderComponent();

    await waitFor(() => {
      const assessmentTitle = screen.getAllByText('Test Assessment')[0];
      expect(assessmentTitle).toBeInTheDocument();
      expect(screen.getByText('This is a test assessment.')).toBeInTheDocument();
      expect(screen.getByText('60 minutes')).toBeInTheDocument();
      expect(screen.getByText('Passing: 70%')).toBeInTheDocument();
      expect(screen.getByText('Due: December 31, 2025, 11:59 PM')).toBeInTheDocument();
    });
  });

  it('handles assessment click correctly', async () => {
    renderComponent();

    await waitFor(() => expect(screen.getByText(/Test Assessment/i)).toBeInTheDocument());

    const assessmentCard = screen.getAllByText(/Test Assessment/i)[0].closest('div');
    fireEvent.click(assessmentCard);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/Learner/Assessment/View/1', {
        state: { assessment: mockAssessment },
      });
    });
  });

  it('displays submission status and score correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Submitted')).toBeInTheDocument();
      expect(screen.getByText('10/10')).toBeInTheDocument();
    });
  });

  it('handles no assessments available', async () => {
    getCourseAssessments.mockResolvedValue({ success: true, assessments: [] });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No Assessments Available')).toBeInTheDocument();
      expect(screen.getByText('There are no assessments for this course yet.')).toBeInTheDocument();
    });
  });

  it('handles error fetching assessments', async () => {
    getCourseAssessments.mockRejectedValue(new Error('Failed to fetch assessments'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Assessments')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch assessments')).toBeInTheDocument();
    });
  });
});