// src/services/enrollmentService.js
import { API_BASE_URL } from '../utils/constants';

/**
 * Fetches all enrollments (admin only).
 * @returns {Promise<Array<object>>} An array of enrollment objects.
 * @throws {Error} If the request fails.
 */
const getAllEnrollments = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Not authenticated"); // Or redirect to login
    }

    const response = await fetch(`${API_BASE_URL}/enrollments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch enrollments");
    }

    return await response.json();
  } catch (error) {
     if (error.message) {
        throw error; //re-throw error caught from response
     }
     else{
        throw new Error("Network error.  Please check your connection."); // Network or other error
     }
  }
};


/**
 * Approves an enrollment (admin only).
 * @param {number} enrollmentId - The ID of the enrollment to approve.
 * @returns {Promise<object>} The updated enrollment object.
 * @throws {Error} If the request fails.
 */
const approveEnrollment = async (enrollmentId) => {
  try {
    const token = localStorage.getItem('token');
      if (!token) {
      throw new Error("Not authenticated"); // Or redirect to login
    }
    const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}/approve`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to approve enrollment");
    }

    return await response.json(); // Or just return a success message, if that's what the API returns
  } catch (error) {
    if (error.message) {
        throw error; //re-throw error caught from response
     }
     else{
        throw new Error("Network error.  Please check your connection."); // Network or other error
     }
  }
};

/**
 * Rejects an enrollment (admin only).
 * @param {number} enrollmentId - The ID of the enrollment to reject.
 * @returns {Promise<object>} The updated enrollment object.
 * @throws {Error} If the request fails.
 */
const rejectEnrollment = async (enrollmentId) => {
  try {
    const token = localStorage.getItem('token');
      if (!token) {
      throw new Error("Not authenticated"); // Or redirect to login
    }
    const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}/reject`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to reject enrollment");
    }

    return await response.json();
  } catch (error) {
     if (error.message) {
        throw error; //re-throw error caught from response
     }
     else{
        throw new Error("Network error.  Please check your connection."); // Network or other error
     }
  }
};


export { getAllEnrollments, approveEnrollment, rejectEnrollment };