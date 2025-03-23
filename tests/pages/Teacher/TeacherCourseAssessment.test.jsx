import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import TeacherCourseAssessment from '../../../src/pages/Teacher/TeacherCourseAssessment';
import { useCourse } from '../../../src/contexts/CourseContext';
import { getCourseAssessments } from '../../../src/services/assessmentService';

// Mock all dependencies
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

vi.mock('../../../src/contexts/CourseContext', () => ({
    useCourse: vi.fn(),
}));

vi.mock('../../../src/services/assessmentService', () => ({
    getCourseAssessments: vi.fn(),
}));

// Mock all required components
vi.mock('../../../src/components/common/layout/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('../../../src/components/common/layout/Header', () => ({
    default: () => <div data-testid="header">Header</div>,
}));

vi.mock('../../../src/components/common/LoadingSpinner', () => ({
    default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock(
    '../../../src/components/common/Modals/Create/CreateAssessmentModal',
    () => ({
        default: ({ isOpen, onClose }) =>
            isOpen ? (
                <div data-testid="create-assessment-modal">
                    Create Assessment Modal
                </div>
            ) : null,
    })
);

vi.mock(
    '../../../src/components/common/Modals/Edit/EditAssessmentModal',
    () => ({
        default: ({ isOpen, onClose }) =>
            isOpen ? (
                <div data-testid="edit-assessment-modal">
                    Edit Assessment Modal
                </div>
            ) : null,
    })
);

vi.mock('../../../src/components/common/Modals/Delete/DeleteModal', () => ({
    default: ({ onClose, onConfirm, message }) => (
        <div data-testid="delete-modal">{message}</div>
    ),
}));

describe('TeacherCourseAssessment', () => {
    const mockNavigate = vi.fn();
    const mockSelectedCourse = {
        id: '123',
        name: 'Test Course',
        code: 'TEST101',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        vi.mocked(useCourse).mockReturnValue({
            selectedCourse: mockSelectedCourse,
        });
    });

    it('should show loading state initially', () => {
        vi.mocked(getCourseAssessments).mockResolvedValueOnce({
            success: true,
            assessments: [],
        });
        render(<TeacherCourseAssessment />);
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should redirect to dashboard if no course selected', () => {
        vi.mocked(useCourse).mockReturnValue({ selectedCourse: null });
        render(<TeacherCourseAssessment />);
        expect(mockNavigate).toHaveBeenCalledWith('/Teacher/Dashboard');
    });

    it('should display error state when fetch fails', async () => {
        vi.mocked(getCourseAssessments).mockRejectedValueOnce(
            new Error('Failed to fetch')
        );
        render(<TeacherCourseAssessment />);

        await waitFor(() => {
            expect(
                screen.getByText(/Failed to Load Assessments/i)
            ).toBeInTheDocument();
        });
    });

    it('should show empty state when no assessments', async () => {
        vi.mocked(getCourseAssessments).mockResolvedValueOnce({
            success: true,
            assessments: [],
        });
        render(<TeacherCourseAssessment />);

        await waitFor(() => {
            expect(
                screen.getByText(/No Assessments Available/i)
            ).toBeInTheDocument();
        });
    });

    it('should render list of assessments', async () => {
        const mockAssessments = [
            {
                id: '1',
                title: 'Test Assessment',
                description: 'Test Description',
                type: 'quiz',
                duration_minutes: 60,
                passing_score: 70,
                max_score: 100,
                due_date: '2024-01-01T12:00:00',
            },
        ];

        vi.mocked(getCourseAssessments).mockResolvedValueOnce({
            success: true,
            assessments: mockAssessments,
        });

        render(<TeacherCourseAssessment />);

        await waitFor(() => {
            expect(screen.getByText('Test Assessment')).toBeInTheDocument();
            expect(screen.getByText('Test Description')).toBeInTheDocument();
            expect(screen.getByText(/60 minutes/)).toBeInTheDocument();
            expect(screen.getByText(/Score: 70\/100/)).toBeInTheDocument();
        });
    });

    it('should handle assessment click navigation', async () => {
        const mockAssessment = {
            id: '1',
            title: 'Test Assessment',
        };

        vi.mocked(getCourseAssessments).mockResolvedValueOnce({
            success: true,
            assessments: [mockAssessment],
        });

        render(<TeacherCourseAssessment />);

        await waitFor(() => {
            fireEvent.click(screen.getByText('Test Assessment'));
        });

        expect(mockNavigate).toHaveBeenCalledWith(
            `/Teacher/Assessment/View/${mockAssessment.id}`,
            expect.any(Object)
        );
    });

    it('should open create modal', async () => {
        vi.mocked(getCourseAssessments).mockResolvedValueOnce({
            success: true,
            assessments: [],
        });

        render(<TeacherCourseAssessment />);

        await waitFor(() => {
            fireEvent.click(screen.getByText(/Create Assessment/));
        });

        expect(
            screen.getByTestId('create-assessment-modal')
        ).toBeInTheDocument();
    });

    it('should handle edit assessment', async () => {
        const mockAssessment = {
            id: '1',
            title: 'Test Assessment',
        };

        vi.mocked(getCourseAssessments).mockResolvedValueOnce({
            success: true,
            assessments: [mockAssessment],
        });

        render(<TeacherCourseAssessment />);
    });

    it('should handle delete assessment', async () => {
        const mockAssessment = {
            id: '1',
            title: 'Test Assessment',
        };

        vi.mocked(getCourseAssessments).mockResolvedValueOnce({
            success: true,
            assessments: [mockAssessment],
        });

        render(<TeacherCourseAssessment />);
    });

    it('should format dates correctly', async () => {
        const mockAssessment = {
            id: '1',
            title: 'Test Assessment',
            due_date: '2024-01-01T12:00:00',
        };

        vi.mocked(getCourseAssessments).mockResolvedValueOnce({
            success: true,
            assessments: [mockAssessment],
        });

        render(<TeacherCourseAssessment />);

        await waitFor(() => {
            expect(screen.getByText(/January 1, 2024/)).toBeInTheDocument();
        });
    });
});
