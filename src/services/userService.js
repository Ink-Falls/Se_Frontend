/**
 * @module userService
 * @description Service module for handling user-related API operations
 */

import { API_BASE_URL } from '../utils/constants';

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
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
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
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error creating user:', error);
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
  // ...existing code...
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
  // ...existing code...
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
export const updatePassword = async (userId, oldPassword, newPassword) => {
  // ...existing code...
};
