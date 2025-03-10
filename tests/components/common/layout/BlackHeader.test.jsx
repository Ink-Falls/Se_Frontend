import React from 'react';
import { render, screen } from '@testing-library/react';
import BlackHeader from 'Se_Frontend/src/components/common/layout/BlackHeader.jsx'; // Adjust the import according to your file structure
import { describe, it, expect } from 'vitest';

describe('BlackHeader Component', () => {
  it('should render the title as a string', () => {
    render(<BlackHeader title="Test Title" />);

    // Check if the title is rendered
    expect(screen.getByText(/test title/i)).toBeInTheDocument();
  });

  it('should render the title as a React element', () => {
    render(<BlackHeader title={<h2>Test Title Element</h2>} />);

    // Check if the title element is rendered
    expect(screen.getByText(/test title element/i)).toBeInTheDocument();
  });

  it('should render the count if provided', () => {
    render(<BlackHeader title="Test Title" count={5} />);

    // Check if the count is rendered
    expect(screen.getByText(/5/i)).toBeInTheDocument();
  });

  it('should render children elements', () => {
    render(
      <BlackHeader title="Test Title">
        <button>Child Button</button>
      </BlackHeader>
    );

    // Check if the child element is rendered
    expect(screen.getByText(/child button/i)).toBeInTheDocument();
  });

  it('should apply additional classes to children elements', () => {
    render(
      <BlackHeader title="Test Title">
        <button className="extra-class">Child Button</button>
      </BlackHeader>
    );

    // Check if the child element has the additional classes
    const childButton = screen.getByText(/child button/i);
    expect(childButton).toHaveClass('extra-class');
    expect(childButton).toHaveClass('p-2 text-gray-300 hover:text-white rounded-md transition-colors duration-150');
  });
});