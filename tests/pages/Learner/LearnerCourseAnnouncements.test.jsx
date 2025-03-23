import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LearnerCourseAnnouncements from '../../../src/pages/Learner/LearnerCourseAnnouncements';
import { AuthProvider } from '../../../src/contexts/AuthContext';

describe('LearnerCourseAnnouncements Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sidebar, header, and announcements component correctly', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LearnerCourseAnnouncements />
        </AuthProvider>
      </MemoryRouter>
    );

    // Check if the sidebar is rendered
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /modules/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /announcements/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /assessments/i })).toBeInTheDocument();

    // Check if the header is rendered
    const courseTitles = screen.getAllByText('Course Name');
    expect(courseTitles[0]).toBeInTheDocument();
    //expect(screen.getByText((content, element) => content.includes('COURSE 101') && element.tagName.toLowerCase() === 'span')).toBeInTheDocument();


      // Adjust index if necessary


    // Check if the announcements component is rendered
    expect(screen.getByText('Test Reminder')).toBeInTheDocument();
    expect(screen.getByText('Project Reminder')).toBeInTheDocument();
    expect(screen.getByText('Tutoring Available')).toBeInTheDocument();
  });

  it('displays the correct number of announcements', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LearnerCourseAnnouncements />
        </AuthProvider>
      </MemoryRouter>
    );

    // Check if the correct number of announcements is displayed
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('sorts announcements by newest first', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LearnerCourseAnnouncements />
        </AuthProvider>
      </MemoryRouter>
    );

    const sortButton = screen.getByRole('button', { name: /newest first/i });
    fireEvent.click(sortButton);

    const sortedAnnouncements = screen.getAllByRole('listitem');
    expect(sortedAnnouncements[0]).toHaveTextContent('Tutoring Available');
    expect(sortedAnnouncements[1]).toHaveTextContent('Project Reminder');
    expect(sortedAnnouncements[2]).toHaveTextContent('Test Reminder');
  });

  it('sorts announcements by oldest first', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LearnerCourseAnnouncements />
        </AuthProvider>
      </MemoryRouter>
    );

    const sortButton = screen.getByRole('button', { name: /arrowupdown/i });
    fireEvent.click(sortButton); // First click sorts by newest first
    fireEvent.click(sortButton); // Second click sorts by oldest first

    const sortedAnnouncements = screen.getAllByRole('listitem');
    expect(sortedAnnouncements[0]).toHaveTextContent('Test Reminder');
    expect(sortedAnnouncements[1]).toHaveTextContent('Project Reminder');
    expect(sortedAnnouncements[2]).toHaveTextContent('Tutoring Available');
  });

  it('navigates to the correct route when an announcement is clicked', () => {
    const mockNavigate = vi.fn();
    render(
      <MemoryRouter>
        <AuthProvider>
          <LearnerCourseAnnouncements />
        </AuthProvider>
      </MemoryRouter>
    );

    // Simulate clicking on an announcement
    fireEvent.click(screen.getByText('Test Reminder'));

    // Check if the navigate function was called with the correct route
    expect(mockNavigate).toHaveBeenCalledWith('/Learner/AnnouncementDetails/1');
  });
});