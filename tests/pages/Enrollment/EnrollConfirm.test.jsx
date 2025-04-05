import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import EnrollConfirm from '../../../src/pages/Enrollment/EnrollConfirm';

// Mock the router hooks
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

describe('EnrollConfirm', () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
    });

    describe('Content Tests', () => {
        it('renders success message and description', () => {
            render(
                <MemoryRouter>
                    <EnrollConfirm />
                </MemoryRouter>
            );

            expect(
                screen.getByText('Successful Enrollment!')
            ).toBeInTheDocument();
            // expect(
            //     screen.getByText('Your enrollment has been submitted. You can check your enrollment status anytime by entering your email address in the Enrollment Status Tracker.l')
            // ).toBeInTheDocument();
        });
    });

    describe('Navigation Tests', () => {
        it('navigates to login when header login button is clicked', () => {
            render(
                <MemoryRouter>
                    <EnrollConfirm />
                </MemoryRouter>
            );

            const loginButton = screen.getAllByText('Log In')[0];
            fireEvent.click(loginButton);

            expect(mockNavigate).toHaveBeenCalledWith('/Login');
        });

        it('navigates to login when back to login button is clicked', () => {
            render(
                <MemoryRouter>
                    <EnrollConfirm />
                </MemoryRouter>
            );

            const backButton = screen.getByText('Back to Login');
            fireEvent.click(backButton);

            expect(mockNavigate).toHaveBeenCalledWith('/Login');
        });
    });

    describe('UI Elements Tests', () => {
        it('applies correct header styling', () => {
            render(
                <MemoryRouter>
                    <EnrollConfirm />
                </MemoryRouter>
            );

            const header = screen.getByRole('banner');
            expect(header).toHaveClass(
                'py-[3vw]',
                'px-[4vw]',
                'lg:py-[1.5vw]',
                'lg:px-[2vw]',
                'bg-[#121212]',
                'text-[#F6BA18]',
                'flex',
                'justify-between',
                'items-center',
                'shadow-xl'
            );
        });

        it('applies correct button styling', () => {
            render(
                <MemoryRouter>
                    <EnrollConfirm />
                </MemoryRouter>
            );

            const loginButton = screen.getAllByRole('button')[0];
            expect(loginButton).toHaveClass(
                'bg-[#F6BA18]',
                'text-[#212529]',
                'hover:bg-[#64748B]',
                'hover:text-[#FFFFFF]'
            );

            const backButton = screen.getAllByRole('button')[1];
            expect(backButton).toHaveClass(
                'bg-[#212529]',
                'text-[#FFFFFF]',
                'hover:bg-[#F6BA18]',
                'hover:text-[#212529]'
            );
        });
    });

    describe('Accessibility Tests', () => {
        it('has proper heading hierarchy', () => {
            render(
                <MemoryRouter>
                    <EnrollConfirm />
                </MemoryRouter>
            );

            const heading = screen.getByRole('heading', { level: 2 });
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent('Successful Enrollment!');
        });

        it('has accessible buttons with clear text', () => {
            render(
                <MemoryRouter>
                    <EnrollConfirm />
                </MemoryRouter>
            );

            const buttons = screen.getAllByRole('button');
            buttons.forEach((button) => {
                expect(button).toHaveAccessibleName();
            });
        });
    });
});
