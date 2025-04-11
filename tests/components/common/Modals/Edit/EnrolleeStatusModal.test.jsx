import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EnrolleeDetailsModal from 'Se_Frontend/src/components/common/Modals/Edit/EnrolleeStatusModal.jsx';
import { getEnrollmentById } from 'Se_Frontend/src/services/enrollmentService.js';

vi.mock('Se_Frontend/src/services/enrollmentService.js');

describe('EnrolleeDetailsModal', () => {
  const onClose = vi.fn();
  const onReject = vi.fn();
  const onApprove = vi.fn();
  const enrolleeId = '123';

  const enrolleeData = {
    first_name: 'John',
    last_name: 'Doe',
    middle_initial: 'A',
    email: 'john.doe@example.com',
    contact_no: '09123456789',
    birth_date: '1990-01-01',
    year_level: '3',
    school_id: '1001',
    status: 'pending',
  };

  beforeEach(() => {
    onClose.mockClear();
    onReject.mockClear();
    onApprove.mockClear();
    getEnrollmentById.mockResolvedValue(enrolleeData);
  });

  it('renders the modal with enrollee data', async () => {
    render(<EnrolleeDetailsModal enrolleeId={enrolleeId} onClose={onClose} onReject={onReject} onApprove={onApprove} />);
    
    await waitFor(() => {
      expect(screen.getByText('Enrollee Details')).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Doe')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('09123456789')).toBeInTheDocument();
      expect(screen.getByText('1/1/1990')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Asuncion Consunji Elementary School (ACES)')).toBeInTheDocument();
      expect(screen.getByText('not assigned yet')).toBeInTheDocument();
      expect(screen.getByText('Brgy. Imelda, Samal, Bataan')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  it('handles approve action', async () => {
    // Mock successful approval response
    onApprove.mockResolvedValue({ message: "Enrollment approved successfully" });
    
    render(<EnrolleeDetailsModal enrolleeId={enrolleeId} onClose={onClose} onReject={onReject} onApprove={onApprove} />);
    
    await waitFor(() => screen.getByText('Approve'));
    fireEvent.click(screen.getByText('Approve'));

    await waitFor(() => {
      expect(onApprove).toHaveBeenCalledWith(enrolleeId);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('handles reject action', async () => {
    render(<EnrolleeDetailsModal enrolleeId={enrolleeId} onClose={onClose} onReject={onReject} onApprove={onApprove} />);
    
    await waitFor(() => screen.getByText('Reject'));
    fireEvent.click(screen.getByText('Reject'));

    await waitFor(() => {
      expect(onReject).toHaveBeenCalledWith(enrolleeId);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('handles close button click', async () => {
    render(<EnrolleeDetailsModal enrolleeId={enrolleeId} onClose={onClose} onReject={onReject} onApprove={onApprove} />);
    
    await waitFor(() => screen.getByText('Close'));
    fireEvent.click(screen.getByText('Close'));

    expect(onClose).toHaveBeenCalled();
  });

  it('shows loading state initially', () => {
    render(<EnrolleeDetailsModal enrolleeId={enrolleeId} onClose={onClose} onReject={onReject} onApprove={onApprove} />);
    expect(screen.getByText('Loading enrollment details...')).toBeInTheDocument();
  });

  it('shows error message if enrollee data fails to load', async () => {
    getEnrollmentById.mockRejectedValue(new Error('Failed to load enrollee details'));
    render(<EnrolleeDetailsModal enrolleeId={enrolleeId} onClose={onClose} onReject={onReject} onApprove={onApprove} />);
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load enrollee details')).toBeInTheDocument();
    });
  });

  it('shows approval error if year level is missing', async () => {
    const enrolleeWithoutYearLevel = { ...enrolleeData, year_level: '' };
    getEnrollmentById.mockResolvedValue(enrolleeWithoutYearLevel);
    render(<EnrolleeDetailsModal enrolleeId={enrolleeId} onClose={onClose} onReject={onReject} onApprove={onApprove} />);
    
    await waitFor(() => screen.getByText('Approve'));
    fireEvent.click(screen.getByText('Approve'));

    await waitFor(() => {
      expect(screen.getByText('Cannot approve: Year level is missing')).toBeInTheDocument();
    });
  });
});