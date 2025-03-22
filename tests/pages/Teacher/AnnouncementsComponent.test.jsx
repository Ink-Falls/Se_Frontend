import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AnnouncementsComponent from '../../../src/pages/Teacher/AnnouncementsComponent';

describe('AnnouncementsComponent', () => {
    const mockAnnouncements = [
        {
            id: 1,
            type: 'test reminder',
            time: '2h ago',
            description: 'Math test tomorrow',
            userImage: 'test.jpg',
        },
    ];

    it('renders empty state correctly', () => {
        render(<AnnouncementsComponent announcements={[]} />);
        expect(
            screen.getByText('No announcements available')
        ).toBeInTheDocument();
    });

    it('renders announcements when data exists', () => {
        render(<AnnouncementsComponent announcements={mockAnnouncements} />);
        expect(screen.getByText('Math test tomorrow')).toBeInTheDocument();
        expect(screen.getByText('test reminder')).toBeInTheDocument();
        expect(screen.getByText('2h ago')).toBeInTheDocument();
    });

    it('applies correct styles for test reminder type', () => {
        render(<AnnouncementsComponent announcements={mockAnnouncements} />);
        const typeElement = screen.getByText('test reminder');
        expect(typeElement.className).toContain('bg-blue-100');
        expect(typeElement.className).toContain('text-blue-800');
    });

    it('handles unknown announcement types with default style', () => {
        const unknownTypeAnnouncement = [
            {
                ...mockAnnouncements[0],
                type: 'unknown',
            },
        ];
        render(
            <AnnouncementsComponent announcements={unknownTypeAnnouncement} />
        );
        const typeElement = screen.getByText('unknown');
        expect(typeElement.className).toContain('bg-gray-100');
        expect(typeElement.className).toContain('text-gray-800');
    });

    it('calls onAnnouncementClick with correct parameters', () => {
        const mockClick = vi.fn();
        const courseId = 'course123';

        render(
            <AnnouncementsComponent
                announcements={mockAnnouncements}
                onAnnouncementClick={mockClick}
                courseId={courseId}
            />
        );

        fireEvent.click(screen.getByText('Math test tomorrow'));
        expect(mockClick).toHaveBeenCalledWith(1, courseId);
    });

    it('handles missing onAnnouncementClick prop', () => {
        render(<AnnouncementsComponent announcements={mockAnnouncements} />);
        fireEvent.click(screen.getByText('Math test tomorrow'));
        // Should not throw error when onClick handler is missing
    });
});
