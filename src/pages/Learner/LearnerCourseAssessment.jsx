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
  Lock,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCourse } from "../../contexts/CourseContext";
import {
  getCourseAssessments,
  getUserSubmission,
} from "../../services/assessmentService";
import {
  getModulesByCourseId,
  getModuleGrade,
} from "../../services/moduleService";
import { ChevronDown } from "lucide-react";

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

const LearnerCourseAssessment = () => {
  const { selectedCourse } = useCourse();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moduleAssessments, setModuleAssessments] = useState({});
  const [modules, setModules] = useState([]);
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [moduleGrades, setModuleGrades] = useState({});

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
    {
      text: "Grades",
      icon: <GraduationCap size={20} />,
      route: "/Learner/Grades",
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
                (assessment) =>
                  assessment.module_id === module.module_id &&
                  assessment.is_published
              );

              if (moduleAssessments.length > 0) {
                assessmentsByModule[module.module_id] = moduleAssessments;
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

        // Fetch submissions for all assessments
        const submissionsMap = {};
        await Promise.all(
          allAssessments.map(async (assessment) => {
            try {
              const submissionData = await getUserSubmission(
                assessment.id,
                true
              );
              if (submissionData.success && submissionData.submission) {
                submissionsMap[assessment.id] = {
                  ...submissionData.submission,
                  total_score: submissionData.submission.total_score,
                  assessment: assessment,
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

        setSubmissions(submissionsMap);
      } catch (err) {
        console.error("Error in fetchAssessments:", err);
        setError(err.message || "Failed to fetch assessments");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentsAndSubmissions();
  }, [selectedCourse, navigate]);

  useEffect(() => {
    const fetchModuleGrades = async () => {
      try {
        const gradePromises = modules.map((module) =>
          getModuleGrade(module.module_id)
            .then((data) => [module.module_id, data])
            .catch(() => [module.module_id, null])
        );

        const grades = await Promise.all(gradePromises);
        const gradesMap = Object.fromEntries(grades);
        setModuleGrades(gradesMap);
      } catch (err) {
        console.error("Error fetching module grades:", err);
      }
    };

    if (modules.length > 0) {
      fetchModuleGrades();
    }
  }, [modules]);

  const getStatus = (submission) => {
    if (!submission) return "Not Started";
    if (submission.is_late) return "Late";
    return (
      submission.status?.charAt(0).toUpperCase() +
        submission.status?.slice(1) || "Not Started"
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

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAssessmentClick = async (assessment) => {
    try {
      // Check localStorage for existing submission
      const storedData = localStorage.getItem(
        `ongoing_assessment_${assessment.id}`
      );
      const storedSubmissionId = storedData
        ? JSON.parse(storedData).submissionId
        : null;

      // Get current submission from API
      const submissionResponse = await getUserSubmission(assessment.id, true);
      const existingSubmission = submissionResponse?.submission;

      // Check if stored submission matches server submission
      let isResumable = false;
      if (storedSubmissionId && existingSubmission) {
        isResumable =
          storedSubmissionId === existingSubmission.id &&
          existingSubmission.status === "in_progress";
      }

      navigate(`/Learner/Assessment/View/${assessment.id}`, {
        state: {
          assessment,
          submission: existingSubmission,
          status: existingSubmission
            ? getStatus(existingSubmission)
            : "Not Started",
          isResumable: isResumable,
        },
      });
    } catch (error) {
      console.error("Error checking submission status:", error);
      navigate(`/Learner/Assessment/View/${assessment.id}`, {
        state: {
          assessment,
          submission: submissions[assessment.id],
          status: submissions[assessment.id]
            ? getStatus(submissions[assessment.id])
            : "Not Started",
        },
      });
    }
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

    const totalPoints = calculateTotalPoints(submission);
    const score =
      submission.answers?.reduce((sum, answer) => {
        return sum + (parseInt(answer.points_awarded) || 0);
      }, 0) || 0;

    // Calculate percentage based on max score
    const maxPossibleScore = assessment.max_score || totalPoints;
    const percentage = (score / maxPossibleScore) * 100;
    
    // Compare against passing score to determine if passed
    const passingScore = assessment.passing_score || 0;
    const passingPercentage = (passingScore / maxPossibleScore) * 100;
    const isPassed = percentage >= passingPercentage;
    
    // Check if we have auto-graded score but status is still "submitted"
    const isPartialAutoGrade = submission.status === "submitted" && score > 0;

    return (
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-baseline">
            <span
              className={`text-lg md:text-2xl font-bold ${
                isPassed ? "text-green-600" : "text-red-600"
              }`}
            >
              {score}
            </span>
            <span className="text-base md:text-lg text-gray-500">
              /{maxPossibleScore}
            </span>
          </div>
          {submission.status === "graded" && (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isPassed
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isPassed ? "Passed" : "Failed"}
            </span>
          )}
          {isPartialAutoGrade && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Auto-graded
            </span>
          )}
        </div>
        {submission.status === "graded" && (
          <div className="text-xs text-gray-500 mt-1">
            {isPassed ? (
              <span>Passed ({percentage.toFixed(1)}%)</span>
            ) : (
              <span>
                Need {(passingPercentage - percentage).toFixed(1)}% more to pass
              </span>
            )}
          </div>
        )}
        {isPartialAutoGrade && (
          <div className="text-xs text-amber-600 mt-1">
            <span>Partial score - awaiting final grading</span>
          </div>
        )}
      </div>
    );
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

  const calculateAssessmentScore = (submission) => {
    if (!submission?.answers) return 0;

    const earnedPoints = submission.answers.reduce(
      (total, answer) => total + (parseFloat(answer.points_awarded) || 0),
      0
    );

    const totalPoints = submission.assessment.questions.reduce(
      (total, question) => total + (parseFloat(question.points) || 0),
      0
    );

    return totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  };

  const checkAssessmentPassed = (assessment, submission) => {
    if (!submission || submission.status !== "graded") return false;
    const score = calculateAssessmentScore(submission);
    // Compare against passing score percentage
    const passingPercentage = assessment.passing_score;
    return score >= passingPercentage;
  };

  const checkModuleCompleted = (moduleId) => {
    const moduleAssessmentList = moduleAssessments[moduleId] || [];
    return moduleAssessmentList.every((assessment) => {
      const submission = submissions[assessment.id];
      return submission && checkAssessmentPassed(assessment, submission);
    });
  };

  const findFirstFailedAssessment = (moduleId) => {
    const moduleAssessmentList = moduleAssessments[moduleId] || [];
    return moduleAssessmentList.find((assessment) => {
      const submission = submissions[assessment.id];
      return !submission || !checkAssessmentPassed(assessment, submission);
    });
  };

  const shouldLockModule = (currentModule) => {
    // Get all modules up to the current one
    const moduleIndex = modules.findIndex(
      (m) => m.module_id === currentModule.module_id
    );
    const previousModules = modules.slice(0, moduleIndex);

    // Check if previous module is passed based on moduleGrades
    return previousModules.some((module) => {
      const moduleGrade = moduleGrades[module.module_id];
      return !(moduleGrade && moduleGrade.allPassed);
    });
  };

  const renderAssessmentCard = (assessment) => (
    <div
      key={assessment.id}
      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all"
    >
      {/* Assessment Type Badge */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            getTypeColor(assessment.type).badge
          }`}
        >
          {assessment.type.toUpperCase()}
        </span>
      </div>

      <h3 className="text-xl font-semibold mb-2">{assessment.title}</h3>
      <p className="text-gray-600 mb-4">{assessment.description}</p>

      {/* Assessment Details Grid */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Clock
              className="w-4 h-4 mr-2"
              style={{ color: getTypeColor(assessment.type).bg }}
            />
            <span className="text-gray-600 font-medium">
              Time Limit: {assessment.duration_minutes} minutes
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Award
              className="w-4 h-4 mr-2"
              style={{ color: getTypeColor(assessment.type).bg }}
            />
            <span className="text-gray-600 font-medium">
              Passing: {assessment.passing_score}/{assessment.max_score}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Calendar
              className="w-4 h-4 mr-2"
              style={{ color: getTypeColor(assessment.type).bg }}
            />
            <span className="text-gray-600 font-medium">
              Due: {formatDate(assessment.due_date)}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <ClipboardList
              className="w-4 h-4 mr-2"
              style={{ color: getTypeColor(assessment.type).bg }}
            />
            <span className="text-gray-600 font-medium">
              {assessment.questions?.length || 0} Questions
              {assessment.allowed_attempts && (
                <span className="ml-2 text-gray-500">
                  ({assessment.allowed_attempts} attempt
                  {assessment.allowed_attempts !== 1 ? "s" : ""} allowed)
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModuleAssessments = () => (
    <div className="space-y-6">
      {modules.map((module, index) => {
        const isModuleLocked = shouldLockModule(module);
        const failedAssessment = isModuleLocked
          ? findFirstFailedAssessment(
              modules[
                modules.findIndex((m) => m.module_id === module.module_id) - 1
              ]?.module_id
            )
          : null;

        return (
          <div
            key={module.module_id}
            className={`group bg-white rounded-xl border-gray-200/50 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border-l-[6px] ${getModuleColor(
              index
            )} ${isModuleLocked ? "opacity-75" : ""}`}
          >
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 via-white to-white relative">
              {isModuleLocked && (
                <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 rounded-lg transition-all duration-300">
                  <Lock className="h-12 w-12 text-white/90" />
                  <span className="text-white/90 text-sm mt-2">
                    Complete previous module to unlock
                  </span>
                </div>
              )}

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
                      <span className="flex h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-gray-600 font-medium">
                        {
                          moduleAssessments[module.module_id]?.filter(
                            (assessment) =>
                              submissions[assessment.id]?.status ===
                                "submitted" ||
                              submissions[assessment.id]?.status === "graded"
                          ).length
                        }
                        /{moduleAssessments[module.module_id]?.length || 0}{" "}
                        Completed
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="flex h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-gray-600 font-medium">
                        {
                          moduleAssessments[module.module_id]?.filter(
                            (assessment) =>
                              submissions[assessment.id]?.status === "graded" &&
                              checkAssessmentPassed(
                                assessment,
                                submissions[assessment.id]
                              )
                          ).length
                        }{" "}
                        Passed
                      </span>
                    </div>
                  </div>
                </div>
                <div className="self-center">
                  <div
                    className={`w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center transition-all duration-300 group-hover:border-gray-300 group-hover:bg-gray-100 ${
                      expandedModules.has(module.module_id) ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  </div>
                </div>
              </div>
            </div>

            {expandedModules.has(module.module_id) && (
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                {isModuleLocked ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Module Locked
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {failedAssessment
                        ? `You need to pass "${failedAssessment.title}" with a score of at least ${failedAssessment.passing_score} to unlock this module.`
                        : "Complete all assessments in the previous module to unlock this module."}
                    </p>
                  </div>
                ) : moduleAssessments[module.module_id]?.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {moduleAssessments[module.module_id].map((assessment) => {
                      const color = getTypeColor(assessment.type);
                      const submission = submissions[assessment.id];
                      const score = submission
                        ? calculateAssessmentScore(submission)
                        : 0;
                      const isPassed = checkAssessmentPassed(
                        assessment,
                        submission
                      );

                      return (
                        <div
                          key={assessment.id}
                          onClick={() => handleAssessmentClick(assessment)}
                          className="w-full rounded-xl shadow-md bg-white hover:shadow-lg transition-all duration-200 overflow-hidden group relative"
                        >
                          <div
                            className={`px-6 py-4 text-white relative overflow-hidden bg-gradient-to-br ${color.bg}`}
                          >
                            <div className="absolute right-0 top-0 -mt-8 -mr-12 h-32 w-32 rotate-12 transform rounded-xl bg-white opacity-10 group-hover:opacity-20 transition-opacity" />

                            <div className="flex flex-col gap-2 relative z-10">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color.badge}`}
                                >
                                  {assessment.type?.toUpperCase() || "QUIZ"}
                                </span>
                                {submissions[assessment.id] && (
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                      getStatus(submissions[assessment.id])
                                    )}`}
                                  >
                                    {getStatus(submissions[assessment.id])}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-2xl font-bold tracking-tight">
                                {assessment.title}
                              </h3>
                            </div>
                          </div>

                          <div className="px-6 py-4">
                            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                              {assessment.description}
                            </p>

                            <div className="grid grid-cols-2 gap-6 mb-4">
                              <div className="space-y-3">
                                <div className="flex items-center text-sm">
                                  <Clock
                                    className="w-4 h-4 mr-2"
                                    style={{ color: color.bg }}
                                  />
                                  <span className="text-gray-600 font-medium">
                                    {assessment.duration_minutes} minutes
                                  </span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Award
                                    className="w-4 h-4 mr-2"
                                    style={{ color: color.bg }}
                                  />
                                  <span className="text-gray-600 font-medium">
                                    Passing: {assessment.passing_score}
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
                                    {assessment.questions?.length || 0}{" "}
                                    Questions
                                    {assessment.allowed_attempts && (
                                      <span className="ml-2 text-gray-500">
                                        ({assessment.allowed_attempts} attempt
                                        {assessment.allowed_attempts !== 1
                                          ? "s"
                                          : ""}{" "}
                                        allowed)
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start md:items-center justify-between gap-4 pt-4 border-t">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssessmentClick(assessment);
                                }}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-md bg-gradient-to-r ${color.bg} hover:opacity-90 transition-opacity`}
                              >
                                View Assessment
                              </button>
                              {renderSubmissionScore(
                                submissions[assessment.id],
                                assessment
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
                    <ClipboardList
                      size={24}
                      className="mx-auto mb-3 text-gray-400"
                    />
                    <p className="text-gray-600 font-medium">
                      No assessments in this module yet
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-auto">
        <Header
          title={selectedCourse?.name || "Course"}
          subtitle={selectedCourse?.code}
        />
        <div className="relative z-50">
          <MobileNavBar navItems={navItems} />
        </div>

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
          <div className="flex flex-col gap-4 mt-4 overflow-y-auto max-h-[calc(100vh-160px)] pr-1 pb-6">
            {modules.length === 0 ? (
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
              renderModuleAssessments()
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnerCourseAssessment;
