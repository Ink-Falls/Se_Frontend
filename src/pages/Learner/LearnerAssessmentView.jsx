import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCourse } from "../../contexts/CourseContext"; 
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import SubmissionHistoryDropdown from "../../components/assessment/SubmissionHistoryDropdown"; 
import {
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
  Clock,
  ArrowLeft,
  FileText,
  AlertTriangle,
  Check
} from "lucide-react";
import { 
  getAssessmentById, 
  createSubmission,
  saveQuestionAnswer,
  submitAssessment,
  getUserSubmission 
} from "../../services/assessmentService";

const LearnerAssessmentView = () => {
  const { selectedCourse } = useCourse();
  const navigate = useNavigate();
  const location = useLocation();
  const { assessment } = location.state || {};
  const [textAnswer, setTextAnswer] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [submission, setSubmission] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submissionId, setSubmissionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [progressData, setProgressData] = useState([]); // Add this state
  const [showAnswers, setShowAnswers] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timer, setTimer] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  useEffect(() => {
    if (!selectedCourse?.id) {
      navigate('/Learner/Dashboard');
      return;
    }
  }, [selectedCourse, navigate]);

  useEffect(() => {
    const fetchAssessmentDetails = async () => {
      try {
        setLoading(true);
        const response = await getAssessmentById(assessment.id, true, false);
        
        if (response.success && response.assessment) {
          const assessmentData = {
            ...response.assessment,
            formattedDueDate: new Date(response.assessment.due_date).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          };

          setAssessmentData(assessmentData);
          setQuestions(assessmentData.questions || []);
          
          // Initialize progress data for each question
          const progress = assessmentData.questions.map(question => ({
            questionId: question.id,
            answered: false,
            answer: null
          }));
          setProgressData(progress);
        } else {
          throw new Error(response.message || 'Failed to fetch assessment');
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Failed to load assessment');
        setQuestions([]);
        setProgressData([]);
      } finally {
        setLoading(false);
      }
    };

    if (assessment?.id) {
      fetchAssessmentDetails();
    }
  }, [assessment?.id]);

  useEffect(() => {
    const fetchAssessmentAndSubmission = async () => {
      try {
        if (!assessment?.id) {
          throw new Error('Assessment ID is missing');
        }

        setLoading(true);
        setError(null);

        // Get submission data which includes assessment details
        const submissionResponse = await getUserSubmission(assessment.id, showAnswers);
        
        if (submissionResponse?.success) {
          // Set submission data
          if (submissionResponse.submission) {
            setExistingSubmission(submissionResponse.submission);
          }
          
          // Set assessment data from the submission response
          if (submissionResponse.assessment) {
            const assessmentData = {
              ...submissionResponse.assessment,
              formattedDueDate: new Date(submissionResponse.assessment.due_date).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            };
            setAssessmentData(assessmentData);
            setQuestions(assessmentData.questions || []);
          }
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Failed to load assessment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentAndSubmission();
  }, [assessment?.id, showAnswers]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        if (!assessment?.id) return;
        const response = await getUserSubmission(assessment.id, true);
        if (response.success) {
          setSubmissions(response.submissions || []);
          // Set the most recent submission as selected
          if (response.submissions?.length > 0) {
            setSelectedSubmission(response.submissions[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to fetch submission history');
      }
    };

    fetchSubmissions();
  }, [assessment?.id]);

  if (!assessment) {
    navigate("/Learner/Assessment");
    return null;
  }

  const navItems = [
    { text: "Home", icon: <Home size={20} />, route: "/Learner/Dashboard" },
    {
      text: "Modules",
      icon: <BookOpen size={20} />,
      route: "/Learner/CourseModules",
    },
    {
      text: "Announcements",
      icon: <Megaphone size={20} />,
      route: "/Learner/CourseAnnouncements",
    },
    {
      text: "Assessments",
      icon: <ClipboardList size={20} />,
      route: `/Learner/Assessment/View/${assessment?.id}`, // Update this route to match current page
    },
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        if (pdfPreviewUrl) {
          URL.revokeObjectURL(pdfPreviewUrl);
        }
        setPdfPreviewUrl(URL.createObjectURL(file));
        setError("");
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setSelectedFile(file);
        setPdfPreviewUrl(null);
        setError("");
      } else {
        setError("Please upload only PDF or DOCX files");
        setSelectedFile(null);
        setPdfPreviewUrl(null);
        e.target.value = null;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentTime = new Date();

    const newSubmission = {
      id: Date.now(),
      textAnswer,
      fileName: selectedFile?.name,
      submittedAt: currentTime,
      lastEdited: null,
    };

    setSubmission(newSubmission);
    setSubmissionHistory([...submissionHistory, newSubmission]);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdateSubmission = async (e) => {
    e.preventDefault();
    const currentTime = new Date();

    const updatedSubmission = {
      ...submission,
      textAnswer,
      fileName: selectedFile?.name,
      lastEdited: currentTime,
    };

    setSubmission(updatedSubmission);
    setSubmissionHistory([...submissionHistory, updatedSubmission]);
    setIsEditing(false);
  };

  const handleStartAssessment = async () => {
    try {
      setLoading(true);
      // Set hasStarted early to prevent double rendering issues
      setHasStarted(true);
      
      const response = await createSubmission(assessment.id);
      
      if (response.success) {
        // Store assessment ID directly in a local variable or component state for immediate access
        setSubmissionId(response.submission.id);
        
        // Store more detailed information in localStorage
        try {
          localStorage.setItem(`submission_${response.submission.id}`, JSON.stringify({
            assessmentId: assessment.id,
            startTime: new Date().toISOString(),
            assessmentTitle: assessment.title,
            // Store question type information to determine if manual grading is needed
            hasManualQuestions: (assessment.questions || []).some(q => 
              q.question_type === 'short_answer' || q.question_type === 'essay'
            )
          }));
        } catch (e) {
          console.warn('Could not store submission data in localStorage:', e);
        }
        
        setAnswers({});
        setCurrentQuestionIndex(0);
        setExistingSubmission(null); // Clear existing submission
        setShowAnswers(false);
        
        // Reset progress data
        const newProgress = questions.map(question => ({
          questionId: question.id,
          answered: false,
          answer: null
        }));
        setProgressData(newProgress);
        
        // Set timer
        const durationInSeconds = assessmentData.duration_minutes * 60;
        setTimeRemaining(durationInSeconds);
        setStartTime(new Date());
        
        // Add new submission to history
        setSubmissions(prev => [response.submission, ...prev]);
      } else {
        // If there's an error, reset hasStarted
        setHasStarted(false);
        throw new Error(response.message || 'Failed to start assessment');
      }
    } catch (err) {
      // Make sure hasStarted is reset on error
      setHasStarted(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add timer effect - Combined both timer effects into one
  useEffect(() => {
    if (hasStarted && timeRemaining !== null) {
      const timerInterval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            handleSubmitAssessment(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimer(timerInterval);

      return () => clearInterval(timerInterval);
    }
  }, [hasStarted, timeRemaining]);

  // Format time remaining - Single source of truth
  const formatTimeRemaining = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = async (questionId, answer, questionType) => {
    try {
      
      // Update the local state first for immediate feedback
      if (questionType === 'multiple_choice' || questionType === 'true_false') {
        // For radio buttons/multiple choice, update with option ID
        const parsedOptionId = parseInt(answer, 10);
        
        setAnswers(prev => ({
          ...prev,
          [questionId]: {
            ...(prev[questionId] || {}),
            selected_option_id: parsedOptionId,
            text_response: ''
          }
        }));

        // Update progress data to show this question was answered
        setProgressData(prev => prev.map(p => 
          p.questionId === questionId 
            ? { ...p, answered: true, answer: { selected_option_id: parsedOptionId } }
            : p
        ));
        
        // Then prepare data for API call
        const answerData = {
          optionId: parsedOptionId
        };
        
        // Validate answer data
        if (Number.isNaN(answerData.optionId)) {
          throw new Error('Invalid option ID');
        }
        
        // Send to API
        const response = await saveQuestionAnswer(submissionId, questionId, answerData);
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to save answer');
        }
      } else {
        // For text inputs/essays, update with text response
        setAnswers(prev => ({
          ...prev,
          [questionId]: {
            ...(prev[questionId] || {}),
            selected_option_id: null,
            text_response: answer
          }
        }));
        
        // Update progress data to show this question was answered
        setProgressData(prev => prev.map(p => 
          p.questionId === questionId 
            ? { ...p, answered: true, answer: { text_response: answer } }
            : p
        ));

        // Then prepare data for API call
        const answerData = {
          textResponse: answer
        };
        
        // Send to API
        const response = await saveQuestionAnswer(submissionId, questionId, answerData);
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to save answer');
        }
      }
    } catch (err) {
      console.error('Error saving answer:', err);
      setError(err.message || 'Failed to save answer');
    }
  };

  const handleSubmitAssessment = async () => {
    try {
      setIsSubmitting(true);
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
      
      const endTime = new Date();
      const timeTaken = Math.floor((endTime - startTime) / 1000);

      const response = await submitAssessment(submissionId, assessment.id);
      
      if (response.success) {
        // Fetch the latest submission details after successful submission
        const submissionResponse = await getUserSubmission(assessment.id, true);
        
        if (submissionResponse.success && submissionResponse.submission) {
          const latestSubmission = submissionResponse.submission;
          
          // Ensure we have the latest submit_time
          const submissionWithTime = {
            ...latestSubmission,
            submit_time: latestSubmission.submit_time || response.submit_time || new Date().toISOString()
          };
          
          setExistingSubmission(submissionWithTime);
          setHasStarted(false);
          setSubmitResult({
            success: true,
            message: 'Assessment submitted successfully',
            submission: submissionWithTime
          });
          
          // Update submissions list with the latest submission
          setSubmissions(prev => [submissionWithTime, ...prev.filter(s => s.id !== submissionWithTime.id)]);
          
          setShowSubmitModal(true);
          setTimeRemaining(0);
        } else {
          throw new Error('Failed to fetch updated submission details');
        }
      } else {
        throw new Error(response.message || 'Failed to submit assessment');
      }
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError(err.message || 'Failed to submit assessment. Please try again.');
      setIsSubmitting(false);
      setShowSubmitModal(true);
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update SubmitResultModal to handle errors
  const SubmitResultModal = () => {
    if (!showSubmitModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            {error ? (
              <>
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Submission Failed</h2>
                <p className="text-gray-600 mb-6">{error}</p>
              </>
            ) : (
              <>
                <Check className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Assessment Submitted!</h2>
                <p className="text-gray-600 mb-6">
                  Your assessment has been submitted successfully.
                </p>
              </>
            )}
            <button
              onClick={() => {
                if (error) {
                  setShowSubmitModal(false);
                  setError(null);
                } else {
                  navigate('/Learner/Assessment');
                }
              }}
              className="px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529]"
            >
              {error ? 'Try Again' : 'Return to Assessments'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Update useEffect to handle initial loading and submission status
  useEffect(() => {
    const fetchAssessmentAndSubmission = async () => {
      try {
        if (!assessment?.id) return;
        
        setLoading(true);
        setError(null);
        
        const submissionResponse = await getUserSubmission(assessment.id, true);
        
        if (submissionResponse.success) {
          const submission = submissionResponse.submission;
          setExistingSubmission(submission);
          
          // If there's a submission and it's already submitted, update the UI accordingly
          if (submission?.status === 'submitted' || submission?.status === 'graded') {
            setHasStarted(false);
            setShowAnswers(true);
          }
        }
      } catch (err) {
        console.error('Error fetching assessment details:', err);
        setError(err.message || 'Failed to load assessment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentAndSubmission();
  }, [assessment?.id]);

  const renderQuestion = (question) => {
    if (!question) return null;
    
    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <div>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-700">Select your answer:</h4>
              <span className="text-sm text-gray-500">Points: {question.points}</span>
            </div>
            <div className="space-y-3">
              {question.options?.map(option => (
                <div 
                  key={option.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border 
                    ${existingSubmission?.status === 'graded' && option.is_correct ? 'bg-green-50 border-green-200' : ''}
                    hover:bg-gray-50 cursor-pointer
                  `}
                  onClick={() => handleAnswerChange(question.id, option.id, 'multiple_choice')}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.id}
                    checked={answers[question.id]?.selected_option_id === option.id}
                    onChange={() => {}} // Changed to empty function since onClick is on the parent div
                    className="h-4 w-4 text-yellow-600 cursor-pointer"
                    disabled={existingSubmission?.status === 'graded' || loading}
                  />
                  <span className="flex-1">{option?.option_text || option?.text || 'No option text'}</span>
                  {existingSubmission?.status === 'graded' && option.is_correct && (
                    <span className="text-green-600 text-sm">✓ Correct Answer</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'true_false':
        return (
          <div>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-700">Select True or False:</h4>
              <span className="text-sm text-gray-500">Points: {question.points}</span>
            </div>
            <div className="space-y-3">
              {question.options?.map(option => (
                <div 
                  key={option.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border
                    ${existingSubmission?.status === 'graded' && option.is_correct ? 'bg-green-50 border-green-200' : ''}
                    hover:bg-gray-50 cursor-pointer
                  `}
                  onClick={() => handleAnswerChange(question.id, option.id, 'true_false')}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.id}
                    checked={answers[question.id]?.selected_option_id === option.id}
                    onChange={() => {}} // Changed to empty function since onClick is on the parent div
                    className="h-4 w-4 text-yellow-600 cursor-pointer"
                    disabled={existingSubmission?.status === 'graded' || loading}
                  />
                  <span className="flex-1">{option?.option_text || option?.text || 'No option text'}</span>
                  {existingSubmission?.status === 'graded' && option.is_correct && (
                    <span className="text-green-600 text-sm">✓ Correct Answer</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'short_answer':
        return (
          <input
            type="text"
            value={answers[question.id]?.text_response || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value, 'short_answer')}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="Enter your answer"
            disabled={loading}
          />
        );

      case 'essay':
        return (
          <textarea
            value={answers[question.id]?.text_response || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value, 'essay')}
            className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="Write your essay answer"
            disabled={loading}
          />
        );

      default:
        return null;
    }
  };

  const renderPdfPreview = () => {
    if (!pdfPreviewUrl) return null;

    return (
      <div className="mt-4 border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium text-gray-700 mb-2">PDF Preview</h4>
        <div className="overflow-auto" style={{ height: "500px" }}>
          <iframe
            src={pdfPreviewUrl}
            className="w-full h-full border-0"
            title="PDF Preview"
          />
        </div>
      </div>
    );
  };

  const renderQuestionProgress = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-600">{error}</div>;
    if (!Array.isArray(questions) || questions.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestionIndex(index)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
              ${currentQuestionIndex === index 
                ? 'ring-2 ring-yellow-500 ring-offset-2'
                : ''} 
              ${progressData[index]?.answered
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600'}
            `}
          >
            {index + 1}
          </button>
        ))}
      </div>
    );
  };

  const renderQuestionsSection = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-600">{error}</div>;
    if (!Array.isArray(questions) || !questions[currentQuestionIndex]) {
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-center">No questions available</p>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">
          {questions[currentQuestionIndex].question_text}
        </h3>
        {renderQuestion(questions[currentQuestionIndex])}
      </div>
    );
  };

  const calculateTotalPoints = (questions = []) => {
    const total = questions.reduce((sum, question) => {
      return sum + (parseInt(question.points) || 0);
    }, 0);
    return total;
  };

  const renderAnswerFeedback = (question, answer) => {
    if (!existingSubmission || existingSubmission.status !== 'graded') {
      return null;
    }

    switch (question.question_type) {
      case 'multiple_choice':
      case 'true_false':
        const correctOption = question.options.find(opt => opt.is_correct);
        return (
          <div className="mt-3 p-3 bg-green-50 rounded">
            <p className="text-sm font-medium text-green-700">Correct Answer:</p>
            <p className="text-green-600">{correctOption?.option_text}</p>
            {answer?.feedback && (
              <p className="mt-2 text-sm text-blue-600">
                Feedback: {answer.feedback}
              </p>
            )}
          </div>
        );

      case 'short_answer':
      case 'essay':
        return (
          <div className="mt-3 p-3 bg-green-50 rounded">
            <p className="text-sm font-medium text-green-700">Answer Key:</p>
            <p className="text-green-600">{question.answer_key}</p>
            {answer?.feedback && (
              <p className="mt-2 text-sm text-blue-600">
                Feedback: {answer.feedback}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderAnswerWithFeedback = (question, answer) => {
    if (!answer) {
      return <div className="text-gray-500">Not answered</div>;
    }

    const yourAnswer = answer.selected_option_id 
      ? (answer.selected_option?.option_text || answer.selected_option?.text || 'No answer text')
      : answer.text_response;

    const isManualGradingType = question.question_type === 'essay' || question.question_type === 'short_answer'; // Removed extra parenthesis

    return (
      <div className="space-y-3">
        {/* Your Answer Section */}
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-600">Your Answer:</p>
          <div className="mt-1 p-2 bg-gray-50 rounded text-gray-700">
            {yourAnswer || 'No response'}
          </div>
        </div>

        {/* Points Section - modified to show "not graded" message */}
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-600">Points:</p>
          {(answer.points_awarded == null && isManualGradingType) ? (
            <div className="mt-1 p-2 bg-yellow-50 text-yellow-700 rounded">
              The teacher has not yet graded this question
            </div>
          ) : (
            <div className={`mt-1 p-2 rounded ${
              answer.points_awarded === question.points
                ? 'bg-green-50 text-green-700'
                : answer.points_awarded === 0
                  ? 'bg-red-50 text-red-700'
                  : 'bg-yellow-50 text-yellow-700'
            }`}>
              {answer.points_awarded === null ? '-' : `${answer.points_awarded}/${question.points}`}
            </div>
          )}
        </div>
        
        {/* Feedback Section */}
        {answer.feedback && (
          <div className="mt-2">
            <p className="text-sm font-medium text-blue-600">Feedback:</p>
            <div className="mt-1 p-2 bg-blue-50 rounded text-blue-700">
              {answer.feedback}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderExistingSubmissionAnswers = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Check className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-2 text-lg font-medium">Assessment Already Submitted</h3>
        <p className="mt-1 text-sm text-gray-500">
          You have already completed this assessment.
        </p>
        {existingSubmission?.answers ? (
          <div className="mt-4 text-2xl font-bold">
            {(() => {
              const totalPoints = calculateTotalPoints(questions);
              
              
              const score = existingSubmission.answers.reduce((sum, answer) => {
                const question = questions.find(q => q.id === answer.question_id);
                
                
                if (!question) return sum;
        
                // Check for manual grading types first
                if (question.question_type === 'essay' || question.question_type === 'short_answer') {
                  // If points_awarded is null, don't add anything to the sum
                  if (answer.points_awarded === null) {
                    return sum;
                  }
                  return sum + (parseInt(answer.points_awarded) || 0);
                }
        
                // For multiple choice and true/false
                if (['multiple_choice', 'true_false'].includes(question.question_type)) {
                  // If points were manually awarded, use them
                  if (answer.points_awarded !== null) {
                    return sum + parseInt(answer.points_awarded);
                  }
        
                  // Auto-grade based on correct answer
                  const selectedOption = question.options?.find(opt => opt.id === answer.selected_option_id);
                  if (selectedOption?.is_correct) {
                    return sum + parseInt(question.points);
                  }
                }
                
                return sum;
              }, 0);
        
              return `Score: ${score}/${totalPoints}`;
            })()}
          </div>
        ) : null /* Remove the else block that showed "Not yet graded" */}
        
        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529]"
          >
            {showAnswers ? 'Hide My Answers' : 'Show My Answers'}
          </button>
          <button
            aria-label="start"
            onClick={handleStartAssessment}
            className="px-4 py-2 border-2 border-[#212529] text-[#212529] rounded-md hover:bg-[#F6BA18] hover:border-[#F6BA18] hover:text-[#212529]"
           
          >
            Start New Attempt
          </button>
        </div>
      </div>

      {/* Show submission history if available */}
      {submissions.length > 1 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            Previous attempts: {submissions.length}
          </p>
          <p className="mt-2 text-sm font-medium text-yellow-800">
            Best Score: {Math.max(...submissions.map(s => s.score || 0))}/{assessmentData?.max_score}
          </p>
        </div>
      )}
      
      {showAnswers && (
        <div className="mt-6 bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-lg mb-4">Your Answers</h4>
          <div className="space-y-4">
            {questions.map((question, index) => {
              // Find the answer from the submission answers array instead of progressData
              const answer = existingSubmission.answers?.find(a => a.question_id === question.id);
              return (
                <div key={question.id} className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="font-medium text-gray-900">Question {index + 1}</div>
                  <div className="mt-2 text-gray-600">{question.question_text}</div>
                  <div className="mt-2 text-sm text-gray-500">
                    Your answer: {
                      answer ? (
                        answer.selected_option_id 
                          ? question.options?.find(o => o.id === answer.selected_option_id)?.option_text
                          : answer.text_response || 'No response'
                      ) : 'Not answered'
                    }
                  </div>
                  {renderAnswerWithFeedback(question, answer)}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderSubmissionSection = () => (
    <div className="p-6">
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : existingSubmission && !hasStarted ? (
        // Only show existing submission view when not starting a new attempt
        <div>
          {renderExistingSubmissionAnswers()}
        </div>
      ) : !hasStarted ? (
        // Show "Ready to Start" when no submission exists or not started
        <div className="text-center">
          <h3 className="text-lg font-medium">Ready to Start?</h3>
          <p className="mt-1 text-sm text-gray-500">
            You will have {assessmentData?.duration_minutes} minutes to complete this assessment.
          </p>
          <button
            onClick={handleStartAssessment}
            className="mt-4 px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529]"
            disabled={loading}
          >
            {loading ? 'Starting...' : 'Start New Attempt'}
          </button>
        </div>
      ) : (
        // Show question navigation when assessment is in progress
        <div className="space-y-6">
          {renderQuestionProgress()}
          {/* Question Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span>Question {currentQuestionIndex + 1} of {questions?.length || 0}</span>
            <button
              onClick={() => {
                if (currentQuestionIndex === (questions?.length || 0) - 1) {
                  handleSubmitAssessment();
                } else {
                  setCurrentQuestionIndex(prev => Math.min((questions?.length || 0) - 1, prev + 1));
                }
              }}
              className="px-4 py-2 bg-[#212529] text-white rounded-md"
              disabled={isSubmitting || !questions?.length}
            >
              {currentQuestionIndex === (questions?.length || 0) - 1 ? 'Submit' : 'Next'}
            </button>
          </div>

          {/* Current Question */}
          {renderQuestionsSection()}
        </div>
      )}

      {submissionHistory.length > 1 && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h4 className="font-medium text-gray-900 mb-4">
            Submission History
          </h4>
          <div className="space-y-3">
            {submissionHistory.slice(0, -1).map((entry, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-600">
                  Version {index + 1}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(entry.submittedAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderHeader = () => (
    <div className="relative bg-gradient-to-r from-gray-800 to-gray-700 p-8 text-white">
      <button
        onClick={() => navigate("/Learner/Assessment")}
        className="flex items-center gap-2 text-gray-100 hover:text-[#F6BA18] transition-colors mb-4 group"
      >
        <ArrowLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span>Back to Assessments</span>
      </button>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {assessmentData?.title}
          </h1>
          <p aria-label="due" className="text-gray-200 flex items-center gap-2">
            <Clock size={16} />
            Due: {assessmentData?.due_date && new Date(assessmentData.due_date).toLocaleDateString()}
          </p>
          {hasStarted && timeRemaining !== null && (
            <div className="mt-2 text-xl font-mono">
              Time Remaining: {formatTimeRemaining(timeRemaining)}
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="mt-3 text-lg font-semibold">
            Passing Score: {assessmentData?.passing_score || '0'}%
          </p>
          <p className="text-sm text-gray-300">
            Duration: {assessmentData?.duration_minutes || '0'} minutes
          </p>
        </div>
      </div>
    </div>
  );

  const calculateAutoGradedScore = (submission) => {
    if (!submission?.answers) return { total: 0, possible: 0 };
    
    const scores = submission.answers.reduce((acc, answer) => {
      const question = submission.assessment?.questions?.find(q => q.id === answer.question_id);
      
      if (!question) return acc;
  
      // Auto-grade multiple choice and true/false questions
      if ((question.question_type === 'multiple_choice' || question.question_type === 'true_false') 
          && answer.selected_option_id) {
        const selectedOption = question.options?.find(opt => opt.id === answer.selected_option_id);
        const isCorrect = selectedOption?.is_correct || false;
        
        return {
          total: acc.total + (isCorrect ? (question.points || 0) : 0),
          possible: acc.possible + (question.points || 0)
        };
      }
      
      // For manual grading questions, use points_awarded if available
      if (answer.points_awarded !== null && answer.points_awarded !== undefined) {
        return {
          total: acc.total + (parseInt(answer.points_awarded) || 0),
          possible: acc.possible + (question.points || 0)
        };
      }
  
      return {
        total: acc.total,
        possible: acc.possible + (question.points || 0)
      };
    }, { total: 0, possible: 0 });
  
    return scores;
  };
  
  // Update the renderSubmissionScore function
  const renderSubmissionScore = (submission, assessment) => {
    if (!submission || !submission.status || submission.status === "null") {
      return <div className="text-sm text-gray-600">Not Started</div>;
    }
  
    const scores = calculateAutoGradedScore(submission);
    
    return (
      <div className="text-2xl font-bold text-gray-900">
        {scores.total}/{scores.possible}
        {submission.status === "graded" && (
          <div className="text-sm text-gray-500 mt-1">
            Final Grade
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-auto">
        <Header 
          title={selectedCourse?.name || "Assessment"}
          subtitle={selectedCourse?.code} 
        />
        <div className="max-w-7xl mx-auto">
          <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
            {renderHeader()}
            {/* Instructions Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText size={20} className="text-gray-500" />
                  Instructions
                </h3>
                <div className="prose max-w-none text-gray-600">
                  {assessmentData?.instructions || "No instructions provided."}
                </div>
              </div>
            </div>

            {/* Submission Section */}
            {renderSubmissionSection()}
          </div>
        </div>
        <SubmitResultModal />
      </div>
    </div>
  );
};

export default LearnerAssessmentView;
