/**
 * @module courseService
 * @description Service module for handling course-related API operations
 */

import { API_BASE_URL } from '../utils/constants';

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
export const getLearnerCourses = async () => { // NOT YET WORKINGGGGGGGGGGGGGGGGGGGGGGGGG
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE_URL}/courses/learner`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    const data = await response.json();
    
    return (data.rows || []).map(course => ({
      id: course.id,
      name: course.name,
      description: course.description,
      code: `COURSE-${String(course.id).padStart(3, '0')}`,
      studentCount: Math.floor(Math.random() * 30) + 10,
      imageUrl: course.image || "https://miro.medium.com/v2/resize:fit:1200/1*rKl56ixsC55cMAsO2aQhGQ@2x.jpeg"
    }));
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
  const userId = JSON.parse(localStorage.getItem('user'))?.id;

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
    const teacherCourses = (data.rows || [])
      .filter(course => course.user_id === userId || course.teacher?.id === userId)
      .map(course => {
        // Create course code based on subject name using regex
        let courseCode;
        const courseName = course.name.toUpperCase();
        
        // Define regex patterns for each subject
        const subjectPatterns = {
          FIL: /\b(?:FILIPINO|FIL|FILIPINO\s+SUBJECT|FILIPINO\s+STUDIES)\b/,
          ENG: /\b(?:ENGLISH|ENG|ENGLISH\s+SUBJECT|ENGLISH\s+STUDIES)\b/,
          MATH: /\b(?:MATHEMATICS|MATH|MATHS|MATEMATIKA)\b/,
          SCI: /\b(?:SCIENCE|SCI|NATURAL\s+SCIENCE|GENERAL\s+SCIENCE)\b/,
          AP: /\b(?:ARALING\s+PANLIPUNAN|AP|SOCIAL\s+STUDIES)\b/,
          EsP: /\b(?:EDUKASYON\s+SA\s+PAGPAPAKATAO|ESP|EsP|VALUES\s+EDUCATION)\b/
        };

        // Test course name against patterns
        if (subjectPatterns.FIL.test(courseName)) {
          courseCode = `FIL-${String(course.id).padStart(3, '0')}`;
        } else if (subjectPatterns.ENG.test(courseName)) {
          courseCode = `ENG-${String(course.id).padStart(3, '0')}`;
        } else if (subjectPatterns.MATH.test(courseName)) {
          courseCode = `MATH-${String(course.id).padStart(3, '0')}`;
        } else if (subjectPatterns.SCI.test(courseName)) {
          courseCode = `SCI-${String(course.id).padStart(3, '0')}`;
        } else if (subjectPatterns.AP.test(courseName)) {
          courseCode = `AP-${String(course.id).padStart(3, '0')}`;
        } else if (subjectPatterns.EsP.test(courseName)) {
          courseCode = `EsP-${String(course.id).padStart(3, '0')}`;
        } else {
          courseCode = `COURSE-${String(course.id).padStart(3, '0')}`;
        }

        return {
          id: course.id,
          name: course.name,
          code: courseCode,
          description: course.description,
          studentCount: Math.floor(Math.random() * 30) + 10,
          imageUrl: course.imageUrl || "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg"
        };
      });

    return teacherCourses;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetches courses for the currently logged-in user
 * @returns {Promise<Array>} Array of courses assigned to the current user
 */
export const getUserCourses = async () => {
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
    const userCourses = (data.rows || [])
      .filter(course => course.user_id === currentUser.id)
      .map(course => {
        // Define regex patterns for each subject
        const subjectPatterns = {
          FIL: /\b(?:FILIPINO|FIL|FILIPINO\s+SUBJECT|FILIPINO\s+STUDIES)\b/i,
          ENG: /\b(?:ENGLISH|ENG|ENGLISH\s+SUBJECT|ENGLISH\s+STUDIES)\b/i,
          MATH: /\b(?:MATHEMATICS|MATH|MATHS|MATEMATIKA)\b/i,
          SCI: /\b(?:SCIENCE|SCI|NATURAL\s+SCIENCE|GENERAL\s+SCIENCE)\b/i,
          AP: /\b(?:ARALING\s+PANLIPUNAN|AP|SOCIAL\s+STUDIES)\b/i,
          EsP: /\b(?:EDUKASYON\s+SA\s+PAGPAPAKATAO|ESP|EsP|VALUES\s+EDUCATION)\b/i
        };

        // Test course name against patterns
        let courseCode;
        const courseName = course.name.toUpperCase();

        if (subjectPatterns.FIL.test(courseName)) {
          courseCode = `FIL-${String(course.id).padStart(3, '0')}`;
        } else if (subjectPatterns.ENG.test(courseName)) {
          courseCode = `ENG-${String(course.id).padStart(3, '0')}`;
        } else if (subjectPatterns.MATH.test(courseName)) {
          courseCode = `MATH-${String(course.id).padStart(3, '0')}`;
        } else if (subjectPatterns.SCI.test(courseName)) {
          courseCode = `SCI-${String(course.id).padStart(3, '0')}`;
        } else if (subjectPatterns.AP.test(courseName)) {
          courseCode = `AP-${String(course.id).padStart(3, '0')}`;
        } else if (subjectPatterns.EsP.test(courseName)) {
          courseCode = `EsP-${String(course.id).padStart(3, '0')}`;
        } else {
          courseCode = `COURSE-${String(course.id).padStart(3, '0')}`;
        }

        return {
          id: course.id,
          name: course.name,
          code: courseCode,
          description: course.description,
          studentCount: Math.floor(Math.random() * 30) + 10,
          imageUrl: course.imageUrl || "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg"
        };
      });

    return userCourses;
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
