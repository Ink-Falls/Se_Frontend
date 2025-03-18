/**
 * @module courseService
 * @description Service module for handling course-related API operations
 */

import { API_BASE_URL } from '../utils/constants';
import { getUserGroupIds } from './groupService';
import tokenService from './tokenService';

/**
 * Fetches all courses with their associated groups
 * @returns {Promise<Array>} Array of course objects with group information
 * @throws {Error} If the API request fails
 */
export const getAllCourses = async () => {
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
      user_id: course.user_id || course.teacher?.id, // Add this line to include user_id explicitly
      teacher_id: course.user_id || course.teacher?.id, // Keep both for compatibility
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
 * Fetches courses for the currently logged-in learner
 * @returns {Promise<Array>} Array of course objects
 */
export const getLearnerCourses = async () => {
  try {
    const token = tokenService.getAccessToken();
    if (!token) throw new Error('No authentication token');

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.id) throw new Error('User data not found');

    // First get user's groups
    const userGroups = await getUserGroupIds(user.id);
    console.log('User groups:', userGroups);

    // Then fetch all courses
    const response = await fetch(`${API_BASE_URL}/courses`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch courses');
    const data = await response.json();

    // Filter courses where learner_group_id matches any of user's group_ids
    const accessibleCourses = (data.rows || []).filter(course => 
      userGroups.includes(course.learner_group_id)
    );

    return formatCourses(accessibleCourses);
  } catch (error) {
    console.error('Error fetching learner courses:', error);
    throw error;
  }
};

/**
 * Fetches courses assigned to the logged-in teacher
 * @returns {Promise<Array>} Array of course objects
 */
export const getTeacherCourses = async () => {
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user'));
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  if (!currentUser?.id) {
    throw new Error('User data not found');
  }

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
    
    // Filter courses where user_id matches current user's id
    const teacherCourses = (data.rows || [])
      .filter(course => course.user_id === currentUser.id);

    return formatCourses(teacherCourses);
  } catch (error) {
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
    const formattedData = {
      name: courseData.name,
      description: courseData.description,
      user_id: parseInt(courseData.user_id),
      learner_group_id: parseInt(courseData.learner_group_id),
      student_teacher_group_id: parseInt(courseData.student_teacher_group_id)
    };

    console.log('Sending formatted data:', formattedData);

    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formattedData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create course');
    }

    const newCourse = await response.json();
    
    // Add a small delay before fetching the complete course data
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Attempt to fetch complete course data
      const completeCourse = await getCourseById(newCourse.id);
      if (completeCourse) {
        return completeCourse;
      }
    } catch (fetchError) {
      console.log('Could not fetch complete course data, returning basic course data');
    }

    // Fallback to basic course data if fetch fails
    return {
      id: newCourse.id,
      name: formattedData.name,
      description: formattedData.description,
      teacher: "Not assigned",
      learner_group: "Not assigned",
      student_teacher_group: "Not assigned",
      learner_group_id: formattedData.learner_group_id,
      student_teacher_group_id: formattedData.student_teacher_group_id
    };

  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

/**
 * Fetches a specific course by ID
 * @param {number|string} courseId - The ID of the course to fetch
 * @returns {Promise<Object>} Course object if found, null otherwise
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
 * Updates an existing course
 * @param {number|string} courseId - The ID of the course to update
 * @param {Object} courseData - The updated course data
 * @returns {Promise<Object>} The updated course
 */
export const updateCourse = async (courseId, courseData) => {
  const token = localStorage.getItem('token');
  try {
    const formattedData = {
      name: courseData.name,
      description: courseData.description,
      user_id: parseInt(courseData.user_id),
      learner_group_id: parseInt(courseData.learner_group_id),
      student_teacher_group_id: parseInt(courseData.student_teacher_group_id)
    };

    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formattedData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update course');
    }

    const updatedCourse = await response.json();
    return updatedCourse;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

/**
 * Deletes a course by ID
 * @param {number|string} courseId - The ID of the course to delete
 * @returns {Promise<void>}
 * @throws {Error} If the deletion fails
 */
export const deleteCourse = async (courseId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete course');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

/**
 * Gets courses accessible to the current user based on their group memberships
 * @returns {Promise<Array>} Array of courses the user has access to
 */
export const getUserAccessibleCourses = async () => {
  try {
    // Get current user from token
    const token = tokenService.getAccessToken();
    if (!token) throw new Error('No authentication token');

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.id) throw new Error('User data not found');

    // Get user's groups
    const userGroups = await getUserGroupIds(user.id);
    
    // Get all courses
    const response = await fetch(`${API_BASE_URL}/courses`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch courses');
    const data = await response.json();

    // Filter courses based on user's groups
    const courses = (data.rows || []).filter(course => {
      if (user.role === 'learner') {
        return userGroups.includes(course.learner_group_id);
      } else if (user.role === 'student_teacher') {
        return userGroups.includes(course.student_teacher_group_id);
      }
      return false;
    });

    return formatCourses(courses);
  } catch (error) {
    console.error('Error fetching user accessible courses:', error);
    throw error;
  }
};

// Add this helper function before formatCourses
const generateCourseCode = (courseName, courseId) => {
  const courseTags = {
    FIL: /\b(?:FILIPINO|FIL|FILIPINO\s+SUBJECT|FILIPINO\s+STUDIES)\b/i,
    ENG: /\b(?:ENGLISH|ENG|ENGLISH\s+SUBJECT|ENGLISH\s+STUDIES)\b/i,
    MATH: /\b(?:MATHEMATICS|MATH|MATHS|MATEMATIKA)\b/i,
    SCI: /\b(?:SCIENCE|SCI|NATURAL\s+SCIENCE|GENERAL\s+SCIENCE)\b/i,
    AP: /\b(?:ARALING\s+PANLIPUNAN|AP|SOCIAL\s+STUDIES)\b/i,
    EsP: /\b(?:EDUKASYON\s+SA\s+PAGPAPAKATAO|ESP|EsP|VALUES\s+EDUCATION)\b/i
  };

  const name = courseName.toUpperCase();
  const id = String(courseId).padStart(3, '0');

  for (const [prefix, pattern] of Object.entries(courseTags)) {
    if (pattern.test(name)) {
      return `${prefix}-${id}`;
    }
  }

  return `COURSE-${id}`;
};

// Helper function to format course data consistently
const formatCourses = (courses) => {
  return courses.map(course => ({
    id: course.id,
    name: course.name,
    code: generateCourseCode(course.name, course.id),
    description: course.description,
    teacher: course.teacher_name || 'Not assigned',
    learner_group_id: course.learner_group_id,
    student_teacher_group_id: course.student_teacher_group_id,
    studentCount: Math.floor(Math.random() * 30) + 10, // Consider replacing with actual count
    imageUrl: course.imageUrl || "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg"
  }));
};
