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
import { getModulesByCourseId, getModuleGrade } from "../../services/moduleService";
import { ChevronDown } from "lucide-react";

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
        const gradePromises = modules.map(module => 
          getModuleGrade(module.module_id)
            .then(data => [module.module_id, data])
            .catch(() => [module.module_id, null])
        );
        
        const grades = await Promise.all(gradePromises);
        const gradesMap = Object.fromEntries(grades);
        setModuleGrades(gradesMap);
      } catch (err) {
        console.error('Error fetching module grades:', err);
      }
    };

    if (modules.length > 0) {
      fetchModuleGrades();
    }
  }, [modules]);

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
      const storedData = localStorage.getItem(`ongoing_assessment_${assessment.id}`);
      const storedSubmissionId = storedData ? JSON.parse(storedData).submissionId : null;
      
      console.log('View Assessment - Initial check:', {
        assessmentId: assessment.id,
        storedSubmissionId: storedSubmissionId
      });
  
      // Get current submission from API
      const submissionResponse = await getUserSubmission(assessment.id, true);
      const existingSubmission = submissionResponse?.submission;
  
      // Check if stored submission matches server submission
      let isResumable = false;
      if (storedSubmissionId && existingSubmission) {
        isResumable = storedSubmissionId === existingSubmission.id && 
                      existingSubmission.status === 'in_progress';
        
        console.log('Submission ID comparison:', {
          stored: storedSubmissionId,
          server: existingSubmission.id,
          matches: storedSubmissionId === existingSubmission.id,
          status: existingSubmission.status,
          isResumable: isResumable
        });
      }
  
      navigate(`/Learner/Assessment/View/${assessment.id}`, {
        state: { 
          assessment,
          submission: existingSubmission,
          status: existingSubmission ? getStatus(existingSubmission) : "Not Started",
          isResumable: isResumable
        }
      });
    } catch (error) {
      console.error('Error checking submission status:', error);
      navigate(`/Learner/Assessment/View/${assessment.id}`, {
        state: { 
          assessment,
          submission: submissions[assessment.id],
          status: submissions[assessment.id] ? getStatus(submissions[assessment.id]) : "Not Started"
        }
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
    
    const earnedPoints = submission.answers.reduce((total, answer) => 
      total + (answer.points_awarded || 0), 0);
    
    const totalPoints = submission.assessment.questions.reduce((total, question) => 
      total + (question.points || 0), 0);
    
    return totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  };

  const checkAssessmentPassed = (assessment, submission) => {
    if (!submission || submission.status !== 'graded') return false;
    const score = calculateAssessmentScore(submission);
    return score >= assessment.passing_score;
  };

  const checkModuleCompleted = (moduleId) => {
    const moduleAssessmentList = moduleAssessments[moduleId] || [];
    return moduleAssessmentList.every(assessment => {
      const submission = submissions[assessment.id];
      return submission && checkAssessmentPassed(assessment, submission);
    });
  };

  const findFirstFailedAssessment = (moduleId) => {
    const moduleAssessmentList = moduleAssessments[moduleId] || [];
    return moduleAssessmentList.find(assessment => {
      const submission = submissions[assessment.id];
      return !submission || !checkAssessmentPassed(assessment, submission);
    });
  };

  const shouldLockModule = (currentModule) => {
    // Get all modules up to the current one
    const moduleIndex = modules.findIndex(m => m.module_id === currentModule.module_id);
    const previousModules = modules.slice(0, moduleIndex);
    
    // Check if all previous modules are completed
    return previousModules.some(module => !checkModuleCompleted(module.module_id));
  };

  const renderAssessmentCard = (assessment) => (
    <div key={assessment.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all">
      {/* Assessment Type Badge */}
      <div className="flex items-center gap-3 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(assessment.type).badge}`}>
          {assessment.type.toUpperCase()}
        </span>
      </div>

      <h3 className="text-xl font-semibold mb-2">{assessment.title}</h3>
      <p className="text-gray-600 mb-4">{assessment.description}</p>

      {/* Assessment Details Grid - Updated to include question count */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Clock className="w-4 h-4 mr-2" style={{ color: getTypeColor(assessment.type).bg }} />
            <span className="text-gray-600 font-medium">
              Time Limit: {assessment.duration_minutes} minutes
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Award className="w-4 h-4 mr-2" style={{ color: getTypeColor(assessment.type).bg }} />
            <span className="text-gray-600 font-medium">
              Passing: {assessment.passing_score}/{assessment.max_score}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-2" style={{ color: getTypeColor(assessment.type).bg }} />
            <span className="text-gray-600 font-medium">
              Due: {formatDate(assessment.due_date)}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <ClipboardList className="w-4 h-4 mr-2" style={{ color: getTypeColor(assessment.type).bg }} />
            <span className="text-gray-600 font-medium">
              {assessment.questions?.length || 0} Questions
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModuleAssessments = () => (
    <div className="space-y-6">
      {modules.map((module) => {
        const isModuleLocked = shouldLockModule(module);
        const failedAssessment = isModuleLocked ? 
          findFirstFailedAssessment(modules[modules.findIndex(m => m.module_id === module.module_id) - 1]?.module_id) : 
          null;

        return (
          <div
            key={module.module_id}
            className={`bg-white rounded-lg shadow-sm overflow-hidden ${
              isModuleLocked ? 'opacity-50' : ''
            }`}
          >
            <div
              className="p-6 bg-gray-50 border-l-4 border-yellow-500 flex justify-between items-center cursor-pointer hover:bg-gray-100"
              onClick={() => toggleModule(module.module_id)}
            >
              <div>
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {module.name}
                  </h3>
                  {moduleGrades[module.module_id] && (
                    <div className="flex gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Average: {moduleGrades[module.module_id].averageScore}%
                      </span>
                      {!moduleGrades[module.module_id].allGraded ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                          In Progress
                        </span>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          moduleGrades[module.module_id].allPassed 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {moduleGrades[module.module_id].allPassed ? 'Passed' : 'Failed'}
                        </span>
                        // or red for failed?
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                <span className="text-xs text-gray-500 mt-2 inline-block">
                  {moduleAssessments[module.module_id]?.length || 0} Assessment(s)
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
                {isModuleLocked ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Module Locked
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {failedAssessment ? 
                        `You need to pass "${failedAssessment.title}" with a score of at least ${failedAssessment.passing_score}% to unlock this module.` :
                        "Complete all assessments in the previous module to unlock this module."}
                    </p>
                  </div>
                ) : moduleAssessments[module.module_id]?.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {moduleAssessments[module.module_id].map((assessment) => {
                      const color = getTypeColor(assessment.type);
                      const submission = submissions[assessment.id];
                      const score = submission ? calculateAssessmentScore(submission) : 0;
                      const isPassed = checkAssessmentPassed(assessment, submission);

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
                            <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16 rotate-45 bg-white opacity-10 rounded-full" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 transform -translate-x-12 translate-y-12 rotate-45 bg-white opacity-10 rounded-full" />

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
                                    Passing: {assessment.passing_score}%
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
                                className="px-4 py-2 text-sm font-medium text-white rounded-md"
                                style={{ backgroundColor: color.bg }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssessmentClick(assessment);
                                }}
                              >
                                View Assessment
                              </button>
                              {renderSubmissionScore(
                                submissions[assessment.id],
                                assessment
                              )}
                              {submission?.status === 'graded' && (
                                <div className={`text-sm mt-2 ${
                                  isPassed ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  Score: {score.toFixed(1)}% 
                                  {isPassed ? ' (Passed)' : ` (Need ${assessment.passing_score}% to pass)`}
                                </div>
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
