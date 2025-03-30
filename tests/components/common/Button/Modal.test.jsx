import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from 'Se_Frontend/src/components/common/Button/Modal.jsx'; // Adjust the import according to your file structure
import { describe, it, expect, vi } from 'vitest';

describe('Modal Component', () => {
    it('should render the modal with title and content', () => {
        render(
            <Modal isOpen={true}>
            <h1>Test Modal</h1>
            <p>Modal Content</p>
          </Modal>
        );
    
        // Check if the modal elements are in the document
        expect(screen.getByText(/test modal/i)).toBeInTheDocument();
        expect(screen.getByText(/modal content/i)).toBeInTheDocument();
      });

  it('should call onClose when the close button is clicked', () => {
    const onClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={onClose}>
        <h1>Test Modal</h1>
        <p>Modal Content</p>
      </Modal>
    );

    // Simulate clicking the close button using aria-label instead of text content
    fireEvent.click(screen.getByLabelText('Close modal'));

    // Check if the onClose function was called
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not render the modal when isOpen is false', () => {
    render(
      <Modal title="Test Modal" isOpen={false}>
        <p>Modal Content</p>
      </Modal>
    );

    // Check if the modal elements are not in the document
    expect(screen.queryByText(/test modal/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/modal content/i)).not.toBeInTheDocument();
  });
});