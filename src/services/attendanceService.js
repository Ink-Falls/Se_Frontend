import { getAllCourses } from "./courseService";
import { getGroupMembers } from "./groupService";
import { API_BASE_URL } from "../utils/constants";
import fetchWithInterceptor from "./apiService";

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

/**
 * Creates a new attendance record
 * @async
 * @function createAttendance
 * @param {Object} attendanceData - The attendance data
 * @param {number} attendanceData.courseId - The ID of the course
 * @param {string} attendanceData.date - The date of attendance (YYYY-MM-DD)
 * @returns {Promise<Object>} The created attendance record
 * @throws {Error} If the API request fails
 */
export const createAttendance = async (attendanceData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/attendance`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attendanceData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create attendance record");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating attendance:", error);
    throw error;
  }
};

/**
 * Fetches attendance records for a course on a specific date
 * @async
 * @function getAttendanceByDate
 * @param {number} courseId - The ID of the course
 * @param {string} date - The date to fetch attendance for (YYYY-MM-DD)
 * @returns {Promise<Array>} The attendance records
 * @throws {Error} If the API request fails
 */
export const getAttendanceByDate = async (courseId, date) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/attendance/course/${courseId}/date/${date}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch attendance records");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching attendance by date:", error);
    throw error;
  }
};

/**
 * Updates the status of an attendance record
 * @async
 * @function updateAttendanceStatus
 * @param {number} attendanceId - The ID of the attendance record to update
 * @param {string} status - The new status ("present", "absent", "late", etc.)
 * @returns {Promise<Object>} The updated attendance record
 * @throws {Error} If the API request fails
 */
export const updateAttendanceStatus = async (attendanceId, status) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/attendance/${attendanceId}`,
      {
        method: "PATCH", // Changed from PUT to PATCH
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update attendance status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating attendance status:", error);
    throw error;
  }
};

/**
 * Fetches all attendance records for a specific user in a course
 * @async
 * @function getUserAttendanceInCourse
 * @param {number} courseId - The ID of the course
 * @param {number} userId - The ID of the user
 * @returns {Promise<Array>} The attendance records for the user
 * @throws {Error} If the API request fails
 */
export const getUserAttendanceInCourse = async (courseId, userId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/attendance/course/${courseId}/user/${userId}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch user attendance records");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user attendance:", error);
    throw error;
  }
};

export default {
  getLearnerRoster,
  createAttendance,
  getAttendanceByDate,
  updateAttendanceStatus,
  getUserAttendanceInCourse
};
