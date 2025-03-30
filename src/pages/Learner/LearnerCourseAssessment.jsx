import React, { useState, useEffect } from "react";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import {
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
  Clock,
  Calendar,
  Award,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCourse } from "../../contexts/CourseContext";
import {
  getCourseAssessments,
  getUserSubmission,
} from "../../services/assessmentService";

const LearnerCourseAssessment = () => {
  const { selectedCourse } = useCourse();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      route: "/Learner/Assessment",
    },
  ];

  useEffect(() => {
    if (!selectedCourse?.id) {
      navigate("/Learner/Dashboard");
      return;
    }

    const fetchAssessmentsAndSubmissions = async () => {
      try {
        setLoading(true);
        const assessmentsData = await getCourseAssessments(
          selectedCourse.id,
          true
        );

        // Filter to only include published assessments
        const courseAssessments = (assessmentsData.assessments || []).filter(
          (assessment) => assessment.is_published
        );

        // Fetch user's submission for each assessment with full details
        const submissionsMap = {};
        await Promise.all(
          courseAssessments.map(async (assessment) => {
            try {
              const submissionData = await getUserSubmission(
                assessment.id,
                true
              ); // Add true to include answers
              if (submissionData.success && submissionData.submission) {
                submissionsMap[assessment.id] = {
                  ...submissionData.submission,
                  total_score: submissionData.submission.total_score,
                  assessment: assessment, // Include assessment details with questions
                };
              }
            } catch (err) {
              console.error(
                `Error fetching submission for assessment ${assessment.id}:`,
                err
              );
            }
          })
        );

        setAssessments(courseAssessments);
        setSubmissions(submissionsMap);
      } catch (err) {
        setError(err.message || "Failed to fetch assessments");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentsAndSubmissions();
  }, [selectedCourse, navigate]);

  const getStatus = (submission) => {
    // First check if submission exists and has submit_time
    if (!submission || !submission.submit_time) return "Not Started";
    if (submission.is_late) return "Late";

    // Check if submission has answers
    if (!submission.answers || submission.answers.length === 0)
      return "Not Started";

    // Count questions with points_awarded and total questions
    const totalQuestions = submission.answers.length;
    const gradedQuestions = submission.answers.filter(
      (answer) =>
        answer.points_awarded !== null && answer.points_awarded !== undefined
    ).length;

    if (gradedQuestions === 0) return "Submitted";
    if (gradedQuestions < totalQuestions) return "Partially Graded";
    if (gradedQuestions === totalQuestions) return "Graded";

    return "Submitted";
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "graded":
        return "bg-green-100 text-green-800";
      case "partially graded":
        return "bg-orange-100 text-orange-800";
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

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAssessmentClick = (assessment) => {
    navigate(`/Learner/Assessment/View/${assessment.id}`, {
      state: { assessment },
    });
  };

  const calculateTotalPoints = (submission) => {
    if (!submission?.assessment?.questions) return 0;
    return submission.assessment.questions.reduce(
      (sum, question) => sum + (parseInt(question.points) || 0),
      0
    );
  };

  const renderSubmissionScore = (submission, assessment) => {
    if (!submission || !submission.status || submission.status === "null") {
      return <div className="text-sm text-gray-600">Not Started</div>;
    }

    // Calculate total score considering both auto-graded and manual grades
    const totalPoints = calculateTotalPoints(submission);
    const score =
      submission.answers?.reduce((sum, answer) => {
        // For manual graded questions (short_answer and essay)
        return sum + (parseInt(answer.points_awarded) || 0);
      }, 0) || 0;

    // Show score if available
    return (
      <div className="text-2xl font-bold text-gray-900">
        {score}/{totalPoints}
        {submission.status === "graded" && (
          <div className="text-sm text-gray-500 mt-1">Final Grade</div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-auto">
        <Header
          title={selectedCourse?.name || "Course"}
          subtitle={selectedCourse?.code}
        />
        <MobileNavBar navItems={navItems} />

        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <AlertTriangle size={48} className="text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Assessments
            </h3>
            <p className="text-gray-500 text-center max-w-md mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col gap-4 mt-4">
            {assessments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <div className="text-gray-400 mb-4">
                  <ClipboardList size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No Assessments Available
                </h3>
                <p className="text-gray-500 mt-2">
                  There are no assessments for this course yet.
                </p>
              </div>
            ) : (
              assessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="relative bg-white rounded-lg p-5 border-l-4 border-yellow-500 transition-all shadow-sm hover:shadow-lg cursor-pointer"
                  onClick={() => handleAssessmentClick(assessment)}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            assessment.type === "quiz"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {assessment.type?.toUpperCase() || "QUIZ"}
                        </span>
                        {submissions[assessment.id] && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              getStatus(submissions[assessment.id]),
                              submissions[assessment.id].is_late
                            )}`}
                          >
                            {getStatus(submissions[assessment.id])}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {assessment.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {assessment.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          {assessment.duration_minutes} minutes
                        </div>
                        <div className="flex items-center gap-1">
                          <Award size={16} />
                          Passing: {assessment.passing_score}%
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          Due: {formatDate(assessment.due_date)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {renderSubmissionScore(
                        submissions[assessment.id],
                        assessment
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnerCourseAssessment;
