import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RejectEnrolleeModal from 'Se_Frontend/src/components/specific/enrollments/RejectEnrolleeModal.jsx';

describe('RejectEnrolleeModal', () => {
  const onClose = vi.fn();
  const onConfirm = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
    onConfirm.mockClear();
  });

  it('renders the RejectEnrolleeModal component', () => {
    render(<RejectEnrolleeModal onClose={onClose} onConfirm={onConfirm} />);

    expect(screen.getByText('Reject Enrollment')).toBeInTheDocument();
    expect(screen.getByText('Choose reason/s')).toBeInTheDocument();
    expect(screen.getByText('Unverifiable information')).toBeInTheDocument();
    expect(screen.getByText('Duplicate Application')).toBeInTheDocument();
    expect(screen.getByText('Does Not Meet Eligibility Criteria')).toBeInTheDocument();
    expect(screen.getByText('Late Submission')).toBeInTheDocument();
    expect(screen.getByText('Capacity Reached')).toBeInTheDocument();
    expect(screen.getByText('Applicant Withdrawal Application')).toBeInTheDocument();
  });

  it('handles close button click', () => {
    render(<RejectEnrolleeModal onClose={onClose} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('handles confirm button click with selected reason', () => {
    render(<RejectEnrolleeModal onClose={onClose} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByLabelText('Unverifiable information'));
    fireEvent.click(screen.getByText('Confirm Reject'));
    expect(onConfirm).toHaveBeenCalledWith('Unverifiable information');
  });

  it('handles reason selection', () => {
    render(<RejectEnrolleeModal onClose={onClose} onConfirm={onConfirm} />);
    const reasonCheckbox = screen.getByLabelText('Duplicate Application');
    fireEvent.click(reasonCheckbox);
    expect(reasonCheckbox.checked).toBe(true);
  });
});