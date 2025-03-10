import { API_BASE_URL } from '../utils/constants';

export const checkEnrollmentStatus = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/enrollments/check-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404 && data.message === "Enrollment not found for this email") {
        throw new Error("Email not found");
      }
      throw new Error(`HTTP error! status: ${response.status}, message: ${data.message}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
};
