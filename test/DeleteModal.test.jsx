// DeleteModal.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DeleteModal from "../src/components/DeleteModal.jsx"; // Adjust path if necessary

describe("DeleteModal Component", () => {
  it("should render the modal with correct text content", () => {
    render(<DeleteModal onClose={() => {}} onConfirm={() => {}} />);

    // Check for modal title
    expect(screen.getByText("Delete Module?")).toBeInTheDocument();

    // Check for confirmation message
    expect(
      screen.getByText(
        "Are you sure you want to delete this module? This action cannot be undone."
      )
    ).toBeInTheDocument();

    // Check for "Cancel" button
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();

    // Check for "Delete" button
    expect(screen.getByRole("button", { name: /Delete/i })).toBeInTheDocument();
  });

  it('should call onClose when the "Cancel" button is clicked', () => {
    const onCloseMock = vi.fn(); // Create a mock function for onClose
    render(<DeleteModal onClose={onCloseMock} onConfirm={() => {}} />);

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1); // Assert that onCloseMock was called once
  });

  it('should call onConfirm when the "Delete" button is clicked', () => {
    const onConfirmMock = vi.fn(); // Create a mock function for onConfirm
    render(<DeleteModal onClose={() => {}} onConfirm={onConfirmMock} />);

    const deleteButton = screen.getByRole("button", { name: /Delete/i });
    fireEvent.click(deleteButton);

    expect(onConfirmMock).toHaveBeenCalledTimes(1); // Assert that onConfirmMock was called once
  });

  it("should have the correct CSS classes for styling (basic check)", () => {
    const { container } = render(
      <DeleteModal onClose={() => {}} onConfirm={() => {}} />
    );
    const modalOverlay = container.firstChild; // The outermost div
    const modalContent = modalOverlay.firstChild; // The inner modal content div

    expect(modalOverlay).toHaveClass(
      "fixed",
      "inset-0",
      "bg-black",
      "bg-opacity-50",
      "flex",
      "justify-center",
      "items-center",
      "z-50"
    );
    expect(modalContent).toHaveClass(
      "bg-white",
      "p-6",
      "rounded-lg",
      "shadow-lg",
      "w-80"
    );
  });
});
