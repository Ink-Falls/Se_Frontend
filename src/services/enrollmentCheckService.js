/**
 * @module enrollmentCheckService
 * @description Service for checking enrollment status
 */

import { API_BASE_URL } from "../utils/constants";
import fetchWithInterceptor from "./apiService";

/**
 * Checks the enrollment status for a given email
 * @async
 * @param {string} email - The email address to check enrollment status for
 * @returns {Promise<Object>} The enrollment status data
 * @throws {Error} If the email is not found or request fails
 * @property {string} status - The enrollment status ('pending', 'approved', 'rejected')
 */
export const checkEnrollmentStatus = async (email) => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/enrollments/check-status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (
        response.status === 404 &&
        data.message === "Enrollment not found for this email"
      ) {
        throw new Error("Email not found");
      }
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${data.message}`
      );
    }

    return data;
  } catch (error) {
    throw error;
  }
};
