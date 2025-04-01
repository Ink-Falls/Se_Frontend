import { API_BASE_URL } from "../utils/constants";
import fetchWithInterceptor from "./apiService";

/**
 * Creates a new assessment
 * @param {Object} assessmentData - The assessment data to create
 * @returns {Promise<Object>} Created assessment object
 */
export const createAssessment = async (assessmentData) => {
  try {
    const response = await fetchWithInterceptor(`${API_BASE_URL}/assessments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assessmentData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to create assessment");
    }

    return data;
  } catch (error) {
    console.error("Error creating assessment:", error);
    throw error;
  }
};

/**
 * Gets all assessments for a module
 * @param {number} moduleId - The module ID
 * @param {boolean} includeQuestions - Whether to include question details
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @returns {Promise<Object>} Assessments with pagination info
 */
export const getModuleAssessments = async (
  moduleId,
  includeQuestions = false,
  page = 1,
  limit = 20
) => {
  try {
    if (!moduleId) {
      throw new Error("Module ID is required to fetch assessments");
    }
    const url = new URL(`${API_BASE_URL}/assessments/module/${moduleId}`);
    url.searchParams.append("includeQuestions", includeQuestions);
    url.searchParams.append("page", page);
    url.searchParams.append("limit", limit);

    const response = await fetchWithInterceptor(url.toString());
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch assessments");
    }
    return data;
  } catch (error) {
    console.error("Error fetching module assessments:", error);
    throw error;
  }
};

/**
 * Gets an assessment by ID
 * @param {number} assessmentId - The assessment ID
 * @param {boolean} includeQuestions - Whether to include questions
 * @param {boolean} teacherView - Whether to show correct answers (teacher only)
 * @returns {Promise<Object>} Assessment object
 */
export const getAssessmentById = async (
  assessmentId,
  includeQuestions = false,
  teacherView = false
) => {
  try {
    if (!assessmentId) {
      throw new Error("Assessment ID is required");
    }
    const url = new URL(`${API_BASE_URL}/assessments/${assessmentId}`);
    url.searchParams.append("includeQuestions", includeQuestions);
    url.searchParams.append("teacherView", teacherView);

    const response = await fetchWithInterceptor(url.toString());
    return await response.json();
  } catch (error) {
    console.error("Error fetching assessment:", error);
    throw error;
  }
};
/**
 * Updates an existing assessment
 * @param {number} assessmentId - The assessment ID to update
 * @param {Object} updateData - The updated assessment data
 * @returns {Promise<Object>} Updated assessment object
 */
export const editAssessment = async (assessmentId, updateData) => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/assessments/${assessmentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error updating assessment:", error);
    throw error;
  }
};

/**
 * Deletes an assessment
 * @param {number} assessmentId - The assessment ID to delete
 * @returns {Promise<Object>} Success message
 */
export const deleteAssessment = async (assessmentId) => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/assessments/${assessmentId}`,
      {
        method: "DELETE",
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error deleting assessment:", error);
    throw error;
  }
};

/**
 * Creates a new question for an assessment
 * @param {number} assessmentId - The assessment ID
 * @param {Object} questionData - The question data to create
 * @returns {Promise<Object>} Created question object
 */
export const createAssessmentQuestion = async (assessmentId, questionData) => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/assessments/${assessmentId}/questions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
};

/**
 * Updates an existing question
 * @param {number} assessmentId - The assessment ID
 * @param {number} questionId - The question ID
 * @param {Object} questionData - Updated question data
 * @returns {Promise<Object>} Updated question object
 */
export const editQuestion = async (assessmentId, questionId, questionData) => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/assessments/${assessmentId}/questions/${questionId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
};

/**
 * Deletes a question
 * @param {number} assessmentId - The assessment ID
 * @param {number} questionId - The question ID to delete
 * @returns {Promise<Object>} Success message
 */
export const deleteQuestion = async (assessmentId, questionId) => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/assessments/${assessmentId}/questions/${questionId}`,
      {
        method: "DELETE",
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};

//////////////////////////////
/**
 * Creates a new submission for an assessment - Starts the assessment
 * @param {number} assessmentId - The assessment ID
 * @returns {Promise<Object>} Created submission object
 */
export const createSubmission = async (assessmentId) => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/assessments/${assessmentId}/submissions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to start submission");
    }

    return data;
  } catch (error) {
    console.error("Error creating submission:", error);
    throw error;
  }
};

/**
 * Gets all submissions for an assessment
 * @param {number} assessmentId - The assessment ID
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @returns {Promise<Object>} Submissions with pagination info
 */
export const getAssessmentSubmissions = async (
  assessmentId,
  page = 1,
  limit = 20
) => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/assessments/${assessmentId}/submissions?page=${page}&limit=${limit}`,
      { method: "GET" }
    );

    return await response.json();
  } catch (error) {
    console.error("Error fetching submissions:", error);
    throw error;
  }
};

/**
 * Saves an answer for a question in a submission
 * @param {number} submissionId - The submission ID
 * @param {number} questionId - The question ID
 * @param {Object} answerData - The answer data (optionId or textResponse)
 * @returns {Promise<Object>} Saved answer object
 */
export const saveQuestionAnswer = async (
  submissionId,
  questionId,
  answerData
) => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/assessments/submissions/${submissionId}/questions/${questionId}/answers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(answerData),
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error saving answer:", error);
    throw error;
  }
};

/**
 * Submits a completed assessment
 * @param {number} submissionId - The submission ID
 * @returns {Promise<Object>} Submission result with score
 */
export const submitAssessment = async (submissionId) => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/assessments/submissions/${submissionId}/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error submitting assessment:", error);
    throw error;
  }
};

/**
 * Gets the current user's submission for an assessment
 * @param {number} assessmentId - The assessment ID
 * @param {boolean} includeAnswers - Whether to include user's answers
 * @returns {Promise<Object>} User's submission object
 */
export const getUserSubmission = async (
  assessmentId,
  includeAnswers = false
) => {
  try {
    const url = new URL(
      `${API_BASE_URL}/assessments/${assessmentId}/my-submission`
    );
    url.searchParams.append("includeAnswers", includeAnswers);

    const response = await fetchWithInterceptor(url.toString());
    return await response.json();
  } catch (error) {
    console.error("Error fetching user submission:", error);
    throw error;
  }
};

/**
 * Grades a submission
 * @param {number} submissionId - The submission ID
 * @param {Object} gradingData - The grading data
 * @param {Array} gradingData.grades - Array of grades for each question
 * @param {string} gradingData.feedback - Overall feedback
 * @returns {Promise<Object>} Graded submission object
 */
export const gradeSubmission = async (submissionId, gradingData) => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/assessments/submissions/${submissionId}/grade`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gradingData),
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error grading submission:", error);
    throw error;
  }
};

/**
 * Gets the details of a submission
 * @param {number} submissionId - The submission ID
 * @returns {Promise<Object>} Submission details object
 */
export const getSubmissionDetails = async (submissionId) => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/assessments/submissions/${submissionId}`
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching submission details:", error);
    throw error;
  }
};
