import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EnrolleeStats from 'Se_Frontend/src/components/specific/enrollments/EnrolleeStats.jsx';

describe('EnrolleeStats', () => {
  it('renders the EnrolleeStats component with default values', () => {
    render(<EnrolleeStats />);

    expect(screen.getByText('Total Enrollees')).toBeInTheDocument();
    expect(screen.getAllByText('0').length).toBe(4);
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('renders the EnrolleeStats component with provided values', () => {
    const totalEnrollees = 100;
    const approvedEnrollees = 70;
    const pendingEnrollees = 20;
    const rejectedEnrollees = 10;

    render(
      <EnrolleeStats
        totalEnrollees={totalEnrollees}
        approvedEnrollees={approvedEnrollees}
        pendingEnrollees={pendingEnrollees}
        rejectedEnrollees={rejectedEnrollees}
      />
    );

    expect(screen.getByText('Total Enrollees')).toBeInTheDocument();
    expect(screen.getByText(totalEnrollees.toString())).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText(approvedEnrollees.toString())).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText(pendingEnrollees.toString())).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(screen.getByText(rejectedEnrollees.toString())).toBeInTheDocument();
  });
});