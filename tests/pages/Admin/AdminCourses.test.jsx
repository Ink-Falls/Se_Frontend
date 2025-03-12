import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import AdminCourses from '../../../src/pages/Admin/AdminCourses';
import { getCoursesWithGroups } from '../../../src/services/courseService';

// Mock the required services and components
vi.mock('../../../src/services/courseService');
vi.mock('../../../src/components/common/layout/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));
vi.mock('../../../src/components/common/layout/Header', () => ({
    default: () => <div data-testid="header">Header</div>,
}));
vi.mock('../../../src/components/common/Button/Modal', () => ({
    default: ({ children }) => <div data-testid="modal">{children}</div>,
}));
vi.mock('../../../src/components/common/Modals/Delete/DeleteModal', () => ({
    default: ({ onConfirm, onCancel }) => (
        <div data-testid="delete-modal">
            <button onClick={onConfirm}>Confirm</button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    ),
}));
vi.mock('../../../src/components/common/Modals/Add/AddCourse', () => ({
    default: ({ onCourseAdded, onClose }) => (
        <div data-testid="add-course-modal">
            <button
                onClick={() =>
                    onCourseAdded({ id: 'new-id', name: 'New Course' })
                }
            >
                Add
            </button>
            <button onClick={onClose}>Close</button>
        </div>
    ),
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
        getCoursesWithGroups.mockResolvedValue(mockCourses);
    });

    it('renders initial component correctly', async () => {
        render(<AdminCourses />);
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('header')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('Test Course 1')).toBeInTheDocument();
        });
    });

    it('expands course details when clicked', async () => {
        render(<AdminCourses />);
        await waitFor(() => {
            expect(screen.getByText('Test Course 1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Test Course 1'));
        expect(screen.getByText('Test Description 1')).toBeInTheDocument();
    });

    it('handles course editing', async () => {
        render(<AdminCourses />);
        await waitFor(() => {
            expect(screen.getByText('Test Course 1')).toBeInTheDocument();
        });

        // Open dropdown
        const moreButtons = screen.getAllByRole('button');
        const moreButton = moreButtons.find((button) =>
            button.classList.contains('menu-btn')
        );
        fireEvent.click(moreButton);

        // Click edit
        fireEvent.click(screen.getByText('Edit'));
        expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('handles course deletion', async () => {
        render(<AdminCourses />);
        await waitFor(() => {
            expect(screen.getByText('Test Course 1')).toBeInTheDocument();
        });

        // Open dropdown
        const moreButtons = screen.getAllByRole('button');
        const moreButton = moreButtons.find((button) =>
            button.classList.contains('menu-btn')
        );
        fireEvent.click(moreButton);

        // Click delete
        fireEvent.click(screen.getByText('Delete'));
        expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
    });

    it('handles adding new course', async () => {
        render(<AdminCourses />);
        await waitFor(() => {
            expect(screen.getByText('Test Course 1')).toBeInTheDocument();
        });

        // Click add button

        expect(screen.getByTestId('add-course-modal')).toBeInTheDocument();
    });

    it('handles error state', async () => {
        getCoursesWithGroups.mockRejectedValueOnce(
            new Error('Failed to fetch')
        );
        render(<AdminCourses />);

        await waitFor(() => {
            expect(
                screen.getByText(/Failed to fetch courses/)
            ).toBeInTheDocument();
            expect(screen.getByText('Retry')).toBeInTheDocument();
        });
    });

    it('handles empty courses state', async () => {
        getCoursesWithGroups.mockResolvedValueOnce([]);
        render(<AdminCourses />);

        await waitFor(() => {
            expect(
                screen.getByText('No courses available')
            ).toBeInTheDocument();
            expect(
                screen.getByText('Add Your First Course')
            ).toBeInTheDocument();
        });
    });

    it('closes dropdown when clicking outside', async () => {
        render(<AdminCourses />);
        await waitFor(() => {
            expect(screen.getByText('Test Course 1')).toBeInTheDocument();
        });

        // Open dropdown
        const moreButtons = screen.getAllByRole('button');
        const moreButton = moreButtons.find((button) =>
            button.classList.contains('menu-btn')
        );
        fireEvent.click(moreButton);

        // Click outside
        fireEvent.click(document.body);
        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });
});
