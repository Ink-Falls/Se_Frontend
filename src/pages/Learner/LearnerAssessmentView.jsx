import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCourse } from "../../contexts/CourseContext";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Check,
  Users,
} from "lucide-react";
import {
  getAssessmentById,
  getUserSubmission,
  getUserSubmissionCount,
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
    total: totalPossiblePoints,
  };
};

const getStatus = (submission) => {
  if (!submission) return "Not Started";
  if (submission.is_late) return "Late";
  return (
    submission.status?.charAt(0).toUpperCase() + submission.status?.slice(1) ||
    "Not Started"
  );
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

const renderQuestionWithAnswer = (question, index, submission) => (
  <div key={question.id} className="bg-white rounded-lg shadow-sm p-6 mb-4">
    <div className="flex items-center gap-2 mb-4">
      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
        Question {index + 1}
      </span>
      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
        {question.points} Points
      </span>
    </div>

    <p className="text-lg text-gray-800 mb-4">{question.question_text}</p>

    {/* Add Media Display */}
    {question.media_url && (
      <div className="mb-4">
        {question.media_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
          <img
            src={question.media_url}
            alt="Question media"
            className="max-w-md rounded-lg border border-gray-200"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-200">
            <a
              href={question.media_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View attached media
            </a>
          </div>
        )}
      </div>
    )}

    {/* Rest of the question and answer display */}
    <div className="bg-gray-50 p-4 rounded-md">
      <p className="text-sm font-medium text-gray-700">Your Answer:</p>
      <div className="mt-2">
        {submission ? (
          submission.selected_option ? (
            <p className="text-gray-800">
              {submission.selected_option.option_text}
            </p>
          ) : (
            <p className="text-gray-800">
              {submission.text_response || "No response"}
            </p>
          )
        ) : (
          <p className="text-gray-500 italic">Not answered</p>
        )}
      </div>
      {submission?.points_awarded !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Score:</span>
          <span className="text-sm text-gray-900">
            {submission.points_awarded}/{question.points}
          </span>
        </div>
      )}
      {submission?.feedback && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700">Feedback:</p>
          <p className="mt-1 text-sm text-gray-600">{submission.feedback}</p>
        </div>
      )}
    </div>
  </div>
);

const LearnerAssessmentView = () => {
  const { selectedCourse } = useCourse();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    assessment,
    submission: initialSubmission,
    status,
    error: routeError,
  } = location.state || {};
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
  const [latestSubmission, setLatestSubmission] = useState(null);
  const [submissionCount, setSubmissionCount] = useState(0);

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  useEffect(() => {
    if (!selectedCourse?.id) {
      navigate("/Learner/Dashboard");
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
            formattedDueDate: new Date(
              response.assessment.due_date
            ).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          setAssessmentData(assessmentData);
          setQuestions(assessmentData.questions || []);

          // Initialize progress data for each question
          const progress = assessmentData.questions.map((question) => ({
            questionId: question.id,
            answered: false,
            answer: null,
          }));
          setProgressData(progress);
        } else {
          throw new Error(response.message || "Failed to fetch assessment");
        }
      } catch (err) {
        console.error("Error:", err);
        setError(err.message || "Failed to load assessment");
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
          throw new Error("Assessment ID is missing");
        }

        setLoading(true);
        setError(null);

        // Get submission data which includes assessment details
        const submissionResponse = await getUserSubmission(assessment.id, true);

        if (submissionResponse?.success) {
          // Check specifically for in-progress submission
          if (submissionResponse.submission?.status === "in_progress") {
            setExistingSubmission(submissionResponse.submission);
            console.log(
              "Found in-progress submission:",
              submissionResponse.submission
            );
          }

          if (submissionResponse.assessment) {
            const assessmentData = {
              ...submissionResponse.assessment,
              formattedDueDate: new Date(
                submissionResponse.assessment.due_date
              ).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
            setAssessmentData(assessmentData);
            setQuestions(assessmentData.questions || []);
          }
        }
      } catch (err) {
        console.error("Error:", err);
        setError(err.message || "Failed to load assessment details");
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
        console.error("Error fetching submissions:", err);
        setError("Failed to fetch submission history");
      }
    };

    fetchSubmissions();
  }, [assessment?.id]);

  useEffect(() => {
    const fetchSubmissionCount = async () => {
      try {
        if (!assessment?.id) return;
        const response = await getUserSubmissionCount(assessment.id, false);
        if (response.success) {
          setSubmissionCount(response.count || 0);
          console.log("Submission count updated:", response.count); // Debugging
        }
      } catch (err) {
        console.error("Error fetching submission count:", err);
        setError("Failed to fetch submission count");
      }
    };

    fetchSubmissionCount();
  }, [assessment?.id]);

  useEffect(() => {
    if (routeError === "Maximum attempts reached") {
      setError(
        "You have reached the maximum number of allowed attempts for this assessment."
      );
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
      setLoading(true);

      // Check for existing attempt in localStorage
      const existingData = localStorage.getItem(
        `ongoing_assessment_${assessment.id}`
      );
      let existingSubmissionId = null;

      if (existingData) {
        const parsed = JSON.parse(existingData);
        existingSubmissionId = parsed.submissionId;
      }

      // Navigate with appropriate state
      navigate(`/Learner/Assessment/Attempt/${assessment.id}`, {
        state: {
          assessment,
          isNewAttempt: true,
          submissionId: existingSubmissionId, // Pass existing submission ID if available
        },
      });
    } catch (error) {
      console.error("Error starting assessment:", error);
      setError("Failed to start assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowAnswers = async () => {
    try {
      setLoading(true);
      const submissionResponse = await getUserSubmission(assessment.id, true);

      console.log("Latest submission fetch:", {
        success: submissionResponse.success,
        hasSubmission: !!submissionResponse.submission,
        submissionStatus: submissionResponse.submission?.status,
      });

      if (submissionResponse.success && submissionResponse.submission) {
        setLatestSubmission(submissionResponse.submission);
      }
      setShowAnswers(!showAnswers);
    } catch (err) {
      console.error("Error fetching latest submission:", err);
      setError("Failed to load submission details");
    } finally {
      setLoading(false);
    }
  };

  // Update the formatPassingScore function to show score/max format
  const formatPassingScore = (passingScore, maxScore) => {
    if (!passingScore || !maxScore) return "0/0";
    return `${passingScore}/${maxScore}`;
  };

  const renderHeader = () => (
    <div className="relative bg-gradient-to-r from-gray-800 to-gray-700 p-4 md:p-8 text-white overflow-hidden rounded-t-xl">
      {/* Decorative elements - adjusted positioning */}
      <div className="absolute top-0 right-0 w-48 h-48 transform translate-x-16 -translate-y-16 rotate-45 bg-yellow-500 opacity-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-36 h-36 transform -translate-x-16 translate-y-16 rotate-45 bg-yellow-500 opacity-10 rounded-full" />

      <button
        onClick={() => navigate("/Learner/Assessment")}
        className="flex items-center gap-2 text-gray-300 hover:text-[#F6BA18] transition-colors mb-4 group"
      >
        <ArrowLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="text-sm md:text-base">Back to Assessments</span>
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <h1 className="text-xl md:text-3xl font-bold">
              {assessmentData?.title || assessment?.title}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${getStatusColor(
                getStatus(initialSubmission)
              )}`}
            >
              {getStatus(initialSubmission)}
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-4 text-gray-300 text-sm">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#F6BA18]" />
              <span>Due: {assessmentData?.formattedDueDate}</span>
            </div>
            {initialSubmission && (
              <>
                <div className="hidden md:block text-gray-500">•</div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#F6BA18]" />
                  <span>
                    Attempt {submissionCount} of{" "}
                    {assessment?.allowed_attempts || 1}
                  </span>
                </div>
              </>
            )}
          </div>
          <p className="text-sm text-gray-300">{assessment?.description}</p>
        </div>

        <div className="flex flex-col gap-3 md:text-right">
          <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-lg">
            <span className="text-[#F6BA18] font-medium">Passing Score:</span>
            <span className="text-white">
              {formatPassingScore(
                assessmentData?.passing_score || 0,
                assessmentData?.max_score || 0
              )}
            </span>
          </div>
          <div className="text-sm text-gray-300 space-y-1">
            <p>Duration: {assessment?.duration_minutes} minutes</p>
            <p>
              Remaining Attempts:{" "}
              {Math.max(
                0,
                (assessment?.allowed_attempts || 1) - submissionCount
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubmissionStatus = () => {
    // Check localStorage first for ongoing attempt
    const storedData = localStorage.getItem(
      `ongoing_assessment_${assessment.id}`
    );
    const storedSubmissionId = storedData
      ? JSON.parse(storedData).submissionId
      : null;

    console.log("Submission Status Check:", {
      storedSubmissionId,
      hasStoredData: !!storedData,
      initialSubmission: !!initialSubmission,
    });

    if (storedSubmissionId) {
      // Override the completed submission view if there's a stored submission
      return (
        <div className="text-center py-8">
          <div className="text-yellow-500 mb-4">
            <Clock size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-4">
            Ongoing Assessment Attempt
          </h3>
          <p className="text-gray-500 mb-6">
            You have an unfinished attempt in progress.
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

    if (error || routeError === "Maximum attempts reached") {
      return (
        <div className="text-center py-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="text-xl font-medium text-gray-900 mt-4 mb-2">
            {location.state?.errorDetails ||
              error ||
              "Maximum number of attempts has been reached"}
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

    // Show not started state if no submission and no stored attempt
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

    // Show completed submission view only if no stored attempt
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Check className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-2 text-lg font-medium">Latest Attempt</h3>
          <p className="text-sm text-gray-500">
            Submitted on:{" "}
            {new Date(initialSubmission.submit_time).toLocaleString()}
          </p>

          {initialSubmission.total_score !== undefined && (
            <div className="mt-4 text-2xl font-bold">
              Score: {calculateTotalPoints(initialSubmission.answers).earned}/
              {calculateTotalPoints(initialSubmission.answers).total}
            </div>
          )}

          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={handleShowAnswers}
              className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529]"
            >
              {showAnswers ? "Hide My Answers" : "Show My Answers"}
            </button>
            <button
              onClick={handleStartNewAttempt}
              className="px-4 py-2 border-2 border-[#212529] text-[#212529] rounded-md hover:bg-[#F6BA18] hover:border-[#F6BA18]"
            >
              Start New Attempt
            </button>
          </div>
        </div>

        {/* Show answers section - use latestSubmission instead of initialSubmission */}
        {showAnswers && latestSubmission?.answers && (
          <div className="mt-6 space-y-6">
            <h4 className="text-lg font-medium text-gray-900">Your Answers</h4>
            {questions.map((question, index) => {
              const answer = latestSubmission.answers.find(
                (a) => a.question_id === question.id
              );
              return renderQuestionWithAnswer(question, index, answer);
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-3 md:p-6 overflow-auto">
        <Header
          title={selectedCourse?.name || "Assessment"}
          subtitle={selectedCourse?.code}
        />
        <div className="max-w-7xl mx-auto">
          <div className="mt-4 md:mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
            {renderHeader()}

            <div className="p-4 md:p-6 border-b border-gray-200">
              {/* ...existing instructions code... */}
            </div>

            <div className="p-4 md:p-6">
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
