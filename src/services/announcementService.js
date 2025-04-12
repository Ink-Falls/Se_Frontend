
/**
 * @module announcementService
 * @description Service module for handling announcement-related API operations
 */

import { API_BASE_URL } from "../utils/constants";
import fetchWithInterceptor from "./apiService";

/**
 * Creates a new announcement
 * @async
 * @function createAnnouncement
 * @param {Object} announcementData - Data for the new announcement
 * @param {string} announcementData.title - The title of the announcement
 * @param {string} announcementData.message - The content of the announcement
 * @param {number} announcementData.course_id - The course ID the announcement belongs to (0 for global)
 * @returns {Promise<Object>} The created announcement and success message
 * @throws {Error} If the API request fails
 */
export const createAnnouncement = async (announcementData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    console.log("Creating announcement with data:", JSON.stringify(announcementData));
    
    // Prepare data to send to the API
    let dataToSend = {
      title: announcementData.title,
      message: announcementData.message
    };
    
    // Extract user role from token
    let userRole = null;
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      if (tokenPayload) {
        // Add user_id from token if possible
        if (tokenPayload.id) {
          dataToSend.user_id = tokenPayload.id;
        }
        
        // Check user role
        userRole = tokenPayload.role;
      }
    } catch (e) {
      console.warn("Could not extract user data from token:", e);
    }
    
    // Only include course_id for teacher and student_teacher roles
    if (userRole !== 'admin' && announcementData.course_id) {
      dataToSend.course_id = Number(announcementData.course_id) || 0;
    }
    
    console.log("Sending data to API:", dataToSend);

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/announcements`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      }
    );

    // Log the full response for debugging
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorMessage = "Failed to create announcement";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error("API Error Response:", errorData);
      } catch (e) {
        console.error("Could not parse error response:", e);
      }
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log("Successfully created announcement:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error creating announcement:", error);
    throw error;
  }
};

/**
 * Gets all announcements for a specific course - Used primarily for learner role
 * to display course-specific announcements in the course view
 * @async
 * @function getAnnouncementsByCourse
 * @param {number} courseId - The ID of the course
 * @returns {Promise<Array>} Array of announcement objects for the course
 * @throws {Error} If the API request fails
 */
export const getAnnouncementsByCourse = async (courseId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/announcements/course/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch course announcements");
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching announcements for course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Gets all global announcements - Used primarily for learner role
 * to display system-wide announcements in the notifications page
 * @async
 * @function getGlobalAnnouncements
 * @returns {Promise<Array>} Array of global announcement objects
 * @throws {Error} If the API request fails
 */
export const getGlobalAnnouncements = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/announcements/global`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch global announcements");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching global announcements:", error);
    throw error;
  }
};

/**
 * Gets a specific announcement by ID - Used by all roles (admin, teacher, student_teacher, learner)
 * to view detailed information about a specific announcement
 * @async
 * @function getAnnouncementById
 * @param {number} announcementId - The ID of the announcement to fetch
 * @returns {Promise<Object>} The announcement object
 * @throws {Error} If the API request fails
 */
export const getAnnouncementById = async (announcementId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/announcements/${announcementId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch announcement");
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching announcement ${announcementId}:`, error);
    throw error;
  }
};

/**
 * Updates an existing announcement
 * @async
 * @function updateAnnouncement
 * @param {number} announcementId - The ID of the announcement to update
 * @param {Object} updateData - The updated announcement data
 * @param {string} updateData.title - The updated title
 * @param {string} updateData.message - The updated message content
 * @param {number} updateData.course_id - The updated course ID
 * @returns {Promise<Object>} The updated announcement and success message
 * @throws {Error} If the API request fails
 */
export const updateAnnouncement = async (announcementId, updateData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/announcements/${announcementId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update announcement");
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating announcement ${announcementId}:`, error);
    throw error;
  }
};

/**
 * Deletes an announcement
 * @async
 * @function deleteAnnouncement
 * @param {number} announcementId - The ID of the announcement to delete
 * @returns {Promise<Object>} Confirmation message
 * @throws {Error} If the API request fails
 */
export const deleteAnnouncement = async (announcementId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/announcements/${announcementId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete announcement");
    }

    return await response.json();
  } catch (error) {
    console.error(`Error deleting announcement ${announcementId}:`, error);
    throw error;
  }
};

/**
 * Gets all announcements for a specific user and course (for teachers and student teachers)
 * @async
 * @function getAnnouncementsByUserAndCourse
 * @param {number} userId - The ID of the user
 * @param {number} courseId - The ID of the course
 * @returns {Promise<Array>} Array of announcement objects for the specified user and course
 * @throws {Error} If the API request fails
 */
export const getAnnouncementsByUserAndCourse = async (userId, courseId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/announcements/user/${userId}/course/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch announcements for this user and course");
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching announcements for user ${userId} and course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Gets all announcements created by a specific user (admin role)
 * @async
 * @function getAnnouncementsByUser
 * @param {number} userId - The ID of the user
 * @returns {Promise<Array>} Array of announcement objects created by the specified user
 * @throws {Error} If the API request fails
 */
export const getAnnouncementsByUser = async (userId) => {
  try {
    // If no userId provided, try to get it from the token
    if (!userId) {
      console.log("No userId provided, trying to get from token");
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          userId = tokenPayload.id;
          console.log("Extracted user ID from token:", userId);
        }
      } catch (e) {
        console.error("Could not extract user ID from token:", e);
      }
    }

    if (!userId) {
      console.error("No user ID available for getAnnouncementsByUser");
      return []; // Return empty array instead of throwing error
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No auth token available for getAnnouncementsByUser");
      throw new Error("Authentication token not found");
    }

    console.log(`Calling API endpoint: ${API_BASE_URL}/announcements/user/${userId}`);
    
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/announcements/user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("API response status:", response.status);
    
    if (!response.ok) {
      console.error("Error response from API:", response);
      let errorMessage = "Failed to fetch announcements for this user";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error("API Error Response:", errorData);
      } catch (e) {
        console.error("Could not parse error response:", e);
      }
      throw new Error(errorMessage);
    }

    const rawData = await response.text();
    console.log("Raw response data:", rawData);
    
    let data;
    try {
      data = JSON.parse(rawData);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      console.error("Raw text:", rawData);
      throw new Error("Invalid JSON response from server");
    }
    
    console.log("API returned parsed data:", data);
    
    // Handle different response formats with better logging
    let result = [];
    if (Array.isArray(data)) {
      console.log("Data is an array of length:", data.length);
      result = data;
    } else if (data && typeof data === 'object') {
      console.log("Data is an object with keys:", Object.keys(data));
      result = data.announcements || data.data || [];
      console.log("Extracted array length:", result.length);
    } else {
      console.warn("Unexpected data format:", data);
      result = [];
    }
    
    if (result.length === 0) {
      console.warn("No announcements found in response");
    } else {
      console.log("First announcement:", JSON.stringify(result[0]));
    }
    
    return result;
  } catch (error) {
    console.error(`Error in getAnnouncementsByUser for user ${userId}:`, error);
    console.error("Stack trace:", error.stack);
    throw error;
  }
};

/**
 * Gets all courses assigned to a user
 * @async
 * @function getCoursesByUserId
 * @param {number} userId - The ID of the user (optional, will use from localStorage if not provided)
 * @returns {Promise<Array>} Array of course objects assigned to the user
 * @throws {Error} If the API request fails
 */
export const getCoursesByUserId = async (userId) => {
  try {
    // If no userId provided, try to get it from the token
    if (!userId) {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          userId = tokenPayload.id;
          console.log("Extracted user ID from token:", userId);
        }
      } catch (e) {
        console.error("Could not extract user ID from token:", e);
      }
    }

    if (!userId) {
      console.error("No user ID available for getCoursesByUserId");
      return []; // Return empty array instead of throwing error
    }

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    console.log(`Fetching courses for user ID: ${userId}`);
    
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/courses/user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch user courses");
    }

    const courses = await response.json();
    console.log(`Successfully fetched ${courses.length} courses for user ${userId}`);
    return courses;
  } catch (error) {
    console.error(`Error in getCoursesByUserId for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Gets all announcements from courses a user is enrolled in
 * @async
 * @function getAnnouncementsFromUserCourses
 * @param {number} userId - The ID of the user (optional, will use from localStorage if not provided)
 * @returns {Promise<Array>} Array of announcement objects from user's courses
 * @throws {Error} If the API request fails
 */
export const getAnnouncementsFromUserCourses = async (userId) => {
  try {
    // Get all courses for the user
    const courses = await getCoursesByUserId(userId);
    if (!courses || courses.length === 0) {
      console.log("No courses found for user");
      return [];
    }
    
    console.log(`Found ${courses.length} courses, fetching announcements for each`);
    
    // Fetch announcements for each course in parallel
    const announcementPromises = courses.map(course => 
      getAnnouncementsByCourse(course.id)
        .catch(err => {
          console.error(`Error fetching announcements for course ${course.id}:`, err);
          return []; // Return empty array if there's an error for a specific course
        })
    );
    
    // Wait for all promises to resolve
    const courseAnnouncementsArrays = await Promise.all(announcementPromises);
    
    // Flatten the array of arrays and add course info to each announcement
    const allAnnouncements = courseAnnouncementsArrays
      .flat()
      .filter(announcement => announcement) // Filter out null/undefined
      .map(announcement => {
        // Find the course this announcement belongs to
        const course = courses.find(c => c.id === announcement.course_id);
        return {
          ...announcement,
          course_name: course?.name,
          course_description: course?.description
        };
      });
    
    // Sort by creation date (newest first)
    allAnnouncements.sort((a, b) => 
      new Date(b.createdAt || b.created_at || 0) - 
      new Date(a.createdAt || a.created_at || 0)
    );
    
    console.log(`Successfully aggregated ${allAnnouncements.length} announcements from all courses`);
    return allAnnouncements;
  } catch (error) {
    console.error("Error fetching announcements from user courses:", error);
    throw error;
  }
};