import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import NewEnrollment from '../../../src/pages/Enrollment/NewEnrollment';
import { createEnrollment } from '../../../src/services/enrollmentService';

// Mock dependencies
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

vi.mock('../../../src/services/enrollmentService', () => ({
    createEnrollment: vi.fn(),
}));

describe('NewEnrollment', () => {
    const mockNavigate = vi.fn();
    const validFormData = {
        first_name: 'John',
        last_name: 'Doe',
        middle_initial: 'A',
        contact_no: '09123456789',
        birth_date: '2000-01-01',
        school_id: '1001',
        year_level: '1',
        email: 'john.doe@example.com',
        password: 'Password123!',
        confirm_password: 'Password123!',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
    });

    const getInputByName = (container, name) => {
        return container.querySelector(
            `input[name="${name}"], select[name="${name}"]`
        );
    };

    describe('Form Rendering', () => {
        it('renders initial form elements correctly', () => {
            const { container } = render(
                <MemoryRouter>
                    <NewEnrollment />
                </MemoryRouter>
            );

            expect(screen.getByText('Enrollment')).toBeInTheDocument();
            expect(screen.getByAltText('ARALKADEMY Logo')).toBeInTheDocument();
            expect(screen.getByText('Submit')).toBeInTheDocument();
            expect(screen.getByText('Log In')).toBeInTheDocument();
        });

        it('renders all form fields', () => {
            const { container } = render(
                <MemoryRouter>
                    <NewEnrollment />
                </MemoryRouter>
            );

            const fields = [
                'first_name',
                'last_name',
                'middle_initial',
                'contact_no',
                'birth_date',
                'school_id',
                'year_level',
                'email',
                'password',
                'confirm_password',
            ];

            fields.forEach((name) => {
                expect(getInputByName(container, name)).toBeInTheDocument();
            });
        });
    });

    describe('Form Validation', () => {
        it('shows error for empty required fields', async () => {
            const { container } = render(
                <MemoryRouter>
                    <NewEnrollment />
                </MemoryRouter>
            );

            fireEvent.click(screen.getByText('Submit'));
        });

        it('validates name format', async () => {
            const { container } = render(
                <MemoryRouter>
                    <NewEnrollment />
                </MemoryRouter>
            );

            const firstNameInput = getInputByName(container, 'first_name');
            fireEvent.change(firstNameInput, { target: { value: '123' } });

            fireEvent.click(screen.getByText('Submit'));
        });

        it('validates password match', async () => {
            const { container } = render(
                <MemoryRouter>
                    <NewEnrollment />
                </MemoryRouter>
            );

            const passwordInput = getInputByName(container, 'password');
            const confirmInput = getInputByName(container, 'confirm_password');

            fireEvent.change(passwordInput, {
                target: { value: 'Password123!' },
            });
            fireEvent.change(confirmInput, {
                target: { value: 'Different123!' },
            });

            fireEvent.click(screen.getByText('Submit'));
        });
    });

    describe('Form Submission', () => {
        it('successfully submits form with valid data', async () => {
            createEnrollment.mockResolvedValueOnce({});
            const { container } = render(
                <MemoryRouter>
                    <NewEnrollment />
                </MemoryRouter>
            );

            Object.entries(validFormData).forEach(([name, value]) => {
                const input = getInputByName(container, name);
                fireEvent.change(input, { target: { value } });
            });

            fireEvent.click(screen.getByText('Submit'));
        });

        it('handles submission errors', async () => {
            createEnrollment.mockRejectedValueOnce(
                new Error('Email already exists')
            );
            const { container } = render(
                <MemoryRouter>
                    <NewEnrollment />
                </MemoryRouter>
            );

            Object.entries(validFormData).forEach(([name, value]) => {
                const input = getInputByName(container, name);
                fireEvent.change(input, { target: { value } });
            });

            fireEvent.click(screen.getByText('Submit'));
        });
    });

    describe('Loading State', () => {
        it('shows loading state during submission', async () => {
            createEnrollment.mockImplementation(
                () => new Promise((resolve) => setTimeout(resolve, 100))
            );
            const { container } = render(
                <MemoryRouter>
                    <NewEnrollment />
                </MemoryRouter>
            );

            Object.entries(validFormData).forEach(([name, value]) => {
                const input = getInputByName(container, name);
                fireEvent.change(input, { target: { value } });
            });

            fireEvent.click(screen.getByText('Submit'));

            expect(screen.getByText('Submitting...')).toBeInTheDocument();
            const submitButton = screen.getByText('Submitting...');
            expect(submitButton).toBeDisabled();
        });
    });

    describe('Navigation', () => {
        it('navigates to login page', () => {
            render(
                <MemoryRouter>
                    <NewEnrollment />
                </MemoryRouter>
            );

            fireEvent.click(screen.getByText('Log In'));
            expect(mockNavigate).toHaveBeenCalledWith('/Login');
        });
    });
});
