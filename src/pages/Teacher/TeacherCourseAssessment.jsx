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
  ChevronDown,
} from "lucide-react";
import { useCourse } from "../../contexts/CourseContext";
import { useNavigate } from "react-router-dom";
import CreateAssessmentModal from "../../components/common/Modals/Create/CreateAssessmentModal";
import EditAssessmentModal from "../../components/common/Modals/Edit/EditAssessmentModal";
import DeleteModal from "../../components/common/Modals/Delete/DeleteModal"; // Update this import
import {
  getCourseAssessments,
  deleteAssessment,
  editAssessment,
} from "../../services/assessmentService";
import { getModulesByCourseId } from "../../services/moduleService";

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
  const [moduleAssessments, setModuleAssessments] = useState({});
  const [modules, setModules] = useState([]);
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [publishingId, setPublishingId] = useState(null);
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
      const modulesResponse = await getModulesByCourseId(selectedCourse.id);

      if (!modulesResponse) {
        throw new Error("Failed to fetch modules data");
      }

      setModules(modulesResponse);
      const assessmentsByModule = {};
      let allAssessments = [];

      for (const module of modulesResponse) {
        try {
          const response = await getCourseAssessments(module.module_id, true);

          if (response.success && response.assessments) {
            const moduleAssessments = response.assessments.filter(
              (assessment) => assessment.module_id === module.module_id
            );

            if (moduleAssessments.length > 0) {
              assessmentsByModule[module.module_id] = moduleAssessments.map(
                (assessment) => ({
                  ...assessment,
                  max_score: assessment.max_score || 100,
                })
              );
              allAssessments = [...allAssessments, ...moduleAssessments];
            } else {
              assessmentsByModule[module.module_id] = [];
            }
          } else {
            assessmentsByModule[module.module_id] = [];
          }
        } catch (err) {
          console.error(`Error processing module ${module.module_id}:`, err);
          assessmentsByModule[module.module_id] = [];
        }
      }

      setModuleAssessments(assessmentsByModule);
      setAssessments(allAssessments);
    } catch (err) {
      console.error("Error in fetchAssessments:", err);
      setError(err.message || "Failed to fetch assessments");
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
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
    if (submission.status) return submission.status;
    return "Submitted";
  };

  const getStatusColor = (type, isPublished) => {
    const color = typeColors[type?.toLowerCase()] || typeColors.quiz;
    return {
      backgroundColor: isPublished ? color.light : "rgb(243 244 246)",
      color: isPublished ? color.bg : "rgb(107 114 128)",
    };
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
      // Update moduleAssessments state
      setModuleAssessments((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((moduleId) => {
          updated[moduleId] = updated[moduleId].map((a) =>
            a.id === updatedAssessment.id ? updatedAssessment : a
          );
        });
        return updated;
      });

      // Update assessments array
      setAssessments((prev) =>
        prev.map((a) => (a.id === updatedAssessment.id ? updatedAssessment : a))
      );

      setEditingAssessment(null);
      setSuccessMessage("Assessment updated successfully");
    } catch (err) {
      console.error("Error updating assessment:", err);
      setError("Failed to update assessment");
    }
  };

  const handlePublishToggle = async (e, assessment) => {
    e.stopPropagation();
    try {
      setPublishingId(assessment.id);

      const updatedData = {
        ...assessment,
        is_published: !assessment.is_published,
      };

      const response = await editAssessment(assessment.id, updatedData);

      if (response.success) {
        // Update local state with the returned assessment
        const updatedAssessment = {
          ...assessment,
          is_published: !assessment.is_published,
        };

        // Update moduleAssessments
        setModuleAssessments((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((moduleId) => {
            updated[moduleId] = updated[moduleId].map((a) =>
              a.id === assessment.id ? updatedAssessment : a
            );
          });
          return updated;
        });

        // Update assessments array
        setAssessments((prev) =>
          prev.map((a) => (a.id === assessment.id ? updatedAssessment : a))
        );

        setSuccessMessage(
          `Assessment ${
            !assessment.is_published ? "published" : "unpublished"
          } successfully`
        );
      }
    } catch (error) {
      console.error("Error toggling publish state:", error);
      setError(
        `Failed to ${
          assessment.is_published ? "unpublish" : "publish"
        } assessment`
      );
    } finally {
      setPublishingId(null);
    }
  };

  const typeColors = {
    quiz: {
      bg: "#3B82F6", // Blue
      text: "white",
      hover: "#2563EB",
      badge: "bg-blue-100 text-blue-800",
      light: "rgba(59, 130, 246, 0.1)",
    },
    exam: {
      bg: "#EC4899", // Pink
      text: "white",
      hover: "#DB2777",
      badge: "bg-pink-100 text-pink-800",
      light: "rgba(236, 72, 153, 0.1)",
    },
    assignment: {
      bg: "#10B981", // Green
      text: "white",
      hover: "#059669",
      badge: "bg-green-100 text-green-800",
      light: "rgba(16, 185, 129, 0.1)",
    },
  };

  const getTypeColor = (type) => {
    return typeColors[type?.toLowerCase()] || typeColors.quiz;
  };

  const toggleMenu = (e, assessmentId) => {
    e.stopPropagation();
    setShowMenu((current) => (current === assessmentId ? null : assessmentId));
  };

  const renderAssessmentCard = (assessment) => {
    const color = getTypeColor(assessment.type);

    return (
      <div
        key={assessment.id}
        onClick={() => handleAssessmentClick(assessment)}
        className="w-full rounded-xl shadow-md bg-white hover:shadow-lg transition-all duration-200 overflow-hidden group relative"
      >
        <div
          style={{ backgroundColor: color.bg }}
          className="px-6 py-4 text-white relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16 rotate-45 bg-white opacity-10 rounded-full" />
          <div className="absolute bottom-0 left-0 w-24 h-24 transform -translate-x-12 translate-y-12 rotate-45 bg-white opacity-10 rounded-full" />

          <div className="flex justify-between items-start relative z-10">
            <div>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color.badge}`}
              >
                {assessment.type?.toUpperCase() || "QUIZ"}
              </span>
              <h3 className="text-2xl font-bold tracking-tight mt-2">
                {assessment.title}
              </h3>
            </div>
            <button
              onClick={(e) => toggleMenu(e, assessment.id)}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {assessment.description}
          </p>

          <div className="grid grid-cols-2 gap-6 mb-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2" style={{ color: color.bg }} />
                <span className="text-gray-600 font-medium">
                  {assessment.duration_minutes} minutes
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Award className="w-4 h-4 mr-2" style={{ color: color.bg }} />
                <span className="text-gray-600 font-medium">
                  Passing: {assessment.passing_score}/{assessment.max_score}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Calendar
                  className="w-4 h-4 mr-2"
                  style={{ color: color.bg }}
                />
                <span className="text-gray-600 font-medium">
                  Due: {formatDate(assessment.due_date)}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <ClipboardList
                  className="w-4 h-4 mr-2"
                  style={{ color: color.bg }}
                />
                <span className="text-gray-600 font-medium">
                  {assessment.questions?.length || 0} Questions
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <button
              onClick={(e) => handlePublishToggle(e, assessment)}
              disabled={publishingId === assessment.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                assessment.is_published
                  ? "bg-green-50 text-green-700 hover:bg-green-100"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  assessment.is_published ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              <span className="text-sm font-medium">
                {publishingId === assessment.id
                  ? "Updating..."
                  : assessment.is_published
                  ? "Published"
                  : "Draft"}
              </span>
            </button>

            <button
              className="text-sm font-semibold flex items-center gap-1 transition-colors"
              style={{ color: color.bg }}
              onMouseEnter={(e) => (e.currentTarget.style.color = color.hover)}
              onMouseLeave={(e) => (e.currentTarget.style.color = color.bg)}
              onClick={(e) => {
                e.stopPropagation();
                handleAssessmentClick(assessment);
              }}
            >
              View Details
              <ChevronDown className="w-4 h-4 transform -rotate-90" />
            </button>
          </div>
        </div>

        {/* Simplified menu dropdown */}
        {showMenu === assessment.id && (
          <div
            className="absolute right-4 top-16 bg-white rounded-lg shadow-lg z-10 border overflow-hidden min-w-[160px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(e, assessment);
              }}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit2 size={14} className="text-gray-500" />
              <span>Edit Assessment</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(e, assessment);
              }}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 border-t"
            >
              <Trash2 size={14} />
              <span>Delete Assessment</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderModulesWithAssessments = () => {
    return (
      <div className="space-y-6">
        {modules.map((module) => (
          <div
            key={module.module_id}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div
              className="p-6 bg-gray-50 border-l-4 border-yellow-500 flex justify-between items-center cursor-pointer hover:bg-gray-100"
              onClick={() => toggleModule(module.module_id)}
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {module.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {module.description}
                </p>
                <span className="text-xs text-gray-500 mt-2 inline-block">
                  {moduleAssessments[module.module_id]?.length || 0}{" "}
                  Assessment(s)
                </span>
              </div>
              <ChevronDown
                className={`w-6 h-6 text-gray-400 transform transition-transform duration-200 ${
                  expandedModules.has(module.module_id) ? "rotate-180" : ""
                }`}
              />
            </div>

            {expandedModules.has(module.module_id) && (
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                {moduleAssessments[module.module_id]?.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {moduleAssessments[module.module_id].map(
                      renderAssessmentCard
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
                    <ClipboardList
                      size={24}
                      className="mx-auto mb-3 text-gray-400"
                    />
                    <p className="text-gray-600 font-medium mb-3">
                      No assessments in this module yet
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCreateModalOpen(true);
                      }}
                      className="text-yellow-600 hover:text-yellow-700 text-sm font-medium inline-flex items-center gap-1.5"
                    >
                      <Plus size={16} />
                      Add your first assessment
                    </button>
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCreateModalOpen(true);
                  }}
                  className="mt-6 w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-yellow-500 hover:text-yellow-600 transition-colors flex items-center justify-center gap-2 bg-white"
                >
                  <Plus size={20} />
                  Add Assessment to {module.name}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Update the condition for showing "No Assessments" message
  const hasAnyAssessments = Object.values(moduleAssessments).some(
    (moduleArray) => Array.isArray(moduleArray) && moduleArray.length > 0
  );

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-auto">
        <Header
          title={selectedCourse?.name || "Course Assessment"}
          subtitle={selectedCourse?.code}
        />
        <MobileNavBar navItems={navItems} />

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

        {!loading && !error && !hasAnyAssessments && (
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
              data-testid="create-assessment-button"
              aria-label="create assessment"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create Assessment
            </button>
          </div>
        )}

        {/* Floating Action Button - Only shown when there are existing assessments */}
        {!loading && !error && hasAnyAssessments && (
          <button
            data-testid="create-assessment-floating-button"
            onClick={() => setIsCreateModalOpen(true)}
            className="fixed bottom-8 right-8 w-14 h-14 bg-[#F6BA18] text-[#212529] rounded-full shadow-lg hover:bg-[#212529] hover:text-[#F6BA18] transition-colors z-50 flex items-center justify-center"
          >
            <Plus size={24} />
          </button>
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
