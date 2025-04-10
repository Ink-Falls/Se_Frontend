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
  BookCheck,
  BookMarked,
  BookmarkCheck,
  ChevronRight,
  FileText,
} from "lucide-react";
import { useCourse } from "../../contexts/CourseContext";
import { useNavigate } from "react-router-dom";
import CreateAssessmentModal from "../../components/common/Modals/Create/CreateAssessmentModal";
import EditAssessmentModal from "../../components/common/Modals/Edit/EditAssessmentModal";
import DeleteModal from "../../components/common/Modals/Delete/DeleteModal";
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
      setAssessments((prev) => [newAssessment, ...prev]);
      setIsCreateModalOpen(false);
      setSuccessMessage("Assessment created successfully");
      await fetchAssessments();
    } catch (err) {
      console.error("Error handling new assessment:", err);
      setError("Failed to create assessment");
    }
  };

  const handleAssessmentClick = (assessment) => {
    navigate(`/Teacher/Assessment/View/${assessment.id}`, {
      state: {
        assessment,
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
        setAssessments((prev) =>
          prev.filter((a) => a.id !== assessmentToDelete.id)
        );
        await fetchAssessments();
        setSuccessMessage("Assessment deleted successfully");
      } else {
        throw new Error(response.message || "Failed to delete assessment");
      }
    } catch (error) {
      console.error("Error deleting assessment:", error);
      setError(error.message || "Failed to delete assessment");
    } finally {
      setAssessmentToDelete(null);
    }
  };

  const handleEditSubmit = async (updatedAssessment) => {
    try {
      const currentAssessment = assessments.find(
        (a) => a.id === updatedAssessment.id
      );
      const updatedWithQuestions = {
        ...updatedAssessment,
        questions: currentAssessment.questions || [],
      };

      setModuleAssessments((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((moduleId) => {
          updated[moduleId] = updated[moduleId].map((a) =>
            a.id === updatedAssessment.id ? updatedWithQuestions : a
          );
        });
        return updated;
      });

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
      bg: "from-blue-400 via-blue-500 to-blue-600",
      solidBg: "bg-blue-500",
      lightBg: "bg-blue-50",
      text: "white",
      hover: "#2563EB",
      badge: "bg-blue-100 text-blue-800",
      light: "rgba(59, 130, 246, 0.1)",
      border: "border-blue-200",
      hoverBg: "hover:bg-blue-50",
      iconColor: "text-blue-500",
      gradientText: "text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700",
      icon: <ClipboardList />,
    },
    exam: {
      bg: "from-violet-400 via-purple-500 to-purple-600",
      solidBg: "bg-purple-500",
      lightBg: "bg-purple-50",
      text: "white",
      hover: "#6D28D9",
      badge: "bg-purple-100 text-purple-800",
      light: "rgba(139, 92, 246, 0.1)",
      border: "border-purple-200",
      hoverBg: "hover:bg-purple-50",
      iconColor: "text-purple-500",
      gradientText: "text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-700",
      icon: <BookOpen />,
    },
    assignment: {
      bg: "from-emerald-400 via-emerald-500 to-emerald-600",
      solidBg: "bg-emerald-500",
      lightBg: "bg-emerald-50",
      text: "white",
      hover: "#059669",
      badge: "bg-green-100 text-green-800",
      light: "rgba(16, 185, 129, 0.1)",
      border: "border-emerald-200",
      hoverBg: "hover:bg-emerald-50",
      iconColor: "text-emerald-500",
      gradientText: "text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700",
      icon: <FileText />,
    },
  };

  const getTypeColor = (type) => {
    return typeColors[type?.toLowerCase()] || typeColors.quiz;
  };

  const toggleMenu = (e, assessmentId) => {
    e.stopPropagation();
    setShowMenu((prev) => (prev === assessmentId ? null : assessmentId));
  };

  const renderModulesWithAssessments = () => {
    return (
      <div className="space-y-8">
        {modules.map((module) => {
          const moduleAssessmentList =
            moduleAssessments[module.module_id] || [];
          const publishedCount = moduleAssessmentList.filter(
            (a) => a.is_published
          ).length;
          const unpublishedCount = moduleAssessmentList.length - publishedCount;
          const isExpanded = expandedModules.has(module.module_id);

          const modulePatternIndex = module.module_id % 5;
          const modulePatterns = [
            "bg-gradient-to-r from-blue-500/5 to-indigo-500/5",
            "bg-gradient-to-r from-emerald-500/5 to-teal-500/5",
            "bg-gradient-to-r from-amber-500/5 to-orange-500/5",
            "bg-gradient-to-r from-rose-500/5 to-pink-500/5",
            "bg-gradient-to-r from-violet-500/5 to-purple-500/5",
          ];
          const modulePattern = modulePatterns[modulePatternIndex];

          const moduleIconIndex = module.module_id % 4;
          const moduleIcons = [
            <BookOpen className="w-6 h-6" />,
            <BookCheck className="w-6 h-6" />,
            <BookmarkCheck className="w-6 h-6" />,
            <BookMarked className="w-6 h-6" />,
          ];
          const ModuleIcon = () => moduleIcons[moduleIconIndex];

          return (
            <div
              key={module.module_id}
              className={`group rounded-2xl overflow-hidden transition-all duration-500 ${
                isExpanded
                  ? "shadow-lg ring-2 ring-indigo-300 ring-offset-2"
                  : "shadow hover:shadow-md border border-gray-200"
              }`}
            >
              <div
                className={`transition-all duration-300 cursor-pointer relative overflow-hidden ${modulePattern}`}
                onClick={() => toggleModule(module.module_id)}
              >
                <div className="absolute inset-0 opacity-30">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`absolute rounded-full ${
                        isExpanded ? "bg-indigo-200" : "bg-gray-200"
                      }`}
                      style={{
                        width: `${Math.random() * 40 + 10}px`,
                        height: `${Math.random() * 40 + 10}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        opacity: Math.random() * 0.5,
                      }}
                    />
                  ))}
                </div>

                <div
                  className={`px-8 py-6 flex items-start gap-5 relative z-10 ${
                    isExpanded ? "bg-indigo-50/80" : "group-hover:bg-gray-50/80"
                  }`}
                >
                  <div
                    className={`relative flex-shrink-0 ${
                      isExpanded ? "animate-bounce" : ""
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        isExpanded
                          ? "bg-indigo-100 text-indigo-600 shadow-lg shadow-indigo-200"
                          : "bg-gray-100 text-gray-600 shadow-sm"
                      } transform transition-all duration-300 ${
                        isExpanded ? "rotate-0 scale-110" : "group-hover:scale-105"
                      }`}
                    >
                      <ModuleIcon />
                    </div>
                    <div
                      className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${
                        moduleAssessmentList.length > 0
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      } flex items-center justify-center text-[10px] text-white font-bold border-2 border-white`}
                    >
                      {moduleAssessmentList.length > 0 ? "✓" : "!"}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3
                        className={`text-xl font-bold tracking-tight ${
                          isExpanded
                            ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600"
                            : "text-gray-900 group-hover:text-indigo-700"
                        } transition-colors duration-300`}
                      >
                        {module.name}
                      </h3>
                      {moduleAssessmentList.length > 0 && (
                        <span
                          className={`ml-3 px-2 py-1 text-xs rounded-full ${
                            isExpanded
                              ? "bg-indigo-200 text-indigo-800"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {moduleAssessmentList.length} items
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <div className="flex items-center">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{
                              width: `${
                                moduleAssessmentList.length > 0
                                  ? (publishedCount / moduleAssessmentList.length) *
                                    100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-gray-600">
                          {publishedCount} Published
                        </span>
                      </div>

                      <div className="flex items-center">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-500"
                            style={{
                              width: `${
                                moduleAssessmentList.length > 0
                                  ? (unpublishedCount /
                                      moduleAssessmentList.length) *
                                    100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-gray-600">
                          {unpublishedCount} Drafts
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex-shrink-0 transform transition-transform duration-500 ${
                      isExpanded ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isExpanded
                          ? "bg-indigo-500 text-white"
                          : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600"
                      } transition-colors duration-300`}
                    >
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-8 bg-gradient-to-b from-indigo-50/50 to-white">
                  {moduleAssessmentList.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-8">
                        {moduleAssessmentList.map(renderAssessmentCard)}
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCreateModalOpen(true);
                        }}
                        className="group flex items-center justify-center p-4 bg-white border-2 border-dashed border-indigo-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 cursor-pointer"
                      >
                        <div className="relative">
                          <div className="absolute -inset-2 bg-indigo-500 rounded-full opacity-0 blur-lg group-hover:opacity-20 transition-opacity duration-300"></div>
                          <div className="p-2 bg-indigo-100 rounded-full group-hover:bg-indigo-200 transition-colors duration-300">
                            <Plus className="h-6 w-6 text-indigo-600" />
                          </div>
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-indigo-700 transition-colors duration-300">
                          Add New Assessment to {module.name}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCreateModalOpen(true);
                      }}
                      className="bg-white border-2 border-dashed border-indigo-300 rounded-xl p-8 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="relative w-32 h-32 mb-4">
                          <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-20"></div>
                          <div className="absolute inset-0 bg-indigo-50 rounded-full animate-pulse"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
                              <ClipboardList className="h-10 w-10 text-indigo-500" />
                            </div>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 mb-2">
                          No Assessments in this Module
                        </h3>
                        <p className="text-gray-600 text-sm mb-6 max-w-md">
                          Let's create your first assessment for this module!
                          Your students will thank you for the learning
                          opportunity.
                        </p>
                        <button className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 hover:shadow-indigo-200 group-hover:scale-105 transform transition-transform duration-300">
                          <Plus className="h-5 w-5" />
                          <span>Create First Assessment</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAssessmentCard = (assessment) => {
    const color = getTypeColor(assessment.type);
    const dueDate = new Date(assessment.due_date);
    const isOverdue = dueDate < new Date();
    const Icon = color.icon || <ClipboardList />;

    return (
      <div
        key={assessment.id}
        onClick={() => handleAssessmentClick(assessment)}
        className={`group bg-white rounded-xl overflow-hidden shadow-sm border transition-all duration-300 hover:-translate-y-1 ${color.border} hover:shadow-md`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center">
            <div
              className={`mr-3 ${color.lightBg} w-8 h-8 rounded-lg flex items-center justify-center`}
            >
              <div className={`${color.iconColor}`}>
                {React.cloneElement(Icon, { size: 16 })}
              </div>
            </div>

            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${color.badge}`}
            >
              {assessment.type?.toUpperCase() || "QUIZ"}
            </span>
          </div>

          <div className="flex items-center">
            <span 
              className={`mr-2 px-2 py-1 rounded-md text-xs font-medium ${
                assessment.is_published 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {assessment.is_published ? "PUBLISHED" : "DRAFT"}
            </span>
            
            <button
              onClick={(e) => toggleMenu(e, assessment.id)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="px-4 py-4">
          <div className="mb-3">
            <h3
              className={`text-lg font-bold line-clamp-1 ${color.gradientText} group-hover:underline`}
            >
              {assessment.title}
            </h3>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10 italic">
            {assessment.description || "No description provided"}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div
              className={`rounded-lg p-3 flex flex-col items-center justify-center border ${color.border} ${color.lightBg}`}
            >
              <div className="flex items-center mb-1">
                <Clock className={`w-4 h-4 mr-1 ${color.iconColor}`} />
                <span className="text-xs text-gray-500">Time Limit</span>
              </div>
              <span className="text-xs font-medium">
                {assessment.duration_minutes} min
              </span>
            </div>

            <div
              className={`rounded-lg p-3 flex flex-col items-center justify-center border ${color.border} ${color.lightBg}`}
            >
              <div className="flex items-center mb-1">
                <Award className={`w-4 h-4 mr-1 ${color.iconColor}`} />
                <span className="text-xs text-gray-500">Passing Score</span>
              </div>
              <span className="text-xs font-medium">
                {assessment.passing_score}/{assessment.max_score}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
            <div className="flex items-center">
              <RotateCcw className={`w-4 h-4 mr-2 ${color.iconColor}`} />
              <span>
                <strong>{assessment.allowed_attempts}</strong>
                <span className="text-gray-500 ml-1">
                  {assessment.allowed_attempts === 1 ? "attempt" : "attempts"}
                </span>
              </span>
            </div>

            <div className="flex items-center">
              <ClipboardList className={`w-4 h-4 mr-2 ${color.iconColor}`} />
              <span>
                <strong>{assessment.questions?.length || 0}</strong>
                <span className="text-gray-500 ml-1">questions</span>
              </span>
            </div>
          </div>

          <div
            className={`flex items-center justify-between p-3 rounded-lg ${
              isOverdue
                ? "bg-red-50 border border-red-100"
                : "bg-gray-50 border border-gray-100"
            }`}
          >
            <div className="flex items-center">
              <Calendar
                className={`w-4 h-4 ${
                  isOverdue ? "text-red-500" : color.iconColor
                }`}
              />
              <span
                className={`ml-2 text-xs font-medium ${
                  isOverdue ? "text-red-600" : "text-gray-700"
                }`}
              >
                {isOverdue ? "Overdue" : "Due"}
              </span>
            </div>
            <span
              className={`text-xs font-medium ${
                isOverdue ? "text-red-600" : "text-gray-700"
              }`}
            >
              {dueDate.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {!isOverdue && (
            <div className="mt-2 flex justify-center">
              <div className={`text-xs ${color.iconColor} animate-pulse`}>
                {(() => {
                  const now = new Date();
                  const diff = dueDate.getTime() - now.getTime();
                  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

                  if (days > 0) {
                    return `${days} day${days > 1 ? "s" : ""} remaining`;
                  }

                  const hours = Math.floor(
                    (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                  );
                  return `${hours} hour${hours !== 1 ? "s" : ""} remaining`;
                })()}
              </div>
            </div>
          )}
        </div>

        <div className="mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAssessmentClick(assessment);
            }}
            className={`w-full py-3 text-center text-sm font-medium text-white bg-gradient-to-r ${color.bg} transition-all hover:shadow-inner`}
          >
            <span className="flex items-center justify-center">
              View Assessment
              <ChevronRight
                size={16}
                className="ml-1 group-hover:translate-x-1 transform transition-transform"
              />
            </span>
          </button>
        </div>

        {showMenu === assessment.id && (
          <div
            className="absolute right-3 top-12 bg-white rounded-xl shadow-lg z-20 border border-gray-200 overflow-hidden min-w-[200px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`py-3 px-4 border-b border-gray-100 bg-gradient-to-r ${color.bg} text-white`}
            >
              <span className="text-sm font-medium">Assessment Options</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(e, assessment);
              }}
              className={`w-full px-4 py-3 text-left text-sm ${color.hoverBg} flex items-center gap-3 text-gray-700 transition-colors`}
            >
              <div className={`p-1 rounded-lg ${color.lightBg}`}>
                <Edit2 size={14} className={color.iconColor} />
              </div>
              <span>Edit Assessment</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(e, assessment);
              }}
              className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors border-t border-gray-100"
            >
              <div className="p-1 rounded-lg bg-red-100">
                <Trash2 size={14} className="text-red-500" />
              </div>
              <span>Delete Assessment</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const hasAnyAssessments = Object.values(moduleAssessments).some(
    (moduleArray) => Array.isArray(moduleArray) && moduleArray.length > 0
  );

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <div className="flex flex-1 h-[calc(100vh-32px)]">
        <div className="hidden lg:flex">
          <Sidebar navItems={navItems} />
        </div>

        <div className="flex-1 p-6 max-md:p-5 overflow-y-auto">
          <div>
            <Header
              title={selectedCourse?.name || "Course Assessment"}
              subtitle={selectedCourse?.code}
            />
            <div className="relative z-50">
              <MobileNavBar navItems={navItems} />
            </div>
          </div>

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

          {loading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 h-[60vh]">
              <AlertTriangle size={48} className="text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Failed to Load Assessments
              </h3>
              <p className="text-gray-600 text-center mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : !hasAnyAssessments ? (
            <div
              className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-yellow-500 hover:bg-yellow-50 transition-all duration-200 cursor-pointer mt-4"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-yellow-100 rounded-full mb-4">
                  <ClipboardList className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No Assessments Yet
                </h3>
                <p className="text-gray-600 mb-4 max-w-md">
                  There are no assessments for this course yet. Create your
                  first assessment to begin evaluating student knowledge.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors">
                  <Plus size={16} />
                  Create First Assessment
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4">{renderModulesWithAssessments()}</div>
          )}
        </div>
      </div>

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
  );
};

export default TeacherCourseAssessment;
