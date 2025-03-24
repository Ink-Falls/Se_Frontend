import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AssessmentView from 'Se_Frontend/src/pages/Learner/AssessmentView.jsx';

describe('AssessmentView Component', () => {
  const mockNavigate = vi.fn();
  const mockLocation = {
    state: {
      assessment: {
        title: 'Sample Assessment',
        dueDate: '2025-12-31T23:59:59Z',
        status: 'Pending',
        score: null,
        description: 'This is a sample assessment description.',
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mock('react-router-dom', () => ({
      ...vi.importActual('react-router-dom'),
      useNavigate: () => mockNavigate,
      useLocation: () => mockLocation,
    }));
  });

  it('renders the assessment details correctly', () => {
    render(
      <MemoryRouter initialEntries={['/Learner/AssessmentView']}>
        <Routes>
          <Route path="/Learner/AssessmentView" element={<AssessmentView />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Sample Assessment')).toBeInTheDocument();
    expect(screen.getByText('Due: 12/31/2025')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Score: Not graded')).toBeInTheDocument();
    expect(screen.getByText('This is a sample assessment description.')).toBeInTheDocument();
  });

  it('navigates back to assessments when no assessment is provided', () => {
    vi.mock('react-router-dom', () => ({
      ...vi.importActual('react-router-dom'),
      useNavigate: () => mockNavigate,
      useLocation: () => ({ state: null }),
    }));

    render(
      <MemoryRouter initialEntries={['/Learner/AssessmentView']}>
        <Routes>
          <Route path="/Learner/AssessmentView" element={<AssessmentView />} />
        </Routes>
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/Learner/Assessment');
  });

  it('handles file selection correctly', () => {
    render(
      <MemoryRouter initialEntries={['/Learner/AssessmentView']}>
        <Routes>
          <Route path="/Learner/AssessmentView" element={<AssessmentView />} />
        </Routes>
      </MemoryRouter>
    );

    const fileInput = screen.getByLabelText('Upload File');
    const file = new File(['dummy content'], 'example.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText('example.pdf')).toBeInTheDocument();
  });

  it('handles text answer input correctly', () => {
    render(
      <MemoryRouter initialEntries={['/Learner/AssessmentView']}>
        <Routes>
          <Route path="/Learner/AssessmentView" element={<AssessmentView />} />
        </Routes>
      </MemoryRouter>
    );

    const textArea = screen.getByPlaceholderText('Type your answer here...');
    fireEvent.change(textArea, { target: { value: 'This is my answer.' } });

    expect(textArea.value).toBe('This is my answer.');
  });

  it('submits the assessment correctly', async () => {
    render(
      <MemoryRouter initialEntries={['/Learner/AssessmentView']}>
        <Routes>
          <Route path="/Learner/AssessmentView" element={<AssessmentView />} />
        </Routes>
      </MemoryRouter>
    );

    const textArea = screen.getByPlaceholderText('Type your answer here...');
    fireEvent.change(textArea, { target: { value: 'This is my answer.' } });

    const submitButton = screen.getByText('Submit Assessment');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Your Submission')).toBeInTheDocument();
      expect(screen.getByText('This is my answer.')).toBeInTheDocument();
    });
  });

  it('edits the submission correctly', async () => {
    render(
      <MemoryRouter initialEntries={['/Learner/AssessmentView']}>
        <Routes>
          <Route path="/Learner/AssessmentView" element={<AssessmentView />} />
        </Routes>
      </MemoryRouter>
    );

    const textArea = screen.getByPlaceholderText('Type your answer here...');
    fireEvent.change(textArea, { target: { value: 'This is my answer.' } });

    const submitButton = screen.getByText('Submit Assessment');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Your Submission')).toBeInTheDocument();
      expect(screen.getByText('This is my answer.')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Submission');
    fireEvent.click(editButton);

    fireEvent.change(textArea, { target: { value: 'This is my updated answer.' } });
    const updateButton = screen.getByText('Update Submission');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText('This is my updated answer.')).toBeInTheDocument();
    });
  });
});