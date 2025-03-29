import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SubmissionHistoryDropdown from 'Se_Frontend/src/components/assessment/SubmissionHistoryDropdown';
import { getUserSubmission } from 'Se_Frontend/src/services/assessmentService';

vi.mock('Se_Frontend/src/services/assessmentService', () => ({
  getUserSubmission: vi.fn(),
}));

describe('SubmissionHistoryDropdown Component', () => {
  const mockSubmissions = [
    {
      id: 1,
      submit_time: '2025-03-25T10:00:00Z',
      status: 'graded',
      total_score: 80,
    },
    {
      id: 2,
      submit_time: '2025-03-24T10:00:00Z',
      status: 'submitted',
      total_score: 70,
    },
  ];

  const mockProps = {
    assessmentId: 1,
    currentSubmission: null,
    onSelectSubmission: vi.fn(),
    maxScore: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', async () => {
    getUserSubmission.mockReturnValue(new Promise(() => {})); // Mock a pending promise

    render(<SubmissionHistoryDropdown {...mockProps} />);

    expect(screen.getByRole('status')).toBeInTheDocument(); // Check for loading skeleton
  });

  it('renders error state', async () => {
    getUserSubmission.mockRejectedValueOnce(new Error('Failed to fetch submissions'));

    render(<SubmissionHistoryDropdown {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch submissions')).toBeInTheDocument();
    });
  });

  it('renders "No submissions found" when no submissions are available', async () => {
    getUserSubmission.mockResolvedValueOnce({ success: true, submission: null });

    render(<SubmissionHistoryDropdown {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('No submissions found')).toBeInTheDocument();
    });
  });

  it('renders the dropdown with submissions', async () => {
    getUserSubmission.mockResolvedValueOnce({
      success: true,
      submission: mockSubmissions[0],
    });

    render(<SubmissionHistoryDropdown {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Submission')).toBeInTheDocument();
      expect(screen.getByText('Score: 80/100')).toBeInTheDocument();
      expect(screen.getByText('graded')).toBeInTheDocument();
    });
  });

  it('toggles the dropdown menu', async () => {
    getUserSubmission.mockResolvedValueOnce({
      success: true,
      submission: mockSubmissions[0],
    });

    render(<SubmissionHistoryDropdown {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Submission')).toBeInTheDocument();
    });

    const dropdownButton = screen.getByRole('button', { name: 'Submission' });
    fireEvent.click(dropdownButton);

    expect(screen.getByText('Attempt 1')).toBeInTheDocument();
  });

  it('handles submission selection', async () => {
    getUserSubmission.mockResolvedValueOnce({
      success: true,
      submission: mockSubmissions[0],
    });

    render(<SubmissionHistoryDropdown {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Submission')).toBeInTheDocument();
    });

    const dropdownButton = screen.getByRole('button', { name: /submission/i });
    fireEvent.click(dropdownButton);

    const attemptButton = screen.getByText('Attempt 1');
    fireEvent.click(attemptButton);

    expect(mockProps.onSelectSubmission).toHaveBeenCalledWith(mockSubmissions[0]);
  });
});