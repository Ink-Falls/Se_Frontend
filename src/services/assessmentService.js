import { API_BASE_URL } from '../utils/constants';
import fetchWithInterceptor from './apiService';

/**
 * Creates a new assessment
 * @param {Object} assessmentData - The assessment data to create
 * @returns {Promise<Object>} Created assessment object
 */
export const createAssessment = async (assessmentData) => {
  try {
    // Format request body to match new API requirements
    const requestBody = {
      title: assessmentData.title.trim(),
      description: assessmentData.description.trim(),
      module_id: parseInt(assessmentData.module_id),
      type: assessmentData.type,
      max_score: parseInt(assessmentData.max_score),
      passing_score: parseInt(assessmentData.passing_score),
      duration_minutes: parseInt(assessmentData.duration_minutes),
      due_date: new Date(assessmentData.due_date).toISOString(),
      is_published: Boolean(assessmentData.is_published),
      instructions: assessmentData.instructions?.trim() || "",
      allowed_attempts: parseInt(assessmentData.allowed_attempts) || 1
    };

    const response = await fetchWithInterceptor(`${API_BASE_URL}/assessments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create assessment');
    }

    return {
      success: true,
      message: data.message || "Assessment created successfully",
      assessment: {
        ...data.assessment,
        due_date: new Date(data.assessment.due_date),
        createdAt: new Date(data.assessment.createdAt),
        updatedAt: new Date(data.assessment.updatedAt)
      }
    };
  } catch (error) {
    console.error('Error creating assessment:', error);
    throw error;
  }
};

/**
 * Gets all assessments for a module ----------- DONT REFACTOR
 * @param {number} moduleId - The module ID
 * @param {boolean} includeQuestions - Whether to include question details
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @returns {Promise<Object>} Assessment data with pagination info
 */
export const getCourseAssessments = async (moduleId, includeQuestions = false, page = 1, limit = 10) => {
  try {
    const url = new URL(`${API_BASE_URL}/assessments/module/${moduleId}`);
    url.searchParams.append('includeQuestions', includeQuestions);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);

    console.log('Fetching assessments with URL:', url.toString());

    const response = await fetchWithInterceptor(url.toString());
    const data = await response.json();

    console.log('Raw assessment response:', data);
    console.log('Response structure:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch assessments');
    }

    // Handle the nested assessments structure
    const assessmentsArray = data.assessments?.assessments || [];
    const courseId = data.assessments?.course_id;

    return {
      success: true,
      assessments: assessmentsArray.map(assessment => ({
        ...assessment,
        course_id: courseId,
        due_date: new Date(assessment.due_date),
        createdAt: new Date(assessment.createdAt),
        updatedAt: new Date(assessment.updatedAt),
        max_score: parseInt(assessment.max_score),
        passing_score: parseInt(assessment.passing_score),
        duration_minutes: parseInt(assessment.duration_minutes),
      })),
      pagination: data.pagination || { total: 0, pages: 1, page: 1, limit: 10 }
    };

  } catch (error) {
    console.error('Error fetching module assessments:', error);
    console.error('Error stack:', error.stack);
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
export const getAssessmentById = async (assessmentId, includeQuestions = false, teacherView = false) => {
  try {
    const url = new URL(`${API_BASE_URL}/assessments/${assessmentId}`);
    url.searchParams.append('includeQuestions', includeQuestions);
    url.searchParams.append('teacherView', teacherView);

    const response = await fetchWithInterceptor(url.toString());
    const data = await response.json();

    if (data.success && data.assessment) {
      // Transform the assessment data and ensure option_text is always present
      const assessment = {
        ...data.assessment,
        questions: data.assessment.questions?.map(q => ({
          ...q,
          options: q.options?.map(opt => ({
            ...opt,
            id: parseInt(opt.id || 0),
            question_id: parseInt(opt.question_id || 0),
            is_correct: Boolean(opt.is_correct),
            order_index: parseInt(opt.order_index || 0),
            option_text: opt?.option_text || opt?.text || 'No option text' // Add fallback
          })) || []
        })) || [],
        due_date: new Date(data.assessment.due_date),
        max_score: parseInt(data.assessment.max_score),
        passing_score: parseInt(data.assessment.passing_score),
        duration_minutes: parseInt(data.assessment.duration_minutes)
      };

      return {
        success: true,
        assessment
      };
    }

    return data;
  } catch (error) {
    console.error('Error fetching assessment:', error);
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
    const response = await fetchWithInterceptor(`${API_BASE_URL}/assessments/${assessmentId}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionData),
    });

    return await response.json();
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

/**
 * Creates a new submission for an assessment - Starts the assessment
 * @param {number} assessmentId - The assessment ID
 * @returns {Promise<Object>} Created submission object
 */
export const createSubmission = async (assessmentId) => {
  try {
    const response = await fetchWithInterceptor(`${API_BASE_URL}/assessments/${assessmentId}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to start submission');
    }
    
    // Store the assessment ID with the submission ID for later use
    try {
      localStorage.setItem(`submission_${data.submission.id}`, JSON.stringify({
        assessmentId: assessmentId,
        startTime: new Date().toISOString()
      }));
    } catch (e) {
      console.warn('Could not store submission data in localStorage:', e);
    }
    
    return data;
  } catch (error) {
    console.error('Error creating submission:', error);
    throw error;
  }
};

/**
 * Gets all submissions for an assessment 
 * @param {number} assessmentId - The assessment ID
 * @param {number} page - The page number
 * @param {number} limit - The number of items per page
 * @returns {Promise<Array>} Array of submission objects
 */
export const getAssessmentSubmissions = async (assessmentId, page = 1, limit = 20) => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/assessments/${assessmentId}/submissions?page=${page}&limit=${limit}`,
      { method: 'GET' }
    );

    const data = await response.json();
    
    // Transform submission data to include auto-graded points
    if (data.success && data.submissions) {
      data.submissions = data.submissions.map(submission => {
        let totalPoints = 0;
        
        submission.answers?.forEach(answer => {
          if (answer.question?.question_type === 'multiple_choice' || 
              answer.question?.question_type === 'true_false') {
            const isCorrect = answer.selected_option?.is_correct;
            answer.points_awarded = isCorrect ? answer.question.points : 0;
            totalPoints += answer.points_awarded;
          } else if (answer.points_awarded) {
            totalPoints += answer.points_awarded;
          }
        });
        
        return {
          ...submission,
          total_score: totalPoints
        };
      });
    }

    return data;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
};

/**
 * Saves an answer for a question in a submission
 * @param {number} submissionId - The submission ID
 * @param {number} questionId - The question ID
 * @param {Object} answerData - The answer data
 * @returns {Promise<Object>} Saved answer object
 */
export const saveQuestionAnswer = async (submissionId, questionId, answerData) => {
  try {
    // Format payload according to API requirements
    const payload = {
      optionId: typeof answerData.optionId === 'string' 
        ? parseInt(answerData.optionId, 10)
        : answerData.optionId,
      textResponse: answerData.textResponse || undefined
    };

    // Validate payload
    if (!payload.optionId && !payload.textResponse) {
      throw new Error('Answer must include either optionId or textResponse');
    }

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/assessments/submissions/${submissionId}/questions/${questionId}/answers`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to save answer');
    }
    return data;
  } catch (error) {
    console.error('Error saving answer:', error);
    throw error;
  }
};

/**
 * Submits a completed assessment
 * @param {number} submissionId - The submission ID
 * @param {number} assessmentId - The assessment ID (optional, will try to find from localStorage if not provided)
 * @returns {Promise<Object>} Submission result
 */
const hasManualGradingQuestions = (questions = []) => {
  // Add null/undefined check to prevent TypeError
  if (!questions || !Array.isArray(questions)) return false;
  
  return questions.some(q => 
    q.question_type === 'short_answer' || 
    q.question_type === 'essay'
  );
};

export const submitAssessment = async (submissionId, assessmentId = null) => {
  try {
    // First try to get the assessment ID from the provided parameter
    let assessmentIdToUse = assessmentId;
    
    // If not provided, try to get it from localStorage
    if (!assessmentIdToUse) {
      try {
        const storedSubmissionData = localStorage.getItem(`submission_${submissionId}`);
        if (storedSubmissionData) {
          const parsedData = JSON.parse(storedSubmissionData);
          assessmentIdToUse = parsedData.assessmentId;
        }
      } catch (e) {
        console.error('Error retrieving stored submission data:', e);
      }
    }
    
    if (!assessmentIdToUse) {
      throw new Error('Assessment ID not found for submission');
    }
    
    // Set status to 'submitted' for all submissions
    const status = 'submitted';
    const submit_time = new Date().toISOString();

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/assessments/submissions/${submissionId}/submit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          submit_time
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit assessment');
    }

    try {
      localStorage.setItem(`submission_${submissionId}_time`, submit_time);
    } catch (e) {
      console.warn('Could not store submission time in localStorage:', e);
    }

    return {
      ...data,
      submit_time
    };
  } catch (error) {
    console.error('Error submitting assessment:', error);
    throw error;
  }
};

/**
 * Gets the current user's submission for an assessment
 * @param {number} assessmentId - The assessment ID
 * @param {boolean} includeAnswers - Whether to include user's answers
 * @param {number} page - The page number
 * @param {number} limit - The number of items per page
 * @returns {Promise<Object>} User's submission object
 */
export const getUserSubmission = async (assessmentId, includeAnswers = false, page = 1, limit = 20) => {
  try {
    const url = new URL(`${API_BASE_URL}/assessments/${assessmentId}/my-submission`);
    url.searchParams.append('includeAnswers', includeAnswers);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);

    const response = await fetchWithInterceptor(url.toString());
    const data = await response.json();

    if (data.success && data.submission) {
      // Transform submission answers to ensure consistent option structure
      const submission = {
        ...data.submission,
        answers: data.submission.answers?.map(answer => ({
          ...answer,
          selected_option: answer.selected_option ? {
            ...answer.selected_option,
            option_text: answer.selected_option.option_text || answer.selected_option.text || ''
          } : null,
          text_response: answer.text_response || '',
          // Include both auto-graded and manual grades
          points_awarded: answer.points_awarded,
          is_auto_graded: answer.is_auto_graded || false,
          manual_grade: answer.manual_grade || null,
          feedback: answer.feedback || ''
        })),
        // Calculate total score combining both auto and manual grades
        total_score: data.submission.answers?.reduce((sum, answer) => 
          sum + (parseInt(answer.points_awarded) || 0), 0
        ) || 0
      };

      return {
        success: true,
        submission
      };
    }
    return data;
  } catch (error) {
    console.error('Error fetching user submission:', error);
    throw error;
  }
};

/**
 * Grades a submission
 * @param {number} submissionId - The submission ID
 * @param {Object} gradingData - The grading data
 * @returns {Promise<Object>} Graded submission object
 */
export const gradeSubmission = async (submissionId, gradingData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetchWithInterceptor(`${API_BASE_URL}/assessments/submissions/${submissionId}/grade`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gradingData)
    });

    if (!response.ok) throw new Error('Failed to grade submission');
    return await response.json();
  } catch (error) {
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
    const token = localStorage.getItem('token');
    const response = await fetchWithInterceptor(`${API_BASE_URL}/assessments/submissions/${submissionId}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch submission details');
    const data = await response.json();

    if (data.success && data.submission) {
      const processedSubmission = {
        ...data.submission,
        answers: data.submission.answers.map(answer => ({
          ...answer,
          points_awarded: answer.points_awarded,
          feedback: answer.feedback || ''
        }))
      };

      return {
        success: true,
        submission: processedSubmission
      };
    }

    return data;
  } catch (error) {
    console.error('Error in getSubmissionDetails:', error);
    throw error;
  }
};

/**
 * Updates an existing assessment
 * @param {number} assessmentId - The assessment ID to update
 * @param {Object} assessmentData - The updated assessment data
 * @returns {Promise<Object>} Updated assessment object
 */
export const editAssessment = async (assessmentId, assessmentData) => {
  try {
    // Validate assessmentId
    if (!assessmentId) throw new Error('Assessment ID is required');

    // Format request body to match API requirements exactly
    const requestBody = {
      title: assessmentData.title,
      description: assessmentData.description,
      type: assessmentData.type,
      max_score: assessmentData.max_score,
      passing_score: assessmentData.passing_score,
      duration_minutes: assessmentData.duration_minutes,
      due_date: assessmentData.due_date,
      is_published: assessmentData.is_published,
      instructions: assessmentData.instructions
    };

    const response = await fetchWithInterceptor(`${API_BASE_URL}/assessments/${assessmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update assessment');
    }

    return data;
  } catch (error) {
    console.error('Error updating assessment:', error);
    throw error;
  }
};

/**
 * Deletes an assessment and all its questions
 * @param {number} assessmentId - The assessment ID to delete
 * @returns {Promise<Object>} Response object
 */
export const deleteAssessment = async (assessmentId) => {
  try {
    const response = await fetchWithInterceptor(`${API_BASE_URL}/assessments/${assessmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete assessment');
    }

    return {
      success: true,
      message: data.message || 'Assessment deleted successfully'
    };
  } catch (error) {
    console.error('Error in deleteAssessment:', error);
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update question');
    }
    return data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

/**
 * Deletes a question
 * @param {number} assessmentId - The assessment ID
 * @param {number} questionId - The question ID to delete
 * @returns {Promise<Object>} Response object
 */
export const deleteQuestion = async (assessmentId, questionId) => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/assessments/${assessmentId}/questions/${questionId}`,
      {
        method: 'DELETE',
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete question');
    }
    return data;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};