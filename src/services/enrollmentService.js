// src/services/enrollmentService.js
import { API_BASE_URL } from "../utils/constants";
import fetchWithInterceptor from "./apiService";

/**
 * Enrollment service module that handles all enrollment-related API calls.
 * @module enrollmentService
 */

/**
 * Fetches all enrollments from the API.
 * @async
 * @function getAllEnrollments
 * @param {number} [page=1] - The page number to fetch.
 * @param {number} [limit=10] - Number of items per page
 * @returns {Promise<Array<object>>} Array of enrollment objects.
 * @throws {Error} If the API request fails or authentication is missing.
 */
const getAllEnrollments = async (options = {}) => {
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
      `${API_BASE_URL}/enrollments?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch enrollments");
    }

    const data = await response.json();

    const result = {
      enrollments: data.rows || data.enrollments || [],
      totalItems: data.count || data.totalItems || 0,
      totalPages:
        data.totalPages ||
        Math.ceil((data.count || data.totalItems || 0) / (options.limit || 10)),
      currentPage: Number(options.page) || 1,
      statusCounts: data.statusCounts || [],
    };

    return result;
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    throw error; // Re-throw the error so the component can handle it
  }
};

/**
 * Approves an enrollment by ID.
 * @async
 * @function approveEnrollment
 * @param {number|string} enrollmentId - The ID of the enrollment to approve.
 * @returns {Promise<object>} The updated enrollment object.
 * @throws {Error} If the enrollment ID is missing, authentication fails, or the API request fails.
 */
const approveEnrollment = async (enrollmentId) => {
  try {
    if (!enrollmentId) {
      throw new Error("Enrollment ID is required");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const tokenPayload = JSON.parse(atob(token.split(".")[1]));
    const adminId = tokenPayload.id;

    const url = `${API_BASE_URL}/enrollments/${enrollmentId}/approve`;
    const enrollment = await getEnrollmentById(enrollmentId);

    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    if (!enrollment.year_level) {
      throw new Error("Year level is missing from enrollment data");
    }

    const requestBody = {
      enrollment_id: enrollmentId,
      admin_id: adminId,
      year_level: enrollment.year_level,
      status: "approved",
    };

    const response = await fetchWithInterceptor(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Server error response:", errorData);
      throw new Error(errorData.message || "Failed to approve enrollment");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in approveEnrollment:", error);
    throw error;
  }
};

/**
 * Rejects an enrollment by ID.
 * @async
 * @function rejectEnrollment
 * @param {number|string} enrollmentId - The ID of the enrollment to reject.
 * @returns {Promise<object>} The updated enrollment object.
 * @throws {Error} If the enrollment ID is missing, authentication fails, or the API request fails.
 */
const rejectEnrollment = async (enrollmentId) => {
  try {
    if (!enrollmentId) {
      throw new Error("Enrollment ID is required");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const tokenPayload = JSON.parse(atob(token.split(".")[1]));
    const adminId = tokenPayload.id;

    const url = `${API_BASE_URL}/enrollments/${enrollmentId}/reject`;

    const requestBody = {
      enrollmentId,
      adminId,
    };


    const response = await fetchWithInterceptor(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Server error response:", errorData);
      throw new Error(errorData.message || "Failed to reject enrollment");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in rejectEnrollment:", error);
    throw error;
  }
};

/**
 * Deletes an enrollment by ID.
 * @async
 * @function deleteEnrollment
 * @param {number|string} enrollmentId - The ID of the enrollment to delete.
 * @returns {Promise<object>} Response data from the server.
 * @throws {Error} If the authentication fails or the API request fails.
 */
const deleteEnrollment = async (enrollmentId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetchWithInterceptor(
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

/**
 * Fetches a single enrollment by ID.
 * @async
 * @function getEnrollmentById
 * @param {number|string} enrollmentId - The ID of the enrollment to fetch.
 * @returns {Promise<object>} The enrollment object.
 * @throws {Error} If the enrollment ID is missing, authentication fails, or the API request fails.
 */
const getEnrollmentById = async (enrollmentId) => {
  try {
    if (!enrollmentId) {
      throw new Error("Enrollment ID is required");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const url = `${API_BASE_URL}/enrollments/${encodeURIComponent(
      enrollmentId
    )}`;

    const response = await fetchWithInterceptor(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Failed to fetch enrollment (Status: ${response.status})`
      );
    }

    const data = await response.json();
    if (!data) {
      throw new Error("No data received from server");
    }

    return data;
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    throw new Error(error.message || "Failed to fetch enrollment details");
  }
};

/**
 * Creates a new enrollment.
 * @async
 * @function createEnrollment
 * @param {Object} enrollmentData - The enrollment data to be submitted
 * @returns {Promise<Object>} The created enrollment object
 * @throws {Error} If the API request fails
 */
const createEnrollment = async (enrollmentData) => {
  try {
    const response = await fetchWithInterceptor(`${API_BASE_URL}/enrollments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(enrollmentData),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error("Email already exists");
      }
      throw new Error(data.message || "Failed to create enrollment");
    }

    return data;
  } catch (error) {
    console.error("Error creating enrollment:", error);
    throw error;
  }
};

export {
  getAllEnrollments,
  approveEnrollment,
  rejectEnrollment,
  deleteEnrollment,
  getEnrollmentById,
  createEnrollment, 
};
