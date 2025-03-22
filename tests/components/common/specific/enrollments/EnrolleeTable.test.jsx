import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EnrolleeTable from 'Se_Frontend/src/components/specific/enrollments/EnrolleeTable.jsx';

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

    expect(screen.getByText('Total Enrollees')).toBeInTheDocument();
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
    fireEvent.click(screen.getByText('Delete Selected'));
    expect(onDeleteSelected).toHaveBeenCalledWith([1]);
  });

  it('handles row click to show details modal', () => {
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

    fireEvent.click(screen.getByText('John Doe'));
    expect(onDetailsClick).toHaveBeenCalledWith(enrollees[0]);
  });

  it('handles filter and search', () => {
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

    fireEvent.change(screen.getByPlaceholderText('Search by name...'), { target: { value: 'Jane' } });
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
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

  it('handles generate report', async () => {
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

    fireEvent.click(screen.getByText('Generate Report'));
    await waitFor(() => {
      expect(screen.getByText('Report Viewer')).toBeInTheDocument();
    });
  });
});