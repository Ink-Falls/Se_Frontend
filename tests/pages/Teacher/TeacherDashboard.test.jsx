import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../../../src/pages/Teacher/TeacherDashboard';
import * as courseService from '../../../src/services/courseService';

// Mock CourseContext
vi.mock('../../../src/contexts/CourseContext', () => ({
    useCourse: () => ({
        setSelectedCourse: vi.fn(),
    }),
}));

// Mock dependencies
vi.mock('../../../src/services/courseService');
vi.mock('../../../src/components/common/layout/Sidebar', () => ({
    default: ({ navItems }) => (
        <div data-testid="sidebar">
            {navItems.map((item, index) => (
                <div key={index} data-testid="nav-item">
                    {item.text}
                </div>
            ))}
        </div>
    ),
}));
vi.mock('../../../src/components/common/layout/Header', () => ({
    default: ({ title }) => <div data-testid="header">{title}</div>,
}));
vi.mock('../../../src/components/common/layout/MobileNavbar', () => ({
    default: () => <div data-testid="mobile-navbar">MobileNavbar</div>,
}));
vi.mock('../../../src/components/common/LoadingSpinner', () => ({
    default: () => <div data-testid="loading-spinner">Loading...</div>,
}));
vi.mock('../../../src/services/courseService', () => ({
    getTeacherCourses: vi.fn(),
  }));
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockCourseData = [
    {
        id: 1,
        name: 'Test Course',
        code: 'TC101',
        description: 'Test Description',
        imageUrl: 'test.jpg',
        studentCount: 10,
    },
    {
        id: 2,
        name: 'Another Course',
        code: 'AC102',
        description: 'Another Description',
        imageUrl: 'another.jpg',
        studentCount: 15,
    },
];

describe('TeacherDashboard', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        sessionStorage.clear();
        global.window.scrollTo = vi.fn();
        // Set default mock implementation
        courseService.getUserCourses.mockResolvedValue([]);
    });

    const renderDashboard = () => {
        return render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );
    };

    describe('Initial Render and Layout', () => {
        it('should render all layout components', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByTestId('sidebar')).toBeInTheDocument();
                expect(screen.getByTestId('header')).toBeInTheDocument();
                expect(screen.getByTestId('mobile-navbar')).toBeInTheDocument();
            });
        });

        it('should render navigation items correctly', async () => {
            renderDashboard();
            await waitFor(() => {
                const navItems = screen.getAllByTestId('nav-item');
                expect(navItems.length).toBeGreaterThan(0);
                expect(navItems[0]).toHaveTextContent('Courses');
                expect(navItems[1]).toHaveTextContent('Notifications');
            });
        });
    });

    describe('Data Fetching and Display', () => {
        it('should fetch and display multiple courses', async () => {
            courseService.getUserCourses.mockResolvedValueOnce(
                mockCourseData
            );
            console.log(courseService.getTeacherCourses.mock.calls);
            renderDashboard();
            screen.debug();

            await waitFor(() => {
                expect(screen.getByText('Test Course')).toBeInTheDocument();
                expect(screen.getByText('Another Course')).toBeInTheDocument();
                expect(screen.getByText('TC101')).toBeInTheDocument();
                expect(screen.getByText('AC102')).toBeInTheDocument();
            });
        });*/

        it('should handle cached data correctly', async () => {
            const cachedData = {
                data: mockCourseData,
                timestamp: Date.now(),
            };
            sessionStorage.setItem(
                'teacherCourses',
                JSON.stringify(cachedData)
            );

            renderDashboard();

            await waitFor(() => {
                expect(screen.getByText('Test Course')).toBeInTheDocument();
            });
            expect(courseService.getUserCourses).not.toHaveBeenCalled();
        });

        it('should refresh data when cache is expired', async () => {
            const oldCache = {
                data: mockCourseData,
                timestamp: Date.now() - 6 * 60 * 1000,
            };
            sessionStorage.setItem('teacherCourses', JSON.stringify(oldCache));

            courseService.getUserCourses.mockResolvedValueOnce(
                mockCourseData
            );
            renderDashboard();

            await waitFor(() => {
                expect(courseService.getUserCourses).toHaveBeenCalled();
            });
        });
    });

    describe('Error Handling', () => {
        it('should display error state when API fails', async () => {
            courseService.getUserCourses.mockRejectedValueOnce(
                new Error('API Error')
            );
            renderDashboard();

            await waitFor(() => {
                expect(
                    screen.getByText('Failed to Load Courses')
                ).toBeInTheDocument();
                expect(screen.getByText('Try Again')).toBeInTheDocument();
            });
        });

        it('should handle retry action in error state', async () => {
            courseService.getUserCourses.mockRejectedValueOnce(
                new Error('API Error')
            );
            renderDashboard();

            await waitFor(() => {
                expect(screen.getByText('Try Again')).toBeInTheDocument();
            });

            const reloadMock = vi.fn();
            Object.defineProperty(window, 'location', {
                value: { reload: reloadMock },
                writable: true,
            });

            fireEvent.click(screen.getByText('Try Again'));
            expect(reloadMock).toHaveBeenCalled();
        });
    });

    describe('Empty State', () => {
        it('should display empty state when no courses are available', async () => {
            courseService.getUserCourses.mockResolvedValueOnce([]);
            renderDashboard();

            await waitFor(() => {
                expect(
                    screen.getByText('No Courses Available')
                ).toBeInTheDocument();
                expect(
                    screen.getByText(
                        /You don't have any courses assigned to you/
                    )
                ).toBeInTheDocument();
            });
        });
    });

    describe('Course Interaction', () => {
        it('should handle course selection and navigation', async () => {
            courseService.getUserCourses.mockResolvedValueOnce(
                mockCourseData
            );
            renderDashboard();

            await waitFor(() => {
                expect(screen.getByText('Test Course')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Test Course'));
            expect(mockNavigate).toHaveBeenCalledWith('/Teacher/CourseModules');
        });
    });

    describe('Loading State', () => {
        it('should show and hide loading spinner appropriately', async () => {
            courseService.getUserCourses.mockResolvedValueOnce(
                mockCourseData
            );
            renderDashboard();

            // Initially loading spinner should be present
            expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

            // After data loads, loading spinner should disappear
            await waitFor(() => {
                expect(
                    screen.queryByTestId('loading-spinner')
                ).not.toBeInTheDocument();
            });
        });
    });
});
