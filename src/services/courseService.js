/**
 * @module courseService
 * @description Service module for handling course-related API operations
 */

import { API_BASE_URL } from '../utils/constants';

/**
 * Fetches all courses from the API.
 * @async
 * @function getAllCourses
 * @returns {Promise<Array>} Array of course objects
 * @throws {Error} If the API request fails
 */
export const getAllCourses = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/courses`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw API Response:', data); // Debug log

    // Handle response format where courses are in rows property
    if (data && Array.isArray(data.rows)) {
      return data.rows;
    }
    
    // Fallback to direct array or empty array
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};

/**
 * Fetches a specific course by ID.
 * @async
 * @function getCourseById
 * @param {number|string} courseId - The ID of the course to fetch
 * @returns {Promise<Object|null>} Course object if found, null otherwise
 * @throws {Error} If the API request fails
 */
export const getCourseById = async (courseId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch course');
    }

    const data = await response.json();
    
    // Return only the needed fields with default values
    return {
      id: data.id,
      name: data.name,
      description: data.description || "No description available",
      teacher: "Not assigned",
      learner_group: "Not assigned",
      student_teacher_group: "Not assigned",
      image: "https://miro.medium.com/v2/resize:fit:1200/1*rKl56ixsC55cMAsO2aQhGQ@2x.jpeg"
    };
  } catch (error) {
    console.error(`Error fetching course ${courseId}:`, error);
    return null;
  }
};

/**
 * Assigns a teacher to a course.
 * @async
 * @function assignTeacher
 * @param {number|string} courseId - The ID of the course
 * @param {number|string} teacherId - The ID of the teacher to assign
 * @returns {Promise<Object>} Updated course object
 * @throws {Error} If the API request fails
 */
export const assignTeacher = async (courseId, teacherId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/assign-teacher`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ teacher_id: teacherId }),
    });

    if (!response.ok) throw new Error('Failed to assign teacher');
    return await response.json();
  } catch (error) {
    throw error;
  }
};
