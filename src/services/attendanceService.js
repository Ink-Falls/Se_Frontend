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
  console.log('Starting getLearnerRoster with courseId:', courseId);
  
  try {
    if (!courseId) {
      console.log('Error: Course ID is missing');
      throw new Error('Course ID is required');
    }

    // Step 1: Get course details to find the learner group ID
    console.log('Step 1: Fetching courses from getAllCourses()');
    const coursesResponse = await getAllCourses();
    console.log('getAllCourses response received');
    
    if (!coursesResponse) {
      console.log('Error: coursesResponse is null or undefined');
      throw new Error('Failed to fetch courses');
    }
    
    // Handle different response formats
    const courses = coursesResponse.rows || coursesResponse.courses || coursesResponse;
    
    if (!courses || !Array.isArray(courses)) {
      console.log('Error: courses is not an array', courses);
      throw new Error('Invalid course data format');
    }
    
    // Find the specific course by ID
    const courseDetails = courses.find(course => course.id === parseInt(courseId));
    
    if (!courseDetails) {
      console.log(`Error: Course with ID ${courseId} not found`);
      throw new Error(`Course with ID ${courseId} not found`);
    }

    console.log('Found course details:', courseDetails);
    const learnerGroupId = courseDetails.learner_group_id;
    console.log('Learner group ID:', learnerGroupId);
    
    if (!learnerGroupId) {
      console.log('Error: Course has no associated learner group');
      throw new Error('Course has no associated learner group');
    }

    // Step 2: Fetch all members of the learner group - now includes user data directly
    console.log(`Step 2: Fetching group members for learner group ${learnerGroupId}`);
    const groupMembers = await getGroupMembers(learnerGroupId);
    console.log('Group members response received');
    
    if (!groupMembers || !Array.isArray(groupMembers)) {
      console.log('Error: groupMembers is not an array', groupMembers);
      throw new Error('Failed to fetch learner group members');
    }

    // If group is empty, return empty array
    if (groupMembers.length === 0) {
      console.log('Group has no members, returning empty array');
      return [];
    }

    // Step 3: Format the data from group members - user data is already included!
    console.log(`Processing ${groupMembers.length} group members`);
    const learnerRoster = groupMembers.map(member => {
      // Extract user data from the member object
      const userData = member.user;
      
      if (!userData) {
        console.log(`Warning: No user data for member ${member.id}`);
        return {
          id: member.user_id,
          name: 'Unknown Student'
        };
      }
      
      // Format student name with middle initial if available
      let formattedName = userData.first_name || '';
      
      if (userData.middle_initial) {
        formattedName += ` ${userData.middle_initial}.`;
      }
      
      formattedName += ` ${userData.last_name || ''}`;
      
      return {
        id: userData.id,
        name: formattedName.trim(),
        first_name: userData.first_name,
        middle_initial: userData.middle_initial,
        last_name: userData.last_name,
        email: userData.email,
        year_level: member.year_level,
        enrollment_id: member.enrollment_id
      };
    });

    console.log(`Successfully built learner roster with ${learnerRoster.length} students`);
    return learnerRoster;
  } catch (error) {
    console.error('Error in getLearnerRoster:', error);
    throw error;
  }
};

export default {
  getLearnerRoster
};
