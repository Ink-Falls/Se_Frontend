import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MaintenanceMode from 'Se_Frontend/src/pages/Maintenance/MaintenanceMode';

// Mock the image file
vi.mock('/src/assets/images/ARALKADEMYLOGO.png', () => ({
  default: 'mock-logo.png', // Mock the image file with a string
}));

describe('MaintenanceMode Component', () => {
  it('renders the component correctly', () => {
    render(<MaintenanceMode />);

    // Verify the logo is displayed
    const logo = screen.getByAltText('ARALKADEMY Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'mock-logo.png');

    // Verify the header text
    const headerText = screen.getByText('System Maintenance');
    expect(headerText).toBeInTheDocument();

    // Verify the maintenance message
    const maintenanceMessage = screen.getByText(
      /We're currently performing scheduled maintenance to improve your learning experience. Please check back later./i
    );
    expect(maintenanceMessage).toBeInTheDocument();
  });

  it('displays the correct maintenance duration from environment variables', () => {
    // Mock the environment variable
    vi.stubEnv('VITE_MAINTENANCE_DURATION', '4');

    // Render the component
    render(<MaintenanceMode />);

    // Verify the maintenance duration
    const durationText = screen.getByText(/Expected Duration: 4 hours/i);
    expect(durationText).toBeInTheDocument();
  });
});