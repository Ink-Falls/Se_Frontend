import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UserStats from 'Se_Frontend/src/components/specific/users/UserStats.jsx';

describe('UserStats', () => {
  it('renders the UserStats component with provided values', () => {
    const totalUsers = 100;
    const totalLearners = 70;
    const totalTeachers = 20;
    const totalAdmins = 10;

    render(
      <UserStats
        totalUsers={totalUsers}
        totalLearners={totalLearners}
        totalTeachers={totalTeachers}
        totalAdmins={totalAdmins}
      />
    );

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText(totalUsers.toString())).toBeInTheDocument();
    expect(screen.getByText('Learners')).toBeInTheDocument();
    expect(screen.getByText(totalLearners.toString())).toBeInTheDocument();
    expect(screen.getByText('Teachers')).toBeInTheDocument();
    expect(screen.getByText(totalTeachers.toString())).toBeInTheDocument();
    expect(screen.getByText('Admins')).toBeInTheDocument();
    expect(screen.getByText(totalAdmins.toString())).toBeInTheDocument();
  });

  it('renders the UserStats component with default values', () => {
    render(<UserStats />);

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Learners')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Teachers')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Admins')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});