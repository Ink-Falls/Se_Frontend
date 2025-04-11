import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditUserModal from 'Se_Frontend/src/components/common/Modals/Edit/EditUserModal.jsx';

describe('EditUserModal', () => {
  const onClose = vi.fn();
  const onSave = vi.fn();
  const user = {
    first_name: 'John',
    last_name: 'Doe',
    middle_initial: 'A',
    email: 'john.doe@example.com',
    contact_no: '09123456789',
    birth_date: '1990-01-01',
    school_id: '1001',
    role: 'learner',
  };

  beforeEach(() => {
    onClose.mockClear();
    onSave.mockClear();
  });

  it('renders the modal with existing user data', () => {
    render(<EditUserModal user={user} onClose={onClose} onSave={onSave} />);
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('09123456789')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1990-01-01')).toBeInTheDocument();
    
    // For select elements, use querySelector to find it directly
    const schoolSelect = document.querySelector('#school');
    expect(schoolSelect.value).toBe('1001');
    
    // Hidden input for role
    expect(screen.getByDisplayValue('learner')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    render(<EditUserModal user={user} onClose={onClose} onSave={onSave} />);
    const firstNameInput = screen.getByLabelText('First Name:');
    const lastNameInput = screen.getByLabelText('Last Name:');
    const emailInput = screen.getByLabelText('Email:');

    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
    fireEvent.change(emailInput, { target: { value: 'jane.smith@example.com' } });

    expect(firstNameInput.value).toBe('Jane');
    expect(lastNameInput.value).toBe('Smith');
    expect(emailInput.value).toBe('jane.smith@example.com');
  });

  it('formats contact number correctly', async () => {
    render(<EditUserModal user={user} onClose={onClose} onSave={onSave} />);
    
    // Instead of testing the formatted display, we'll test the submission logic
    // which removes hyphens from the contact number
    const firstNameInput = screen.getByLabelText('First Name:');
    const contactNoInput = screen.getByLabelText('Contact No:');
    const emailInput = screen.getByLabelText('Email:');
    
    // Change contact number and save
    fireEvent.change(contactNoInput, { target: { value: '0912-345-6789' } });
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    
    // Update email to use a valid domain that passes validation
    fireEvent.change(emailInput, { target: { value: 'jane.doe@gmail.com' } });
    
    // Click save to trigger the submission
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Verify that onSave is called with the cleaned contact number
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          contact_no: '09123456789',
        })
      );
    });
  });

  it('saves the user with updated data', async () => {
    render(<EditUserModal user={user} onClose={onClose} onSave={onSave} />);
    const firstNameInput = screen.getByLabelText('First Name:');
    const lastNameInput = screen.getByLabelText('Last Name:');
    const emailInput = screen.getByLabelText('Email:');

    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
    fireEvent.change(emailInput, { target: { value: 'jane.smith@gmail.com' } });
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        ...user,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@gmail.com',
        contact_no: '09123456789',
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('handles close button click', () => {
    render(<EditUserModal user={user} onClose={onClose} onSave={onSave} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});