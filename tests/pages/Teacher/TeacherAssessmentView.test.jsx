import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TeacherAssessmentView from 'Se_Frontend/src/pages/Teacher/TeacherAssessmentView';
import { AuthProvider } from 'Se_Frontend/src/contexts/AuthContext';
import { CourseProvider } from 'Se_Frontend/src/contexts/CourseContext';
import * as assessmentService from 'Se_Frontend/src/services/assessmentService';

// Mock the necessary dependencies
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useLocation: () => ({
            state: {
                assessment: {
                    id: '123',
                    title: 'Test Assessment',
                    description: 'Test Description',
                    due_date: '2024-01-01T00:00:00Z',
                    duration_minutes: 60,
                    passing_score: 70,
                },
            },
        }),
        useNavigate: () => vi.fn(),
    };
});

vi.mock('Se_Frontend/src/services/assessmentService');

vi.mock('Se_Frontend/src/components/common/layout/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('Se_Frontend/src/components/common/layout/Header', () => ({
    default: () => <div data-testid="header">Header</div>,
}));

vi.mock('Se_Frontend/src/components/common/LoadingSpinner', () => ({
    default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock('Se_Frontend/src/components/common/Modals/Create/CreateQuestionModal', () => ({
    default: ({ isOpen, onClose, onSubmit }) =>
        isOpen ? (
            <div data-testid="create-question-modal">
                <button onClick={onClose}>Close</button>
                <button
                    onClick={() =>
                        onSubmit({
                            question_text: 'Test Question',
                            question_type: 'multiple_choice',
                            points: 10,
                            options: [],
                        })
                    }
                >
                    Submit
                </button>
            </div>
        ) : null,
}));

const mockSubmissions = [
    {
        id: '1',
        studentName: 'John Doe',
        status: 'submitted',
        score: 80,
        maxScore: 100,
    },
];

const mockAssessmentData = {
    id: '123',
    title: 'Test Assessment',
    description: 'Test Description',
    questions: [],
    due_date: '2024-01-01T00:00:00Z',
    duration_minutes: 60,
    passing_score: 70,
};

const renderComponent = () => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                <CourseProvider>
                    <TeacherAssessmentView />
                </CourseProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('TeacherAssessmentView Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Set up default mock responses
        assessmentService.getAssessmentById.mockResolvedValue({
            success: true,
            assessment: mockAssessmentData,
        });
        assessmentService.getAssessmentSubmissions.mockResolvedValue({
            success: true,
            submissions: mockSubmissions,
            pagination: { pages: 1 },
        });
    });

    describe('Initial Rendering', () => {
        it('should render the sidebar and header', () => {
            renderComponent();
            expect(screen.getByTestId('sidebar')).toBeInTheDocument();
            expect(screen.getByTestId('header')).toBeInTheDocument();
        });
    });

    describe('Assessment Data Fetching', () => {
        it('should fetch and display assessment data', async () => {
            renderComponent();

            await waitFor(() => {
                expect(assessmentService.getAssessmentById).toHaveBeenCalledWith('123', true, true);
                expect(screen.getByText('Test Assessment')).toBeInTheDocument();
            });
        });

        it('should handle assessment fetch error', async () => {
            assessmentService.getAssessmentById.mockRejectedValue(new Error('Failed to fetch'));
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText((content, element) => content.includes('Failed to fetch'))).toBeInTheDocument();
            });
        });
    });

    describe('Question Management', () => {
        it('should open create question modal when add question button is clicked', async () => {
            renderComponent();

            await waitFor(() => {
                fireEvent.click(screen.getByText('Add Question'));
                expect(screen.getByTestId('create-question-modal')).toBeInTheDocument();
            });
        });

        it('should handle question creation successfully', async () => {
            assessmentService.createAssessmentQuestion.mockResolvedValue({
                success: true,
                question: {
                    id: '1',
                    question_text: 'Test Question',
                },
            });

            renderComponent();

            await waitFor(() => {
                fireEvent.click(screen.getByText('Add Question'));
            });

            fireEvent.click(screen.getByText('Submit'));

            await waitFor(() => {
                expect(assessmentService.createAssessmentQuestion).toHaveBeenCalled();
            });
        });

        it('should handle question creation error', async () => {
            assessmentService.createAssessmentQuestion.mockRejectedValue(new Error('Creation failed'));
            renderComponent();

            await waitFor(() => {
                fireEvent.click(screen.getByText('Add Question'));
            });

            fireEvent.click(screen.getByText('Submit'));

            await waitFor(() => {
                expect(screen.getByText('Creation failed')).toBeInTheDocument();
            });
        });
    });

    describe('Submission Handling', () => {
        beforeEach(() => {
            assessmentService.getAssessmentSubmissions.mockResolvedValue({
                success: true,
                submissions: mockSubmissions,
                pagination: { pages: 1 },
            });
        });

        it('should display submission data correctly', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
                expect(screen.getByText('80/100')).toBeInTheDocument();
            });
        });

        it('should handle pagination correctly', async () => {
            assessmentService.getAssessmentSubmissions.mockResolvedValue({
                success: true,
                submissions: mockSubmissions,
                pagination: { pages: 2 },
            });

            renderComponent();

            await waitFor(() => {
                const paginationButtons = screen.getAllByRole('button').filter((button) => !isNaN(button.textContent));
                expect(paginationButtons).toHaveLength(2);
            });
        });
    });

    describe('Helper Functions', () => {
        const testSubmission = {
            id: '1',
            studentName: 'John Doe',
            status: 'graded',
            score: 80,
            maxScore: 100,
        };

        it('should format passing score correctly', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Passing Score: 70%')).toBeInTheDocument();
            });
        });

        it('should format date correctly', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(/Due:/)).toBeInTheDocument();
                expect(screen.getByText(/January 1, 2024/)).toBeInTheDocument();
            });
        });

        it('should handle status color coding', async () => {
            // Setup mock response
            assessmentService.getAssessmentSubmissions.mockResolvedValue({
                success: true,
                submissions: [
                    {
                        id: '1',
                        studentName: 'John Doe',
                        status: 'graded',
                        score: 80,
                        maxScore: 100,
                    },
                ],
                pagination: { pages: 1 },
            });

            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
                expect(screen.getByText('80/100')).toBeInTheDocument();
            });
        });
    });
});