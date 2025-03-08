// src/services/enrollmentService.js
import { API_BASE_URL } from "../utils/constants";

/**
 * Fetches all enrollments from the API.
 *
 * @async
 * @function getAllEnrollments
 * @returns {Promise<Array<object>>} An array of enrollment objects.
 * @throws {Error} If the API request fails.
 */
const getAllEnrollments = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated"); // Or redirect to login
    }

    const response = await fetch(`${API_BASE_URL}/enrollments`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // Good practice to include
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch enrollments");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    throw error; // Re-throw the error so the component can handle it
  }
};

/**
 * Approves an enrollment by ID.
 *
 * @async
 * @function approveEnrollment
 * @param {number} enrollmentId - The ID of the enrollment to approve.
 * @returns {Promise<object>} The updated enrollment object.
 * @throws {Error} If the API request fails.
 */
const approveEnrollment = async (enrollmentId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(
      `${API_BASE_URL}/enrollments/${enrollmentId}/approve`,
      {
        method: "PATCH", // Use PATCH for partial updates
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to approve enrollment");
    }

    return await response.json();
  } catch (error) {
    console.error("Error approving enrollment:", error);
    throw error;
  }
};

/**
 * Rejects an enrollment by ID.
 *
 * @async
 * @function rejectEnrollment
 * @param {number} enrollmentId - The ID of the enrollment to reject.
 * @returns {Promise<object>} The updated enrollment object.
 * @throws {Error} If the API request fails.
 */
const rejectEnrollment = async (enrollmentId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(
      `${API_BASE_URL}/enrollments/${enrollmentId}/reject`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to reject enrollment");
    }

    return await response.json();
  } catch (error) {
    console.error("Error rejecting enrollment:", error);
    throw error;
  }
};

/**
 * Deletes an enrollment by ID.
 *
 * @async
 * @function deleteEnrollment
 * @param {number} enrollmentId - The ID of the enrollment to delete.
 * @returns {Promise<object>} Response data from the server.
 * @throws {Error} If the API request fails.
 */
const deleteEnrollment = async (enrollmentId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(
      `${API_BASE_URL}/enrollments/${enrollmentId}`,
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
      throw new Error(errorData.message || "Failed to delete enrollment");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    throw error;
  }
};

export {
  getAllEnrollments,
  approveEnrollment,
  rejectEnrollment,
  deleteEnrollment,
};
