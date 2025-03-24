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
    expect(screen.getByDisplayValue('0912-345-6789')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1990-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1001')).toBeInTheDocument();
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

  it('formats contact number correctly', () => {
    render(<EditUserModal user={user} onClose={onClose} onSave={onSave} />);
    const contactNoInput = screen.getByLabelText('Contact No:');

    fireEvent.change(contactNoInput, { target: { value: '09123456789' } });
    expect(contactNoInput.value).toBe('0912-345-6789');

    fireEvent.change(contactNoInput, { target: { value: '639123456789' } });
    expect(contactNoInput.value).toBe('0912-345-6789');
  });

  it('saves the user with updated data', async () => {
    render(<EditUserModal user={user} onClose={onClose} onSave={onSave} />);
    const firstNameInput = screen.getByLabelText('First Name:');
    const lastNameInput = screen.getByLabelText('Last Name:');
    const emailInput = screen.getByLabelText('Email:');

    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
    fireEvent.change(emailInput, { target: { value: 'jane.smith@example.com' } });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        ...user,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
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