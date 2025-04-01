/**
 * @module userService
 * @description Service module for handling user-related API operations
 */

import { API_BASE_URL } from "../utils/constants";
import fetchWithInterceptor from "./apiService";

/**
 * Fetches all users from the API.
 * @async
 * @function getAllUsers
 * @param {Object} [options] - Optional parameters for the request
 * @param {number} [options.page] - Page number for pagination
 * @param {number} [options.limit] - Number of items per page
 * @returns {Promise<Array>} Array of user objects
 * @throws {Error} If the API request fails
 */
export const getAllUsers = async (options = {}) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No authentication token found");
      throw new Error("Not authenticated");
    }

    const params = new URLSearchParams({
      page: Number(options.page) || 1,
      limit: Number(options.limit) || 10,
    }).toString();

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/users?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const data = await response.json();

    const result = {
      users: data.rows || data.users || [],
      totalItems: data.count || data.totalItems || 0,
      totalPages:
        data.totalPages ||
        Math.ceil((data.count || data.totalItems || 0) / (options.limit || 10)),
      currentPage: Number(options.page) || 1,
      roleCounts: data.roleCounts || [],
    };

    return result;
  } catch (error) {
    console.error("❌ Error in getAllUsers:", error);
    throw error;
  }
};

/**
 * Fetches all teachers from the API.
 * @async
 * @function getTeachers
 * @returns {Promise<Array>} Array of teacher objects
 * @throws {Error} If the API request fails
 */
export const getTeachers = async (options = {}) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const result = await getAllUsers();

    if(options.limit === 0) {
      options.limit = result.totalItems;
    }

    const params = new URLSearchParams({
      page: Number(options.page) || 1,
      limit: Number(options.limit) || 10,
    }).toString();

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/users?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();
    const usersList = data.users || [];
    return usersList.filter((user) => user.role === "teacher");
  } catch (error) {
    console.error("Error fetching teachers:", error);
    throw new Error("Failed to fetch users");
  }
};

/**
 * Creates a new user.
 * @async
 * @function createUser
 * @param {Object} userData - The user data to create
 * @param {string} userData.firstName - User's first name
 * @param {string} userData.lastName - User's last name
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password
 * @param {string} userData.role - User's role
 * @returns {Promise<Object>} Created user object
 * @throws {Error} If the API request fails or validation fails
 */
export const createUser = async (userData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const formattedData = {
      email: userData.email,
      password: userData.password,
      first_name: userData.first_name,
      last_name: userData.last_name,
      birth_date: userData.birth_date,
      contact_no: userData.contact_no.replace(/[^0-9]/g, ""),
      school_id: parseInt(userData.school_id),
      role: userData.role,
      middle_initial: userData.middle_initial || null,
      department:
        userData.role === "student_teacher" ? userData.department : null,
      section: userData.role === "student_teacher" ? userData.section : null,
      group_id: null, // Optional, can be added later if needed
    };

    const response = await fetchWithInterceptor(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/**
 * Updates an existing user.
 * @async
 * @function updateUser
 * @param {number|string} userId - ID of the user to update
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} Updated user object
 * @throws {Error} If the API request fails
 */
export const updateUser = async (userId, updateData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    let cleanedData = { ...updateData };

    if (cleanedData.contact_no) {
      // Remove all non-digits
      let contactNo = cleanedData.contact_no.replace(/\D/g, "");

      // Ensure it starts with '09'
      if (contactNo.startsWith("63")) {
        contactNo = "0" + contactNo.substring(2);
      }
      // Validate number format
      if (!contactNo.startsWith("09") || contactNo.length !== 11) {
        throw new Error(
          "Contact number must start with 09 and be 11 digits long"
        );
      }
      cleanedData.contact_no = contactNo;
    }

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/users/${userId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to update user (${response.status})`
      );
    }

    const data = await response.json();
    return data.user || data;
  } catch (error) {
    console.error("Error in updateUser:", error);
    throw error;
  }
};

/**
 * Deletes a user.
 * @async
 * @function deleteUser
 * @param {number|string} userId - ID of the user to delete
 * @returns {Promise<void>}
 * @throws {Error} If the API request fails
 */
export const deleteUser = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/users/${userId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete user");
    }

    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

/**
 * Updates a user's password.
 * @async
 * @function updatePassword
 * @param {number|string} userId - ID of the user
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Response object
 * @throws {Error} If the password update fails
 */

/**
 * Fetches a single user by ID
 * @param {number} userId - The ID of the user to fetch
 * @returns {Promise<Object>} User object
 */
export const getUserById = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};
