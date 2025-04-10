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
    
    if (!coursesResponse) {
      throw new Error('Failed to fetch courses');
    }
    
    const courses = coursesResponse.rows || coursesResponse.courses || coursesResponse;
    
    if (!courses || !Array.isArray(courses)) {
      throw new Error('Invalid course data format');
    }
    
    const courseDetails = courses.find(course => course.id === parseInt(courseId));
    
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

    if (groupMembers.length === 0) {
      return [];
    }

    // Step 3: Format the data from group members directly without additional API calls
    const learnerRoster = groupMembers.map(member => {
      let formattedName = member.user?.first_name || '';
      
      if (member.user?.middle_initial) {
        formattedName += ` ${member.user.middle_initial}.`;
      }
      
      formattedName += ` ${member.user?.last_name || ''}`;
      
      return {
        id: member.user_id,
        name: formattedName.trim(),
        first_name: member.user?.first_name,
        middle_initial: member.user?.middle_initial,
        last_name: member.user?.last_name,
        email: member.user?.email,
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
