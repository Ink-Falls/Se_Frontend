import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AnnouncementDetails from 'Se_Frontend/src/pages/Teacher/TeacherAnnouncementDetails';
import { CourseProvider } from 'Se_Frontend/src/contexts/CourseContext';
import { AuthProvider } from 'Se_Frontend/src/contexts/AuthContext'; // Import AuthProvider

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('TeacherAnnouncementDetails Component', () => {
  const mockSelectedCourse = {
    id: 1,
    name: 'Sample Course',
    code: 'COURSE101',
  };

  const renderComponent = (announcementId) => {
    render(
      <AuthProvider> {/* Wrap the component with AuthProvider */}
        <CourseProvider value={{ selectedCourse: mockSelectedCourse }}>
          <MemoryRouter initialEntries={[`/Teacher/AnnouncementDetails/${announcementId}`]}>
            <Routes>
              <Route path="/Teacher/AnnouncementDetails/:id" element={<AnnouncementDetails />} />
            </Routes>
          </MemoryRouter>
        </CourseProvider>
      </AuthProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the announcement details correctly', () => {
    renderComponent('1');
  
    const announcementHeaders = screen.getAllByText('Test Reminder');
    expect(announcementHeaders.length).toBeGreaterThan(0); // Ensure at least one match
    expect(announcementHeaders[0]).toBeInTheDocument(); // Verify the first match
  
    expect(screen.getByText('Your test is scheduled for December 10.')).toBeInTheDocument();
    expect(screen.getByText('Make sure to prepare well for the upcoming test on December 10.')).toBeInTheDocument();
    expect(screen.getByText('10 minutes ago')).toBeInTheDocument();
  });

  it('navigates back to the previous page when the back button is clicked', () => {
  renderComponent('1');

  // Query the button using its aria-label
  const backButton = screen.getByRole('button', { name: /back/i });
  expect(backButton).toBeInTheDocument();

  fireEvent.click(backButton);

  expect(mockNavigate).toHaveBeenCalledWith(-1);
});

  it('opens and closes the edit modal', async () => {
    renderComponent('1');

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(screen.getByText('Edit Announcement')).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Edit Announcement')).not.toBeInTheDocument();
  });

  it('saves the edited announcement', async () => {
    renderComponent('1');

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    const typeInput = screen.getByPlaceholderText('Enter announcement type');
    const fullTextInput = screen.getByPlaceholderText('Enter full text');
    const saveButton = screen.getByText('Save');

    fireEvent.change(typeInput, { target: { value: 'Updated Test Reminder' } });
    fireEvent.change(fullTextInput, { target: { value: 'Updated full text for the test reminder.' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.queryByText('Edit Announcement')).not.toBeInTheDocument();
    });

    // Verify the updated announcement is displayed
    expect(screen.getByText('Updated Test Reminder')).toBeInTheDocument();
    expect(screen.getByText('Updated full text for the test reminder.')).toBeInTheDocument();
  });

  it('opens and closes the delete modal', async () => {
    renderComponent('1');

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(screen.getByText('Are you sure you want to delete this announcement?')).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Are you sure you want to delete this announcement?')).not.toBeInTheDocument();
  });

  it('deletes the announcement and navigates back', async () => {
    renderComponent('1');

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  it('displays "Announcement not found" if the announcement ID is invalid', () => {
    renderComponent('999'); // Invalid ID

    expect(screen.getByText('Announcement not found')).toBeInTheDocument();
  });

  it('redirects to the dashboard if no course is selected', () => {
    render(
      <AuthProvider> {/* Wrap with AuthProvider */}
        <CourseProvider value={{ selectedCourse: null }}>
          <MemoryRouter initialEntries={['/Teacher/AnnouncementDetails/1']}>
            <Routes>
              <Route path="/Teacher/AnnouncementDetails/:id" element={<AnnouncementDetails />} />
            </Routes>
          </MemoryRouter>
        </CourseProvider>
      </AuthProvider>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/Teacher/Dashboard');
  });
});