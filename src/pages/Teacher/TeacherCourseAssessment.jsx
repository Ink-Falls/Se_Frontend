import React, { useState, useEffect } from "react";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
  User,
  LineChart,
  Plus,
  Clock,
  Calendar,
  Award,
  AlertTriangle,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import { useCourse } from "../../contexts/CourseContext";
import { useNavigate } from "react-router-dom";
import CreateAssessmentModal from "../../components/common/Modals/Create/CreateAssessmentModal";
import EditAssessmentModal from "../../components/common/Modals/Edit/EditAssessmentModal";
import DeleteModal from "../../components/common/Modals/Delete/DeleteModal"; // Update this import
import {
  getCourseAssessments,
  deleteAssessment,
} from "../../services/assessmentService";

const TeacherCourseAssessment = () => {
  const { selectedCourse } = useCourse();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navItems = [
    {
      text: "Home",
      icon: <Home size={20} />,
      route: "/Teacher/Dashboard",
    },
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
      route: "/Teacher/Progress",
    },
  ];

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await getCourseAssessments(selectedCourse.id, true);
      if (response.success) {
        setAssessments(response.assessments || []);
      } else {
        throw new Error(response.message || "Failed to fetch assessments");
      }
    } catch (err) {
      setError("Failed to fetch assessments");
      console.error("Error fetching assessments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCourse?.id) {
      navigate("/Teacher/Dashboard");
      return;
    }

    fetchAssessments();
  }, [selectedCourse, navigate]);

  // Add this effect to auto-clear success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleAssessmentCreated = async (newAssessment) => {
    try {
      // Add the new assessment to the list immediately
      setAssessments((prev) => [newAssessment, ...prev]);
      setIsCreateModalOpen(false);
      setSuccessMessage("Assessment created successfully"); // Add success message

      // Optionally refresh the full list
      await fetchAssessments();
    } catch (err) {
      console.error("Error handling new assessment:", err);
      setError("Failed to create assessment"); // Add error handling
    }
  };

  const handleAssessmentClick = (assessment) => {
    navigate(`/Teacher/Assessment/View/${assessment.id}`, {
      state: {
        assessment,
        // Add any additional data needed for submissions view
        courseId: selectedCourse?.id,
      },
    });
  };

  const handleSubmissionClick = (submission, assessment) => {
    navigate(`/Teacher/Assessment/Submission/${submission.id}`, {
      state: {
        assessment,
        submission: {
          ...submission,
          // Transform the submission data for the view
          id: submission.id,
          studentName: submission.studentName,
          studentId: submission.studentId,
          status: submission.status,
          submissionDate: submission.submit_time,
          score: submission.score,
          maxScore: assessment.max_score,
        },
      },
    });
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

  const requiresManualGrading = (assessment) => {
    return assessment.questions?.some(
      (question) =>
        question.question_type === "short_answer" ||
        question.question_type === "essay"
    );
  };

  const getSubmissionStatus = (submission, assessment) => {
    if (!submission) return "Not Submitted";
    if (submission.is_late) return "Late";

    const hasManualQuestions = assessment.questions?.some(
      (q) => q.question_type === "short_answer" || q.question_type === "essay"
    );

    // Force 'submitted' status if there are manual grading questions
    if (hasManualQuestions) {
      return "Submitted";
    }

    return submission.status;
  };

  const getStatusColor = (submission, assessment) => {
    const status = getSubmissionStatus(submission, assessment);

    switch (status) {
      case "Not Submitted":
        return "bg-gray-100 text-gray-600";
      case "Late":
        return "bg-red-100 text-red-800";
      case "Submitted":
        return "bg-yellow-100 text-yellow-800";
      case "Graded":
        return "bg-green-100 text-green-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const renderSubmissionStatus = (submission, assessment) => (
    <span
      className={`text-sm px-2 py-1 rounded ${getStatusColor(
        submission,
        assessment
      )}`}
    >
      {getSubmissionStatus(submission, assessment)}
    </span>
  );

  const handleEdit = (e, assessment) => {
    e.stopPropagation();
    setEditingAssessment(assessment);
    setShowMenu(null);
  };

  const handleDelete = (e, assessment) => {
    e.stopPropagation();
    setAssessmentToDelete(assessment);
    setShowMenu(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteAssessment(assessmentToDelete.id);

      if (response.success) {
        // Remove assessment from local state
        setAssessments((prev) =>
          prev.filter((a) => a.id !== assessmentToDelete.id)
        );
        setSuccessMessage("Assessment deleted successfully");
      } else {
        throw new Error(response.message || "Failed to delete assessment");
      }
    } catch (error) {
      console.error("Error deleting assessment:", error);
      setError(error.message || "Failed to delete assessment");
    } finally {
      setAssessmentToDelete(null); // Clear assessment to delete
    }
  };

  const handleEditSubmit = async (updatedAssessment) => {
    try {
      // Update local state
      setAssessments((prev) =>
        prev.map((a) => (a.id === updatedAssessment.id ? updatedAssessment : a))
      );
      setEditingAssessment(null);
      setSuccessMessage("Assessment updated successfully"); // Add success message
    } catch (err) {
      console.error("Error updating assessment:", err);
      setError("Failed to update assessment"); // Add error handling
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-auto">
        <Header
          title={selectedCourse?.name || "Course Assessment"}
          subtitle={selectedCourse?.code}
        />

        {/* Add success message display */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Keep existing error display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

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

        {!loading && !error && assessments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-gray-400 mb-4">
              <ClipboardList size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No Assessments Available
            </h3>
            <p className="text-gray-500 mt-2 mb-6">
              There are no assessments for this course yet.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create Assessment
            </button>
          </div>
        )}

        {!loading && !error && assessments.length > 0 && (
          <>
            <div className="flex flex-col gap-4 mt-4">
              {assessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="relative bg-white rounded-lg p-5 border-l-4 border-yellow-500 transition-all shadow-sm hover:shadow-lg cursor-pointer"
                  onClick={() => handleAssessmentClick(assessment)}
                >
                  <div
                    className="absolute top-4 right-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        setShowMenu(
                          showMenu === assessment.id ? null : assessment.id
                        )
                      }
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <MoreVertical size={20} className="text-gray-500" />
                    </button>
                    {showMenu === assessment.id && (
                      <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20 border">
                        <button
                          onClick={(e) => handleEdit(e, assessment)}
                          className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Edit2 size={16} />
                          Edit Assessment
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, assessment)}
                          className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete Assessment
                        </button>
                      </div>
                    )}
                  </div>

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
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          In Progress
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {assessment.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {assessment.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          {assessment.duration_minutes || 0} minutes
                        </div>
                        <div className="flex items-center gap-1">
                          <Award size={16} />
                          Score: {assessment.passing_score || 0}/
                          {assessment.max_score || 100}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          Due:{" "}
                          {assessment.due_date
                            ? formatDate(assessment.due_date)
                            : "Not set"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Action Button - Only shown when there are existing assessments */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="fixed bottom-8 right-8 w-14 h-14 bg-[#F6BA18] text-[#212529] rounded-full shadow-lg hover:bg-[#212529] hover:text-[#F6BA18] transition-colors z-50 flex items-center justify-center"
            >
              <Plus size={24} />
            </button>
          </>
        )}

        <CreateAssessmentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          courseId={selectedCourse?.id}
          onSuccess={handleAssessmentCreated}
        />
        {editingAssessment && (
          <EditAssessmentModal
            isOpen={!!editingAssessment}
            assessment={editingAssessment}
            onClose={() => setEditingAssessment(null)}
            onSubmit={handleEditSubmit}
          />
        )}
        {assessmentToDelete && (
          <DeleteModal
            title="Delete Assessment"
            message={`Are you sure you want to delete "${assessmentToDelete?.title}"? This will also delete all questions and submissions associated with this assessment. This action cannot be undone.`}
            onClose={() => setAssessmentToDelete(null)}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherCourseAssessment;
