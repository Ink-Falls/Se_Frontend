import { render, screen, fireEvent } from '@testing-library/react';
import NewEnrollment from 'Se_Frontend/src/components/NewEnrollment.jsx';  // Adjust the import according to your file structure
import { MemoryRouter, Route, Routes } from 'react-router-dom';

describe('NewEnrollment Component', () => {
  it('should render the enrollment form correctly', () => {
    render(
      <MemoryRouter initialEntries={['/enrollment']}>
        <Routes>
          <Route path="/enrollment" element={<NewEnrollment />} />
        </Routes>
      </MemoryRouter>
    );

    // Check if the form elements are in the document
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/middle name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contact no./i)).toBeInTheDocument();
    expect(screen.getByLabelText(/birthdate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password', { selector: 'input[name="password"]' })).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password', { selector: 'input[name="confirmPassword"]' })).toBeInTheDocument();
    expect(screen.getByLabelText(/school/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/year level/i)).toBeInTheDocument();
    expect(screen.getByText(/submit/i)).toBeInTheDocument();
  });

  it('should handle input changes', () => {
    render(
      <MemoryRouter initialEntries={['/enrollment']}>
        <Routes>
          <Route path="/enrollment" element={<NewEnrollment />} />
        </Routes>
      </MemoryRouter>
    );

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const middleNameInput = screen.getByLabelText(/middle name/i);
    const contactNoInput = screen.getByLabelText(/contact no./i);
    const birthdateInput = screen.getByLabelText(/birthdate/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText('Password', { selector: 'input[name="password"]' });
    const confirmPasswordInput = screen.getByLabelText('Confirm Password', { selector: 'input[name="confirmPassword"]' });
    const schoolSelect = screen.getByLabelText(/school/i);
    const yearLevelSelect = screen.getByLabelText(/year level/i);

    // Simulate typing in the input fields
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(middleNameInput, { target: { value: 'M' } });
    fireEvent.change(contactNoInput, { target: { value: '1234567890' } });
    fireEvent.change(birthdateInput, { target: { value: '2000-01-01' } });
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(schoolSelect, { target: { value: 'School A' } });
    fireEvent.change(yearLevelSelect, { target: { value: 'Freshman' } });

    // Verify if the input values are updated
    expect(firstNameInput.value).toBe('John');
    expect(lastNameInput.value).toBe('Doe');
    expect(middleNameInput.value).toBe('M');
    expect(contactNoInput.value).toBe('1234567890');
    expect(birthdateInput.value).toBe('2000-01-01');
    expect(emailInput.value).toBe('john.doe@example.com');
    expect(passwordInput.value).toBe('password123');
    expect(confirmPasswordInput.value).toBe('password123');
    expect(schoolSelect.value).toBe('School A');
    expect(yearLevelSelect.value).toBe('Freshman');
  });

  it('should handle form submission', () => {
    render(
      <MemoryRouter initialEntries={['/enrollment']}>
        <Routes>
          <Route path="/enrollment" element={<NewEnrollment />} />
          <Route path="/Home" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const middleNameInput = screen.getByLabelText(/middle name/i);
    const contactNoInput = screen.getByLabelText(/contact no./i);
    const birthdateInput = screen.getByLabelText(/birthdate/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText('Password', { selector: 'input[name="password"]' });
    const confirmPasswordInput = screen.getByLabelText('Confirm Password', { selector: 'input[name="confirmPassword"]' });
    const schoolSelect = screen.getByLabelText(/school/i);
    const yearLevelSelect = screen.getByLabelText(/year level/i);
    const submitButton = screen.getByText(/submit/i);

    // Simulate typing in the input fields
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(middleNameInput, { target: { value: 'M' } });
    fireEvent.change(contactNoInput, { target: { value: '1234-567-890' } });
    fireEvent.change(birthdateInput, { target: { value: '2000-01-01' } });
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(schoolSelect, { target: { value: 'School A' } });
    fireEvent.change(yearLevelSelect, { target: { value: 'Freshman' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Check that navigation happens (you may mock the `navigate` function for testing)
    expect(screen.getByText(/home page/i)).toBeInTheDocument();
  });
});