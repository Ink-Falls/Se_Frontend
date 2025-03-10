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
        contact_no: '0912-345-6789',
        birth_date: '2000-01-01',
        school_id: '1001',
        year_level: '1',
        email: 'john.doe@example.com',
        password: 'Password123',
        confirm_password: 'Password123',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
    });

    describe('Form Rendering', () => {
        it('renders all form fields correctly', () => {
            render(
                <MemoryRouter>
                    <NewEnrollment />
                </MemoryRouter>
            );

            // Check for main elements
            expect(screen.getByText('Enrollment')).toBeInTheDocument();
            expect(screen.getByLabelText('First Name')).toBeInTheDocument();
            expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
            expect(screen.getByLabelText('Middle Initial')).toBeInTheDocument();
            expect(screen.getByLabelText('Contact No.')).toBeInTheDocument();
            expect(screen.getByLabelText('Birthdate')).toBeInTheDocument();
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
            expect(screen.getByLabelText('Password')).toBeInTheDocument();
            expect(
                screen.getByLabelText('Confirm Password')
            ).toBeInTheDocument();
            expect(screen.getByLabelText('School')).toBeInTheDocument();
            expect(screen.getByLabelText('Year Level')).toBeInTheDocument();
        });

        it('displays initial empty form state', () => {
            render(
                <MemoryRouter>
                    <NewEnrollment />
                </MemoryRouter>
            );

            const inputs = screen.getAllByRole('textbox');
            inputs.forEach((input) => {
                expect(input.value).toBe('');
            });
        });
    });

    describe('Contact Number Formatting', () => {
        it('formats contact number correctly', () => {
            render(
                <MemoryRouter>
                    <NewEnrollment />
                </MemoryRouter>
            );

            const contactInput = screen.getByLabelText('Contact No.');

            // Test different input formats
            fireEvent.change(contactInput, {
                target: { value: '09123456789' },
            });
            expect(contactInput.value).toBe('0912-345-6789');

            fireEvent.change(contactInput, {
                target: { value: '+63912345678' },
            });
            expect(contactInput.value).toBe('0912-345-678');
        });
    });

    describe('Navigation Tests', () => {
        it('navigates to login page when login button is clicked', () => {
            render(
                <MemoryRouter>
                    <NewEnrollment />
                </MemoryRouter>
            );

            fireEvent.click(screen.getByRole('button', { name: /log in/i }));

            expect(mockNavigate).toHaveBeenCalledWith('/Login');
        });
    });
});
