import { getAllCourses } from "./courseService";
import { getGroupMembers } from "./groupService";

/**
 * Service for handling attendance-related operations
 * @module attendanceService
 */

/**
 * Fetches the roster of learners for a specific course
 * @async
 * @function getLearnerRoster
 * @param {number} courseId - The ID of the course
 * @returns {Promise<Array>} Array of learners with their details
 * @throws {Error} If the API request fails or data is missing
 */
export const getLearnerRoster = async (courseId) => {
  try {
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    // Step 1: Get course details to find the learner group ID
    const coursesResponse = await getAllCourses();
    
    // Improved error handling - check if response is valid first
    if (!coursesResponse) {
      throw new Error('Failed to fetch courses');
    }
    
    // Handle various response formats from getAllCourses
    const courses = coursesResponse.rows || coursesResponse.courses || coursesResponse;
    
    if (!courses || !Array.isArray(courses)) {
      throw new Error('Invalid course data format');
    }
    
    // Find the specific course by ID - handle both string and number IDs
    const courseDetails = courses.find(
      course => course.id === parseInt(courseId) || course.id === courseId
    );
    
    if (!courseDetails) {
      throw new Error(`Course with ID ${courseId} not found`);
    }

    const learnerGroupId = courseDetails.learner_group_id;
    
    if (!learnerGroupId) {
      throw new Error('Course has no associated learner group');
    }

    // Step 2: Fetch all members of the learner group
    const groupMembers = await getGroupMembers(learnerGroupId);
    
    if (!groupMembers || !Array.isArray(groupMembers)) {
      throw new Error('Failed to fetch learner group members');
    }

    // If group is empty, return empty array
    if (groupMembers.length === 0) {
      return [];
    }

    // Step 3: Format the data from group members directly without additional API calls
    const learnerRoster = groupMembers.map(member => {
      // Extract user data from member or member.user depending on the response structure
      const userData = member.user || member;
      
      // Format student name with middle initial if available
      let formattedName = userData.first_name || '';
      
      if (userData.middle_initial) {
        formattedName += ` ${userData.middle_initial}.`;
      }
      
      formattedName += ` ${userData.last_name || ''}`;
      
      return {
        id: member.user_id || userData.id,
        name: formattedName.trim(),
        first_name: userData.first_name,
        middle_initial: userData.middle_initial,
        last_name: userData.last_name,
        email: userData.email,
        year_level: member.year_level,
        enrollment_id: member.enrollment_id
      };
    });

    return learnerRoster;
  } catch (error) {
    console.error('Error in getLearnerRoster:', error);
    throw error;
  }
};

export default {
  getLearnerRoster
};
