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
    console.log('Raw course data:', data); // Debug log
    
    // Format courses with required fields
    const formattedCourses = (data.rows || []).map(course => ({
      id: course.id,
      name: course.name,
      description: course.description,
      teacher: course.teacher ? `${course.teacher.first_name} ${course.teacher.last_name}` : "Not assigned",
      learner_group: course.learnerGroup?.name || "Not assigned", // matches the JSON structure
      student_teacher_group: course.studentTeacherGroup?.name || "Not assigned", // matches the JSON structure
      learner_group_id: course.learnerGroup?.group_id || null,
      student_teacher_group_id: course.studentTeacherGroup?.group_id || null
    }));

    return formattedCourses;
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
    
    // Format course with required fields
    return {
      id: data.id,
      name: data.name,
      description: data.description || "No description available",
      teacher: data.teacher ? `${data.teacher.first_name} ${data.teacher.last_name}` : "Not assigned",
      learner_group: data.learnerGroup?.name || "Not assigned",
      student_teacher_group: data.studentTeacherGroup?.name || "Not assigned"
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

/**
 * Fetches course details including groups
 * @param {number} courseId 
 * @returns {Promise<Object>}
 */
export const getCourseDetailsWithGroups = async (courseId) => {
  const token = localStorage.getItem('token');
  try {
    // Fetch course details
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch details for course ${courseId}`);
    }

    const courseData = await response.json();

    // Fetch associated groups
    const groupsResponse = await fetch(`${API_BASE_URL}/courses/${courseId}/groups`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!groupsResponse.ok) {
      throw new Error('Failed to fetch course groups');
    }

    const groupsData = await groupsResponse.json();
    
    // Combine course and group data
    return {
      ...courseData,
      learner_group: groupsData.learner_group || null,
      student_teacher_group: groupsData.student_teacher_group || null,
      learner_group_id: groupsData.learner_group?.id || null,
      student_teacher_group_id: groupsData.student_teacher_group?.id || null
    };
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
};

export const getCoursesWithGroups = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    const data = await response.json();
    
    // Map and format the data consistently
    return (data.rows || []).map(course => ({
      id: course.id,
      name: course.name,
      description: course.description,
      teacher: course.teacher ? `${course.teacher.first_name} ${course.teacher.last_name}` : "Not assigned",
      learner_group: course.learnerGroup?.name || "Not assigned",
      student_teacher_group: course.studentTeacherGroup?.name || "Not assigned", 
      learner_group_id: course.learnerGroup?.group_id || null,
      student_teacher_group_id: course.studentTeacherGroup?.group_id || null,
      image: course.image || "https://miro.medium.com/v2/resize:fit:1200/1*rKl56ixsC55cMAsO2aQhGQ@2x.jpeg"
    }));
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

/**
 * Creates a new course
 * @param {Object} courseData - The course data to create
 * @returns {Promise<Object>} The created course
 */
export const createCourse = async (courseData) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...courseData,
        image: "https://miro.medium.com/v2/resize:fit:1200/1*rKl56ixsC55cMAsO2aQhGQ@2x.jpeg" // Default placeholder image
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create course');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};
