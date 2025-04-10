import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import EnrolleeTable from 'Se_Frontend/src/components/specific/enrollments/EnrolleeTable.jsx';

// Mock EnrolleeDetailsModal component
vi.mock('/src/components/common/Modals/Edit/EnrolleeStatusModal.jsx', () => ({
  default: ({ enrolleeId, onClose, onApprove, onReject }) => (
    <div data-testid="enrollee-status-modal">
      <button onClick={() => onClose()}>Close</button>
      <button onClick={() => onApprove()}>Approve</button>
      <button onClick={() => onReject()}>Reject</button>
    </div>
  )
}));

// Mock ReportViewerModal
vi.mock('../../common/Modals/View/ReportViewerModal', () => ({
  default: ({ isOpen, onClose }) => isOpen && (
    <div data-testid="report-viewer-modal">
      <button onClick={onClose}>Close Report</button>
    </div>
  )
}));

// Mock EnrolleeDetailsModal which is used but not imported in the component
global.EnrolleeDetailsModal = ({ enrollee, onClose, onReject }) => (
  <div data-testid="enrollee-details-modal">
    <button onClick={onClose}>Close</button>
    <button onClick={onReject}>Reject</button>
  </div>
);

// Mock RejectEnrolleeModal which is used but not imported in the component
global.RejectEnrolleeModal = ({ onClose, onConfirm }) => (
  <div data-testid="reject-enrollee-modal">
    <button onClick={onClose}>Cancel</button>
    <button onClick={() => onConfirm('Rejected for testing')}>Confirm</button>
  </div>
);

// Mock the reportService
vi.mock('Se_Frontend/src/services/reportService', () => ({
  generateEnrollmentReport: vi.fn().mockResolvedValue({
    output: vi.fn().mockReturnValue(new Blob(['pdf content']))
  })
}));

// Mock URL.createObjectURL because it's not available in the test environment
const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
global.URL = {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: vi.fn()
};

describe('EnrolleeTable', () => {
  const enrollees = [
    { id: 1, fullName: 'John Doe', status: 'approved', enrollmentDate: '2023-01-01' },
    { id: 2, fullName: 'Jane Smith', status: 'pending', enrollmentDate: '2023-01-02' },
    { id: 3, fullName: 'Alice Johnson', status: 'rejected', enrollmentDate: '2023-01-03' },
  ];

  const onDeleteSelected = vi.fn();
  const onApprove = vi.fn();
  const onReject = vi.fn();
  const onDetailsClick = vi.fn();
  const onPageChange = vi.fn();

  beforeEach(() => {
    onDeleteSelected.mockClear();
    onApprove.mockClear();
    onReject.mockClear();
    onDetailsClick.mockClear();
    onPageChange.mockClear();
  });

  it('renders the EnrolleeTable component with enrollees', () => {
    render(
      <EnrolleeTable
        enrollees={enrollees}
        onDeleteSelected={onDeleteSelected}
        onApprove={onApprove}
        onReject={onReject}
        onDetailsClick={onDetailsClick}
        currentPage={1}
        totalPages={1}
        onPageChange={onPageChange}
      />
    );

    //expect(screen.getByText((content, element) => content.includes('Total Enrollees'))).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
  });

  it('handles checkbox selection', () => {
    render(
      <EnrolleeTable
        enrollees={enrollees}
        onDeleteSelected={onDeleteSelected}
        onApprove={onApprove}
        onReject={onReject}
        onDetailsClick={onDetailsClick}
        currentPage={1}
        totalPages={1}
        onPageChange={onPageChange}
      />
    );

    const checkbox = screen.getAllByRole('checkbox')[1];
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it('handles delete selected records', () => {
    render(
      <EnrolleeTable
        enrollees={enrollees}
        onDeleteSelected={onDeleteSelected}
        onApprove={onApprove}
        onReject={onReject}
        onDetailsClick={onDetailsClick}
        currentPage={1}
        totalPages={1}
        onPageChange={onPageChange}
      />
    );

    const checkbox = screen.getAllByRole('checkbox')[1];
    fireEvent.click(checkbox);
    
    // Find the trash icon button by querying all buttons and finding the one with the correct class
    const buttons = screen.getAllByRole('button');
    const trashButton = buttons.find(button => 
      button.className.includes('text-red-600')
    );
    
    fireEvent.click(trashButton);
    expect(onDeleteSelected).toHaveBeenCalledWith([1]);
  });

  it('handles row action button click to open edit modal', () => {
    render(
      <EnrolleeTable
        enrollees={enrollees}
        onDeleteSelected={onDeleteSelected}
        onApprove={onApprove}
        onReject={onReject}
        onDetailsClick={onDetailsClick}
        currentPage={1}
        totalPages={1}
        onPageChange={onPageChange}
      />
    );
    
    // Find the edit/square pen icon button for the first enrollee
    const row = screen.getByText('John Doe').closest('tr');
    const editButton = within(row).getByRole('button', { title: 'View Details' });
    
    // Click the edit button
    fireEvent.click(editButton);
    
    // Verify that the modal is opened
    expect(screen.getByTestId('enrollee-status-modal')).toBeInTheDocument();
  });

  it('handles filter and search', () => {
    const onSearch = vi.fn();
    
    render(
      <EnrolleeTable
        enrollees={enrollees}
        onDeleteSelected={onDeleteSelected}
        onApprove={onApprove}
        onReject={onReject}
        currentPage={1}
        totalPages={1}
        onPageChange={onPageChange}
        onSearch={onSearch}
        onFilterChange={vi.fn()}
      />
    );

    // Test search functionality with the correct placeholder
    const searchInput = screen.getByPlaceholderText('Search enrollees...');
    fireEvent.change(searchInput, { target: { value: 'Jane' } });
    expect(onSearch).toHaveBeenCalledWith('Jane');
    
    // Test filter functionality
    const filterSelect = screen.getByRole('combobox');
    fireEvent.change(filterSelect, { target: { value: 'approved' } });
    // We can't easily test the filtering effect here as that's handled by onFilterChange prop
  });

  it('handles pagination', () => {
    render(
      <EnrolleeTable
        enrollees={enrollees}
        onDeleteSelected={onDeleteSelected}
        onApprove={onApprove}
        onReject={onReject}
        onDetailsClick={onDetailsClick}
        currentPage={1}
        totalPages={2}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByText('Next'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('handles generate report button click', async () => {
    // Import the mocked service directly to verify it was called
    const { generateEnrollmentReport } = await import('Se_Frontend/src/services/reportService');
    
    render(
      <EnrolleeTable
        enrollees={enrollees}
        onDeleteSelected={onDeleteSelected}
        onApprove={onApprove}
        onReject={onReject}
        onDetailsClick={onDetailsClick}
        currentPage={1}
        totalPages={1}
        onPageChange={onPageChange}
      />
    );

    // Find the desktop version of the button by its class
    const buttons = screen.getAllByRole('button');
    const generateReportButton = buttons.find(button => 
      button.className.includes('hidden md:flex') && button.textContent.includes('Generate Report')
    );
    
    // Click the button
    fireEvent.click(generateReportButton);
    
    // Use waitFor to wait for the async operation to complete
    await waitFor(() => {
      // Verify the mocked service was called with the right data
      expect(generateEnrollmentReport).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 1, fullName: 'John Doe' })
        ])
      );
      // Verify URL.createObjectURL was called (part of the report generation process)
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });
});