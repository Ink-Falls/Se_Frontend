import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import LoadingSpinner from "../../components/common/LoadingSpinner"; // Add this import
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import {
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
  User,
  LineChart,
  ArrowLeft,
  FileText,
  Edit2,
  Clock,
  Plus, // Add this import
  Trash2,
  MoreVertical, // Add this import
} from "lucide-react";
import {
  getAssessmentById, // for getting all the questions
  createAssessmentQuestion, // done
  getAssessmentSubmissions,
  getSubmissionDetails,
  deleteQuestion,
  deleteAssessment,
} from "../../services/assessmentService";
import CreateQuestionModal from "../../components/common/Modals/Create/CreateQuestionModal";
import EditQuestionModal from "../../components/common/Modals/Edit/EditQuestionModal";
import DeleteModal from "../../components/common/Modals/Delete/DeleteModal";

// Add this new component after the imports
const SortButton = ({ field, currentSort, onSort, children }) => (
  <button
    onClick={() => onSort(field)}
    className="flex items-center gap-1 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
  >
    {children}
    {currentSort.field === field && (
      <span className="text-xs">
        {currentSort.direction === "asc" ? "↑" : "↓"}
      </span>
    )}
  </button>
);

const TeacherAssessmentView = () => {
  const [questions, setQuestions] = useState([]);
  const [isCreateQuestionOpen, setIsCreateQuestionOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [submissionDetailsMap, setSubmissionDetailsMap] = useState({});
  const [isDeletingAssessment, setIsDeletingAssessment] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null); // Add this line
  const [sortField, setSortField] = useState("submissionDate"); // Changed from 'studentName'
  const [sortDirection, setSortDirection] = useState("desc"); // Changed from 'asc'
  const [sortConfig, setSortConfig] = useState({
    field: "submissionDate", // Changed from 'studentName'
    direction: "desc", // Changed from 'asc'
  });
  const [showMenu, setShowMenu] = useState(null); // Add this line

  const location = useLocation();
  const navigate = useNavigate();
  const { assessment } = location.state || {};
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(null);

  const navItems = [
    { text: "Home", icon: <Home size={20} />, route: "/Teacher/Dashboard" },
    {
      text: "Announcements",
      icon: <Megaphone size={20} />,
      route: "/Teacher/CourseAnnouncements",
    },
    {
      text: "Modules",
      icon: <BookOpen size={20} />,
      route: "/Teacher/CourseModules",
    },
    {
      text: "Assessments",
      icon: <ClipboardList size={20} />,
      route: "/Teacher/Assessment",
    },
    {
      text: "Attendance",
      icon: <User size={20} />,
      route: "/Teacher/Attendance",
    },
    {
      text: "Progress Tracker",
      icon: <LineChart size={20} />,
      route: "/TeacherProgress",
    },
  ];

  const getStatusColor = (status, score) => {
    switch (status?.toLowerCase()) {
      case "not graded":
        return "bg-orange-100 text-orange-800";
      case "graded":
        return "bg-green-100 text-green-800";
      case "late":
        return "bg-red-100 text-red-800";
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Add this helper function to check if all questions are graded
  const areAllQuestionsGraded = (submission) => {
    if (!submission?.answers) return false;

    return submission.answers.every((answer) => {
      const hasPoints =
        answer.points_awarded !== null && answer.points_awarded !== undefined;
      const isAutoGraded =
        submission.assessment?.questions?.find(
          (q) => q.id === answer.question_id
        )?.question_type === "multiple_choice" ||
        submission.assessment?.questions?.find(
          (q) => q.id === answer.question_id
        )?.question_type === "true_false";

      // Consider the question graded if it has points or is auto-graded with selected answer
      return hasPoints || (isAutoGraded && answer.is_auto_graded);
    });
  };

  const calculateSubmissionScore = (submission) => {
    if (!submission?.answers) return { total: 0, possible: 0 };

    const totalAwarded = submission.answers.reduce(
      (sum, answer) => sum + (parseInt(answer.points_awarded) || 0),
      0
    );

    const totalPossible = submission.assessment.questions.reduce(
      (sum, question) => sum + (parseInt(question.points) || 0),
      0
    );

    return { total: totalAwarded, possible: totalPossible };
  };

  const handleSubmissionClick = (submission) => {
    navigate(`/Teacher/Assessment/Submission/${submission.id}`, {
      state: {
        assessment,
        submission,
      },
    });
  };

  useEffect(() => {
    const fetchAssessmentDetails = async () => {
      try {
        setLoading(true);
        const response = await getAssessmentById(assessment.id, true, true);

        if (response.success && response.assessment) {
          const assessmentData = response.assessment;
          setAssessmentData(assessmentData);
          setQuestions(assessmentData.questions || []);

          // Format due date
          if (assessmentData.due_date) {
            const dueDate = new Date(assessmentData.due_date);
            const formattedDueDate = dueDate.toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            setAssessmentData((prev) => ({
              ...prev,
              formattedDueDate,
            }));
          }
        } else {
          throw new Error(response.message || "Failed to fetch assessment");
        }
      } catch (err) {
        console.error("Error fetching assessment:", err);
        setError(err.message || "Failed to load assessment details");
        setQuestions([]); // Initialize with empty array on error
      } finally {
        setLoading(false);
      }
    };

    if (assessment?.id) {
      fetchAssessmentDetails();
    }
  }, [assessment?.id]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setSubmissionsLoading(true);
        const response = await getAssessmentSubmissions(
          assessment.id,
          currentPage
        );

        if (response.success) {
          setSubmissions(response.submissions || []);
          // Add null check for pagination and provide default value
          setTotalPages(response.pagination?.pages || 1);
        } else {
          throw new Error(response.message || "Failed to fetch submissions");
        }
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError(err.message);
        // Set default values on error
        setSubmissions([]);
        setTotalPages(1);
      } finally {
        setSubmissionsLoading(false);
      }
    };

    if (assessment?.id) {
      fetchSubmissions();
    }
  }, [assessment?.id, currentPage]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!assessment?.id) return;

      try {
        setIsLoadingSubmissions(true);
        const submissionsResponse = await getAssessmentSubmissions(
          assessment.id
        );

        if (submissionsResponse.success) {
          const detailedSubmissions = await Promise.all(
            submissionsResponse.submissions.map(async (sub) => {
              const detailsResponse = await getSubmissionDetails(sub.id);

              if (detailsResponse.success) {
                const scores = calculateSubmissionScore(
                  detailsResponse.submission
                );
                const allGraded = areAllQuestionsGraded(
                  detailsResponse.submission
                );

                return {
                  id: sub.id,
                  studentName: `${
                    detailsResponse.submission.user?.first_name || ""
                  } ${detailsResponse.submission.user?.last_name || ""}`.trim(),
                  studentId: detailsResponse.submission.user?.id || "N/A",
                  status: allGraded ? "graded" : "Not Graded",
                  score: scores.total,
                  maxScore: scores.possible,
                  submit_time: detailsResponse.submit_time,
                  isLate: detailsResponse.submission.is_late,
                  answers: detailsResponse.submission.answers,
                  assessment: detailsResponse.submission.assessment,
                };
              }
              return null;
            })
          );
          setSubmissions(detailedSubmissions.filter(Boolean));
        } else {
          throw new Error(
            submissionsResponse.message || "Failed to fetch submissions"
          );
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
        setError("Failed to fetch submissions");
        setSubmissions([]);
      } finally {
        setIsLoadingSubmissions(false);
      }
    };

    fetchSubmissions();
  }, [assessment?.id]);

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      if (!submissions.length) return;

      try {
        const detailsMap = {};
        await Promise.all(
          submissions.map(async (submission) => {
            const response = await getSubmissionDetails(submission.id);
            if (response.success) {
              detailsMap[submission.id] = response.submission;
            }
          })
        );
        setSubmissionDetailsMap(detailsMap);
      } catch (error) {
        console.error("Error fetching submission details:", error);
      }
    };

    fetchSubmissionDetails();
  }, [submissions]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleCreateQuestion = async (questionData) => {
    try {
      console.log("Creating question with data:", questionData);
      const response = await createAssessmentQuestion(
        assessment.id,
        questionData
      );

      if (response.success) {
        const updatedAssessment = await getAssessmentById(
          assessment.id,
          true,
          true
        );
        if (updatedAssessment.success) {
          setQuestions(updatedAssessment.assessment.questions || []);
          setIsCreateQuestionOpen(false);
          setSuccessMessage("Question added successfully");
        }
      } else {
        throw new Error(response.message || "Failed to create question");
      }
    } catch (err) {
      console.error("Error creating question:", err);
      // Pass the error message to the modal through onSubmit rejection
      throw new Error(err.message || "Failed to create question");
    }
  };

  const renderAnswer = (question) => {
    // Check if there is a selected submission
    if (!submissionData || !submissionData.answers) {
      return "No submission data available";
    }

    const answer = submissionData.answers.find(
      (a) => a.question_id === question.id
    );
    if (!answer) return "Not answered";

    switch (question.question_type) {
      case "multiple_choice":
        const selectedOption = question.options?.find(
          (opt) => opt.id === answer.selected_option_id
        );
        return selectedOption ? selectedOption.option_text : "Invalid option";

      case "true_false":
        return answer.selected_option_id ? "True" : "False";

      case "short_answer":
      case "essay":
        return answer.text_response || "No response";

      default:
        return "Unknown question type";
    }
  };

  // Add this effect to fetch submission data when needed
  useEffect(() => {
    const fetchSubmissionData = async (submissionId) => {
      try {
        const response = await getSubmissionDetails(submissionId);
        if (response.success) {
          setSubmissionData(response.submission);
        }
      } catch (error) {
        console.error("Error fetching submission details:", error);
      }
    };

    // Call fetchSubmissionData when viewing a specific submission
    if (location.state?.submission?.id) {
      fetchSubmissionData(location.state.submission.id);
    }
  }, [location.state?.submission?.id]);

  const handleQuestionDelete = async () => {
    try {
      const response = await deleteQuestion(assessment.id, deletingQuestion.id);
      if (response.success) {
        setQuestions((prev) =>
          prev.filter((q) => q.id !== deletingQuestion.id)
        );
        setDeletingQuestion(null);
        setSuccessMessage("Question deleted successfully"); // Updated this line
      } else {
        throw new Error(response.message || "Failed to delete question");
      }
    } catch (err) {
      setError(err.message || "Failed to delete question");
    }
  };

  const handleDeleteAssessment = async () => {
    try {
      setLoading(true);
      const response = await deleteAssessment(assessment.id);

      if (response.success) {
        alert(response.message || "Assessment deleted successfully");
        navigate("/Teacher/Assessment");
      } else {
        throw new Error("Failed to delete assessment");
      }
    } catch (err) {
      console.error("Error deleting assessment:", err);
      alert("Failed to delete assessment: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
      setIsDeletingAssessment(false);
    }
  };

  const renderQuestionItem = (question, index) => (
    <div
      key={question.id}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
    >
      <div className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                Question {index + 1}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {question.points} Points
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  question.question_type === "multiple_choice"
                    ? "bg-purple-100 text-purple-800"
                    : question.question_type === "true_false"
                    ? "bg-indigo-100 text-indigo-800"
                    : question.question_type === "short_answer"
                    ? "bg-green-100 text-green-800"
                    : "bg-pink-100 text-pink-800"
                }`}
              >
                {question.question_type
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </span>
            </div>
            <p className="text-gray-800 font-medium text-lg">
              {question.question_text}
            </p>
            {question.media_url && (
              <div className="mt-4">
                {question.media_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img
                    src={question.media_url}
                    alt="Question media"
                    className="max-w-sm rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-200">
                    Media URL: {question.media_url}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(showMenu === question.id ? null : question.id);
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical size={16} className="text-gray-600" />
            </button>
            {showMenu === question.id && (
              <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg z-10 min-w-[120px] overflow-hidden border">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingQuestion({
                      ...question,
                      options: question.options?.map((opt) => ({
                        ...opt,
                        text: opt.option_text || opt.text || "", // Add this mapping
                        is_correct: Boolean(opt.is_correct),
                      })),
                    });
                    setShowMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit2 size={14} className="text-gray-500" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingQuestion(question);
                    setShowMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 border-t"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        {question.question_type === "multiple_choice" && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
            {question.options?.map((option) => (
              <div
                key={option.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  option.is_correct
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {option.is_correct && (
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                )}
                <span>{option.option_text}</span>
              </div>
            ))}
          </div>
        )}

        {question.question_type === "true_false" && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
            {question.options?.map((option) => (
              <div
                key={option.id}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  option.is_correct
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-white border border-gray-200"
                }`}
              >
                {option.is_correct && (
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                )}
                <span>{option.text}</span>
              </div>
            ))}
          </div>
        )}

        {(question.question_type === "short_answer" ||
          question.question_type === "essay") && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Answer Key / Guidelines:
            </p>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {question.answer_key || "No answer key provided"}
            </div>
            {question.question_type === "essay" && question.word_limit && (
              <p className="text-sm text-gray-500 mt-2">
                Word limit: {question.word_limit} words
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderPagination = () => {
    if (!totalPages || totalPages <= 1) return null;

    return (
      <div className="mt-4 flex justify-center gap-2">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1
                ? "bg-[#212529] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedSubmissions = () => {
    if (!submissions) return [];

    return [...submissions].sort((a, b) => {
      let compareA, compareB;

      switch (sortField) {
        case "studentName":
          // Add fallback empty string if studentName is undefined
          compareA = (a?.studentName || "").toLowerCase();
          compareB = (b?.studentName || "").toLowerCase();
          break;
        case "submissionDate":
          // Get timestamps, using 0 for missing dates to handle them consistently
          compareA = new Date(
            submissionDetailsMap[a?.id]?.submit_time || 0
          ).getTime();
          compareB = new Date(
            submissionDetailsMap[b?.id]?.submit_time || 0
          ).getTime();
          break;
        default:
          return 0;
      }

      if (compareA < compareB) return sortDirection === "asc" ? -1 : 1;
      if (compareA > compareB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const renderSubmissionsSection = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Student Submissions
        </h3>
        <div className="flex gap-4">
          <button
            onClick={() => handleSort("studentName")}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
          >
            Sort by Name
            {sortField === "studentName" && (
              <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
            )}
          </button>
          <button
            onClick={() => handleSort("submissionDate")}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
          >
            Sort by Date
            {sortField === "submissionDate" && (
              <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
            )}
          </button>
        </div>
      </div>

      {submissionsLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Submission Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getSortedSubmissions().map((submission) => {
                  const submissionStatus = submission.is_late
                    ? "Late"
                    : !areAllQuestionsGraded(submission)
                    ? "Not Graded"
                    : submission.status;

                  // Calculate percentage for score coloring
                  const scorePercentage =
                    submission.score !== null
                      ? (submission.score / submission.maxScore) * 100
                      : null;

                  // Determine score text color based on status and percentage
                  const scoreColorClass =
                    submissionStatus === "Not Graded"
                      ? "text-gray-400" // Grey for not graded
                      : scorePercentage >= (assessmentData?.passing_score || 0)
                      ? "text-green-600" // Green if meets/exceeds passing score
                      : "text-red-600"; // Red if below passing score

                  return (
                    <tr
                      key={submission.id}
                      onClick={() => handleSubmissionClick(submission)}
                      className="hover:bg-gray-50 cursor-pointer transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.studentName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {submission.studentId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            submissionStatus
                          )}`}
                        >
                          {submissionStatus === "graded"
                            ? "GRADED"
                            : submissionStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {submissionDetailsMap[submission.id]?.submit_time
                            ? formatDate(
                                submissionDetailsMap[submission.id].submit_time
                              )
                            : "Not submitted"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {submission.score !== null ? (
                            <span className={scoreColorClass}>
                              {submission.score}/{submission.maxScore}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not graded</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );

  // Add this helper function to format passing score
  const formatPassingScore = (passingScore) => {
    if (!passingScore) return "0%";
    return `${passingScore}%`;
  };

  const renderHeader = () => (
    <div className="relative bg-gradient-to-r from-gray-800 to-gray-700 p-8 text-white">
      <div className="flex justify-between items-start mb-4">
        <button
          onClick={() => navigate("/Teacher/Assessment")}
          className="flex items-center gap-2 text-gray-100 hover:text-[#F6BA18] transition-colors group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back to Assessments</span>
        </button>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{assessmentData?.title}</h1>
          <p className="text-gray-200 flex items-center gap-2">
            <Clock size={16} />
            Due: {assessmentData?.formattedDueDate}
          </p>
        </div>
        <div className="text-right">
          <p className="mt-3 text-lg font-semibold">
            Passing Score: {formatPassingScore(assessmentData?.passing_score)}
          </p>
          <p className="text-sm text-gray-300">
            Duration: {assessmentData?.duration_minutes} minutes
          </p>
        </div>
      </div>
    </div>
  );

  const handleDeleteSuccess = (message) => {
    alert(message || "Assessment deleted successfully");
    navigate("/Teacher/Assessment");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <Header title="Assessment" />
          <MobileNavBar navItems={navItems} />

          <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header Section */}
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

            {/* Submissions Section */}
            {renderSubmissionsSection()}

            {/* Questions Section */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Questions</h3>
                <button
                  onClick={() => setIsCreateQuestionOpen(true)}
                  className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Question
                </button>
              </div>

              {/* Add success message display */}
              {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  {successMessage}
                </div>
              )}

              {loading ? (
                <LoadingSpinner />
              ) : error ? (
                <div className="text-center text-red-600 py-4">{error}</div>
              ) : questions.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList
                    size={48}
                    className="mx-auto text-gray-400 mb-4"
                  />
                  <h4 className="text-lg font-medium text-gray-900">
                    No Questions Added Yet
                  </h4>
                  <p className="text-gray-500 mt-2">
                    Start adding questions to your assessment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) =>
                    renderQuestionItem(question, index)
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Question Modal */}
      <CreateQuestionModal
        isOpen={isCreateQuestionOpen}
        onClose={() => setIsCreateQuestionOpen(false)}
        onSubmit={handleCreateQuestion}
        maxScore={assessmentData?.max_score}
        questions={questions}
      />

      {editingQuestion && (
        <EditQuestionModal
          isOpen={!!editingQuestion}
          onClose={() => setEditingQuestion(null)}
          question={editingQuestion}
          assessmentId={assessment.id}
          onSuccess={(updatedQuestion) => {
            setQuestions((prev) =>
              prev.map((q) =>
                q.id === updatedQuestion.id ? updatedQuestion : q
              )
            );
            setEditingQuestion(null);
            setSuccessMessage("Question updated successfully"); // Add this line
          }}
        />
      )}

      {deletingQuestion && (
        <DeleteModal
          onClose={() => setDeletingQuestion(null)}
          onConfirm={handleQuestionDelete} // Fixed: Remove the arrow function
          message={`Are you sure you want to delete this question? This action cannot be undone.`}
        />
      )}

      {isDeletingAssessment && (
        <DeleteModal
          onClose={() => setIsDeletingAssessment(false)}
          onConfirm={handleDeleteAssessment}
          message={`Are you sure you want to delete "${assessment?.title}"? This will also delete all questions and submissions. This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default TeacherAssessmentView;
