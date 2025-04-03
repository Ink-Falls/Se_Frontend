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

// Add this helper function before the component
const calculateTotalPoints = (answers) => {
  if (!answers || !Array.isArray(answers)) return 0;
  
  // Calculate earned points
  const earnedPoints = answers.reduce((total, answer) => {
    if (answer.is_auto_graded && answer.points_awarded !== null) {
      return total + (answer.points_awarded || 0);
    }
    if (answer.manual_grade !== null) {
      return total + (answer.manual_grade || 0);
    }
    return total;
  }, 0);

  // Calculate total possible points
  const totalPossiblePoints = answers.reduce((total, answer) => {
    // Add the question's points to the total
    return total + (answer.question?.points || 0);
  }, 0);

  return {
    earned: earnedPoints,
    total: totalPossiblePoints
  };
};

const getStatus = (submission) => {
  if (!submission) return "Not Started";
  if (submission.is_late) return "Late";
  return submission.status?.charAt(0).toUpperCase() + submission.status?.slice(1) || "Not Started";
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "graded":
      return "bg-green-100 text-green-800";
    case "submitted":
      return "bg-yellow-100 text-yellow-800";
    case "late":
      return "bg-red-100 text-red-800";
    case "not started":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const LearnerAssessmentView = () => {
  const { selectedCourse } = useCourse();
  const navigate = useNavigate();
  const location = useLocation();
  const { assessment, submission: initialSubmission, status, error: routeError } = location.state || {};
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
        const submissionResponse = await getUserSubmission(assessment.id, true);
        
        if (submissionResponse?.success) {
          // Check specifically for in-progress submission
          if (submissionResponse.submission?.status === 'in_progress') {
            setExistingSubmission(submissionResponse.submission);
            console.log('Found in-progress submission:', submissionResponse.submission);
          }
          
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

  useEffect(() => {
    if (routeError === 'Maximum attempts reached') {
      setError('You have reached the maximum number of allowed attempts for this assessment.');
    }
  }, [routeError]);

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

  const handleStartNewAttempt = async () => {
    try {
      const storedSubmissionData = localStorage.getItem(`ongoing_assessment_${assessment.id}`);
      let storedSubmissionId = null;
      
      if (storedSubmissionData) {
        const parsedData = JSON.parse(storedSubmissionData);
        storedSubmissionId = parsedData.submissionId;
        console.log('Found stored submission before start:', storedSubmissionId);
      }
  
      const submissionResponse = await getUserSubmission(assessment.id, true);
      let existingSubmission = null;
  
      if (submissionResponse.success && submissionResponse.submission?.status === 'in_progress') {
        existingSubmission = submissionResponse.submission;
        console.log('Submission validation:', {
          storedId: storedSubmissionId,
          existingId: existingSubmission.id,
          matches: storedSubmissionId === existingSubmission.id,
          status: existingSubmission.status
        });
      }
  
      navigate(`/Learner/Assessment/Attempt/${assessment.id}`, {
        state: { 
          assessment,
          submission: existingSubmission 
        }
      });
    } catch (error) {
      console.error('Error validating submission:', error);
      setError('Failed to start assessment. Please try again.');
    }
  };

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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">
              {assessmentData?.title || assessment?.title}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getStatus(initialSubmission))}`}>
              {getStatus(initialSubmission)}
            </span>
          </div>
          <p className="text-gray-200 flex items-center gap-2">
            <Clock size={16} />
            Due: {assessment?.due_date && new Date(assessment.due_date).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-300 mt-2">
            {assessment?.description}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">
            Passing Score: {assessment?.passing_score || '0'}%
          </p>
          <p className="text-sm text-gray-300">
            Duration: {assessment?.duration_minutes || '0'} minutes
          </p>
        </div>
      </div>
    </div>
  );

  const renderSubmissionStatus = () => {
    if (error || routeError === 'Maximum attempts reached') {
      return (
        <div className="text-center py-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="text-xl font-medium text-gray-900 mt-4 mb-2">
            {location.state?.errorDetails || error || "Maximum number of attempts has been reached"}
          </h3>
          <button
            onClick={() => navigate("/Learner/Assessment")}
            className="mt-4 px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors"
          >
            Back to Assessments
          </button>
        </div>
      );
    }

    // Check for resumable submission from various sources
    const { isResumable: hasStoredSubmission } = location.state || {};
    const isInProgress = initialSubmission?.status === 'in_progress';
    const hasNotSubmitted = isInProgress && !initialSubmission?.submit_time;
    const canResume = hasStoredSubmission || hasNotSubmitted || existingSubmission?.status === 'in_progress';
    
    if (canResume) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <Clock size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-4">
            Assessment In Progress
          </h3>
          <p className="text-gray-500 mb-6">
            You have an unfinished attempt. Would you like to resume?
          </p>
          <button
            onClick={handleStartNewAttempt}
            className="px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors"
          >
            Resume Attempt
          </button>
        </div>
      );
    }

    if (!initialSubmission) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <ClipboardList size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-4">
            Not Started
          </h3>
          <p className="text-gray-500 mb-6">
            You haven't attempted this assessment yet.
          </p>
          <button
            onClick={handleStartNewAttempt}
            className="px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors"
          >
            Start New Attempt
          </button>
        </div>
      );
    }

    // Show completed submission
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Check className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-2 text-lg font-medium">Latest Attempt</h3>
          <p className="text-sm text-gray-500">
            Submitted on: {new Date(initialSubmission.submit_time).toLocaleString()}
          </p>
          
          {initialSubmission.total_score !== undefined && (
            <div className="mt-4 text-2xl font-bold">
              Score: {calculateTotalPoints(initialSubmission.answers).earned}/{calculateTotalPoints(initialSubmission.answers).total}
            </div>
          )}

          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529]"
            >
              {showAnswers ? 'Hide My Answers' : 'Show My Answers'}
            </button>
            <button
              onClick={handleStartNewAttempt}
              className="px-4 py-2 border-2 border-[#212529] text-[#212529] rounded-md hover:bg-[#F6BA18] hover:border-[#F6BA18]"
            >
              Start New Attempt
            </button>
          </div>
        </div>

        {/* Show answers section */}
        {showAnswers && initialSubmission.answers && (
          <div className="mt-6 space-y-6">
            <h4 className="text-lg font-medium text-gray-900">Your Answers</h4>
            {questions.map((question, index) => {
              const answer = initialSubmission.answers.find(a => a.question_id === question.id);
              return (
                <div key={question.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="text-md font-medium text-gray-900">Question {index + 1}</h5>
                    <span className="text-sm text-gray-500">Points: {question.points}</span>
                  </div>
                  <p className="text-gray-700 mb-4">{question.question_text}</p>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm font-medium text-gray-700">Your Answer:</p>
                    <div className="mt-2">
                      {answer ? (
                        answer.selected_option ? (
                          <p className="text-gray-800">{answer.selected_option.option_text}</p>
                        ) : (
                          <p className="text-gray-800">{answer.text_response || 'No response'}</p>
                        )
                      ) : (
                        <p className="text-gray-500 italic">Not answered</p>
                      )}
                    </div>
                    {answer?.points_awarded !== undefined && (
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Score:</span>
                        <span className="text-sm text-gray-900">{answer.points_awarded}/{question.points}</span>
                      </div>
                    )}
                    {answer?.feedback && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700">Feedback:</p>
                        <p className="mt-1 text-sm text-gray-600">{answer.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
            {/* Header section with assessment details */}
            {renderHeader()}
            
            {/* Instructions section */}
            <div className="p-6 border-b border-gray-200">
              {/* ...existing instructions code... */}
            </div>

            {/* Submission status and answers section */}
            <div className="p-6">
              {loading ? (
                <LoadingSpinner />
              ) : error ? (
                <div className="text-center text-red-600">{error}</div>
              ) : (
                renderSubmissionStatus()
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerAssessmentView;
