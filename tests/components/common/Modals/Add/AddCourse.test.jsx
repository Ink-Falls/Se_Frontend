import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddCourse from 'Se_Frontend/src/components/common/Modals/Add/AddCourse.jsx'; // Adjust the import according to your file structure
import { describe, it, expect, vi } from 'vitest';
import { createCourse } from 'Se_Frontend/src/services/courseService.js'; // Adjust the import according to your file structure

vi.mock('Se_Frontend/src/services/courseService.js', () => ({
  createCourse: vi.fn(),
}));

describe('AddCourse Component', () => {
  const mockOnClose = vi.fn();
  const mockOnCourseAdded = vi.fn();

  const renderComponent = (isOpen = true) => {
    return render(
      <AddCourse isOpen={isOpen} onClose={mockOnClose} onCourseAdded={mockOnCourseAdded} />
    );
  };

  it('should render the modal with form fields', () => {
    renderComponent();

    // Check if the modal title is rendered
    expect(screen.getByText(/add new course/i)).toBeInTheDocument();

    // Check if the form fields are rendered
    expect(screen.getByLabelText(/course name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teacher/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/learner group/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/student teacher group/i)).toBeInTheDocument();
  });

  it('should call onClose when the cancel button is clicked', () => {
    renderComponent();

    // Click the cancel button
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Check if the onClose function was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should submit the form and call onCourseAdded on success', async () => {
    createCourse.mockResolvedValueOnce({ id: 1, name: 'Test Course' });

    renderComponent();

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/course name/i), { target: { value: 'Test Course' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/teacher/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/learner group/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/student teacher group/i), { target: { value: '1' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create course/i }));

    // Check if the createCourse function was called with the correct data
    await waitFor(() => {
      expect(createCourse).toHaveBeenCalledWith({
        name: 'Test Course',
        description: 'Test Description',
        user_id: '1',
        learner_group_id: '1',
        student_teacher_group_id: '1',
      });
    });

    // Check if the onCourseAdded function was called
    expect(mockOnCourseAdded).toHaveBeenCalledWith({ id: 1, name: 'Test Course' });

    // Check if the onClose function was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display an error message on form submission failure', async () => {
    createCourse.mockRejectedValueOnce(new Error('Failed to create course'));

    renderComponent();

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/course name/i), { target: { value: 'Test Course' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/teacher/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/learner group/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/student teacher group/i), { target: { value: '1' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create course/i }));

    // Check if the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to create course/i)).toBeInTheDocument();
    });

    // Check if the onCourseAdded function was not called
    expect(mockOnCourseAdded).not.toHaveBeenCalled();

    // Check if the onClose function was not called
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should fetch and populate form data when the modal is opened', async () => {
    const teachers = [{ id: 1, first_name: 'John', last_name: 'Doe' }];
    const learnerGroups = [{ id: 1, name: 'Group 1' }];
    const studentTeacherGroups = [{ id: 1, name: 'Group 2' }];

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce({ rows: teachers }),
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(learnerGroups),
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(studentTeacherGroups),
      });

    renderComponent();

    // Check if the teachers, learner groups, and student teacher groups are fetched and populated
    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
      expect(screen.getByText(/group 1/i)).toBeInTheDocument();
      expect(screen.getByText(/group 2/i)).toBeInTheDocument();
    });
  });
});