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
  RotateCcw,
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
      route: "/Teacher/ProgressTracker",
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

        // Fetch updated assessments
        await fetchAssessments();
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
      // Keep the existing questions count when updating the assessment in state
      const currentAssessment = assessments.find(
        (a) => a.id === updatedAssessment.id
      );
      const updatedWithQuestions = {
        ...updatedAssessment,
        questions: currentAssessment.questions || [],
      };

      // Update moduleAssessments state
      setModuleAssessments((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((moduleId) => {
          updated[moduleId] = updated[moduleId].map((a) =>
            a.id === updatedAssessment.id ? updatedWithQuestions : a
          );
        });
        return updated;
      });

      // Update assessments array
      setAssessments((prev) =>
        prev.map((a) =>
          a.id === updatedAssessment.id ? updatedWithQuestions : a
        )
      );

      setEditingAssessment(null);
      setSuccessMessage("Assessment updated successfully");
    } catch (err) {
      console.error("Error updating assessment:", err);
      setError("Failed to update assessment");
    }
  };

  const typeColors = {
    quiz: {
      bg: "from-blue-400 via-blue-500 to-blue-600", // Update to gradient
      text: "white",
      hover: "#2563EB",
      badge: "bg-blue-100 text-blue-800",
      light: "rgba(59, 130, 246, 0.1)",
    },
    exam: {
      bg: "from-violet-400 via-purple-500 to-purple-600", // Update to gradient
      text: "white",
      hover: "#6D28D9",
      badge: "bg-purple-100 text-purple-800",
      light: "rgba(139, 92, 246, 0.1)",
    },
    assignment: {
      bg: "from-emerald-400 via-emerald-500 to-emerald-600", // Update to gradient
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

  const getModuleColor = (index) => {
    const colors = ["blue", "violet", "emerald"];
    const colorKey = colors[index % colors.length];
    const gradientMap = {
      blue: "border-blue-500",
      violet: "border-purple-500",
      emerald: "border-emerald-500",
    };
    return gradientMap[colorKey];
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
          className={`px-6 py-4 text-white relative overflow-hidden bg-gradient-to-br ${color.bg}`}
        >
          <div className="absolute right-0 top-0 -mt-8 -mr-12 h-32 w-32 rotate-12 transform rounded-xl bg-white opacity-10 transition-opacity duration-300 ease-in-out group-hover:opacity-25" />

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
                  Time Limit: {assessment.duration_minutes} minutes
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Award className="w-4 h-4 mr-2" style={{ color: color.bg }} />
                <span className="text-gray-600 font-medium">
                  Passing: {assessment.passing_score}/{assessment.max_score}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <RotateCcw
                  className="w-4 h-4 mr-2"
                  style={{ color: color.bg }}
                />
                <span className="text-gray-600 font-medium">
                  {assessment.allowed_attempts}{" "}
                  {assessment.allowed_attempts === 1 ? "attempt" : "attempts"}
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
            {/* Change the button to a status indicator */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                assessment.is_published
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-50 text-gray-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  assessment.is_published ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              <span className="text-sm font-medium">
                {assessment.is_published ? "Published" : "Draft"}
              </span>
            </div>

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
            className="absolute right-4 top-16 bg-white rounded-lg shadow-xl z-10 border-0 overflow-hidden min-w-[160px] divide-y divide-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(e, assessment);
              }}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700 font-medium transition-colors"
            >
              <Edit2 size={14} className="text-gray-400" />
              <span>Edit Assessment</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(e, assessment);
              }}
              className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 font-medium transition-colors"
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
        {modules.map((module, index) => {
          const moduleAssessmentList =
            moduleAssessments[module.module_id] || [];
          const publishedCount = moduleAssessmentList.filter(
            (a) => a.is_published
          ).length;
          const unpublishedCount = moduleAssessmentList.length - publishedCount;

          const borderColors = [
            "border-blue-500",
            "border-purple-500",
            "border-green-500",
          ];
          const borderColor = borderColors[index % borderColors.length];

          return (
            <div
              key={module.module_id}
              className="group bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <div
                className={`px-8 py-6 bg-gradient-to-r from-gray-50 via-white to-white relative border-l-[6px] ${borderColor}`}
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleModule(module.module_id)}
                >
                  <div className="flex-1 pr-8">
                    <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
                      {module.name}
                    </h3>
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="flex h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-gray-600 font-medium">
                          {publishedCount} Published
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="flex h-2 w-2 rounded-full bg-gray-400" />
                        <span className="text-gray-600 font-medium">
                          {unpublishedCount} Drafts
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center transition-all duration-300 group-hover:border-gray-300 group-hover:bg-gray-100 ${
                        expandedModules.has(module.module_id)
                          ? "rotate-180"
                          : ""
                      }`}
                    >
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </div>
                </div>
              </div>

              {expandedModules.has(module.module_id) && (
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  {moduleAssessmentList.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {moduleAssessmentList.map(renderAssessmentCard)}
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCreateModalOpen(true);
                    }}
                    className="mt-6 w-full p-4 flex items-center justify-center gap-2 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-200 hover:bg-gray-50 hover:text-[#212529] transition-colors group"
                  >
                    <Plus
                      size={20}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span className="font-medium">Add a new assessment</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
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
        <div className="sticky top-0 z-50">
          <MobileNavBar navItems={navItems} />
        </div>

        {/* Success and Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

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

        {/* Existing Content */}
        {!loading && !error && hasAnyAssessments && (
          <div className="flex flex-col gap-4">
            {renderModulesWithAssessments()}
          </div>
        )}

        {/* No Assessments State with Add First Assessment Button */}
        {!loading && !error && !hasAnyAssessments && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-gray-400 mb-4">
              <ClipboardList size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Assessments Available
            </h3>
            <p className="text-gray-500 mb-6">
              There are no assessments for this course yet.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#212529] hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300"
            >
              <Plus size={20} className="mr-2" />
              Create Your First Assessment
            </button>
          </div>
        )}

        {/* Modals */}
        <CreateAssessmentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
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
