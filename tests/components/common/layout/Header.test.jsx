import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from 'Se_Frontend/src/components/common/layout/Header.jsx';
import { describe, it, expect, vi } from 'vitest';

describe('Header Component', () => {
  it('should render the title and current date', () => {
    const title = 'Test Title';
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Wrap Header component in MemoryRouter
    render(
      <MemoryRouter>
        <Header title={title} />
      </MemoryRouter>
    );

   // Check if the title is rendered
   const titleElements = screen.getAllByText(title);
   expect(titleElements.length).toBeGreaterThan(0);

   // Check if the current date is rendered
   const dateElements = screen.getAllByText(currentDate);
   expect(dateElements.length).toBeGreaterThan(0);
 });

  it('should render the profile image for mobile view', () => {
    // Wrap Header component in MemoryRouter
    render(
      <MemoryRouter>
        <Header title="Test Title" />
      </MemoryRouter>
    );

    // Check if the profile image is rendered for mobile view
    const profileImage = screen.getAllByAltText('Profile');
    expect(profileImage[0]).toBeInTheDocument();
    expect(profileImage[0]).toHaveClass('w-8 h-8 rounded-full');
  });

  it('should render the profile image for desktop view', () => {
    // Wrap Header component in MemoryRouter
    render(
      <MemoryRouter>
        <Header title="Test Title" />
      </MemoryRouter>
    );

    // Check if the profile image is rendered for desktop view
    const profileImage = screen.getAllByAltText('Profile');
    expect(profileImage[1]).toBeInTheDocument();
    expect(profileImage[1]).toHaveClass('w-8 h-8 md:w-10 md:h-10 rounded-full');
  });

  it('should render the account text for desktop view', () => {
    // Mock localStorage to return a user
    const mockUser = { first_name: 'John', last_name: 'Doe', role: 'student' };
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    getItemSpy.mockReturnValue(JSON.stringify(mockUser));
    
    // Wrap Header component in MemoryRouter
    render(
      <MemoryRouter>
        <Header title="Test Title" />
      </MemoryRouter>
    );

    // Check if the account text is rendered for desktop view
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    // Clean up the mock
    getItemSpy.mockRestore();
  });
});