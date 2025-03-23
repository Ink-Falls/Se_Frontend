import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import React from 'react';
import { CourseProvider, useCourse } from '../../src/contexts/CourseContext';

describe('CourseContext', () => {
    it('provides default values', () => {
        let contextValue;
        const TestComponent = () => {
            contextValue = useCourse();
            return null;
        };

        render(
            <CourseProvider>
                <TestComponent />
            </CourseProvider>
        );

        expect(contextValue.selectedCourse).toBeNull();
        expect(typeof contextValue.setSelectedCourse).toBe('function');
    });

    it('allows updating the selected course', async () => {
        let contextValue;
        const TestComponent = () => {
            contextValue = useCourse();
            return null;
        };

        render(
            <CourseProvider>
                <TestComponent />
            </CourseProvider>
        );

        expect(contextValue.selectedCourse).toBeNull();

        const newCourse = { id: 1, name: 'Test Course' };

        await act(async () => {
            contextValue.setSelectedCourse(newCourse);
        });

        expect(contextValue.selectedCourse).toEqual(newCourse);
    });
});