import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getModulesByCourseId,
  getModuleContents,
  getModuleGrade,
} from "../../services/moduleService";
import Sidebar from "../../components/common/layout/Sidebar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Header from "../../components/common/layout/Header";
import {
  ChevronDown,
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
  FileText,
  ExternalLink,
  Lock,
} from "lucide-react";
import { useCourse } from "../../contexts/CourseContext";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import { useAuth } from "../../contexts/AuthContext";
import {
  getCourseAssessments,
  getUserSubmission,
} from "../../services/assessmentService";

const moduleColors = {
  blue: {
    bg: "#3B82F6",
    accent: "#60A5FA",
    light: "#EFF6FF",
  },
  purple: {
    bg: "#8B5CF6",
    accent: "#A78BFA",
    light: "#F5F3FF",
  },
  green: {
    bg: "#22C55E",
    accent: "#4ADE80",
    light: "#F0FDF4",
  },
  pink: {
    bg: "#EC4899",
    accent: "#F472B6",
    light: "#FDF2F8",
  },
  orange: {
    bg: "#F97316",
    accent: "#FB923C",
    light: "#FFF7ED",
  },
};

const LearnerCourseModules = () => {
  const { selectedCourse } = useCourse();
  const { logout } = useAuth();
  const navigate = useNavigate();

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

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moduleAssessments, setModuleAssessments] = useState({});
  const [submissions, setSubmissions] = useState({});
  const [moduleGrades, setModuleGrades] = useState({});

  const checkAssessmentPassed = (assessment, submission) => {
    if (!submission || submission.status !== "graded") return false;
    const score = submission.total_score || 0;
    const maxScore = assessment.max_score || 100;
    const percentage = (score / maxScore) * 100;
    return percentage >= assessment.passing_score;
  };

  const checkModuleCompleted = (moduleId) => {
    const moduleAssessmentList = moduleAssessments[moduleId] || [];
    return moduleAssessmentList.every((assessment) => {
      const submission = submissions[assessment.id];
      return submission && checkAssessmentPassed(assessment, submission);
    });
  };

  const shouldLockModule = (currentModule) => {
    const moduleIndex = modules.findIndex(
      (m) => m.module_id === currentModule.module_id
    );
    if (moduleIndex === 0) return false;

    const previousModules = modules.slice(0, moduleIndex);

    return previousModules.some((module) => {
      const moduleGrade = moduleGrades[module.module_id];
      return !(moduleGrade && moduleGrade.allPassed);
    });
  };

  useEffect(() => {
    if (!selectedCourse?.id) {
      navigate("/Learner/Dashboard");
      return;
    }

    const fetchModules = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!selectedCourse?.id) {
          console.error("Missing course data:", selectedCourse);
          setError(
            "No course selected. Please select a course from the dashboard."
          );
          setLoading(false);
          return;
        }

        const response = await getModulesByCourseId(selectedCourse.id);

        let modulesArray = Array.isArray(response)
          ? response
          : response?.modules || [];

        const modulesWithContents = await Promise.all(
          modulesArray.map(async (module) => {
            try {
              const moduleId = module.module_id || module.id;
              const contentsResponse = await getModuleContents(moduleId);

              return {
                id: moduleId,
                module_id: moduleId,
                title: module.name,
                description: module.description,
                resources: (contentsResponse?.contents || []).map(
                  (content) => ({
                    id: content.content_id || content.id,
                    title: content.name,
                    link: content.link,
                    content: content.link,
                  })
                ),
              };
            } catch (error) {
              console.error(
                `Error fetching contents for module ${module.id}:`,
                error
              );
              return {
                id: module.module_id || module.id,
                module_id: module.module_id || module.id,
                title: module.name,
                description: module.description,
                resources: [],
              };
            }
          })
        );

        setModules(modulesWithContents);
      } catch (error) {
        console.error("Error fetching modules:", error);
        setError("Failed to load modules. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
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

  useEffect(() => {
    const fetchAssessmentsAndSubmissions = async () => {
      if (!modules.length) return;

      try {
        const assessmentsByModule = {};
        let allSubmissions = {};

        for (const module of modules) {
          const assessmentsResponse = await getCourseAssessments(
            module.module_id,
            true
          );
          if (assessmentsResponse.success) {
            const moduleAssessments = assessmentsResponse.assessments.filter(
              (a) => a.module_id === module.module_id && a.is_published
            );
            assessmentsByModule[module.module_id] = moduleAssessments;

            for (const assessment of moduleAssessments) {
              const submissionResponse = await getUserSubmission(
                assessment.id,
                true
              );
              if (submissionResponse.success && submissionResponse.submission) {
                allSubmissions[assessment.id] = submissionResponse.submission;
              }
            }
          }
        }

        setModuleAssessments(assessmentsByModule);
        setSubmissions(allSubmissions);
      } catch (error) {
        console.error("Error fetching module assessments:", error);
        setError("Failed to load module data");
      }
    };

    fetchAssessmentsAndSubmissions();
  }, [modules]);

  const renderModule = (module, index) => {
    const isLocked = shouldLockModule(module);
    const color =
      moduleColors[
        Object.keys(moduleColors)[index % Object.keys(moduleColors).length]
      ];
    const resourceCount = module.resources?.length || 0;
    const hasResources = resourceCount > 0;

    return (
      <div
        key={module.module_id}
        className="bg-white shadow-sm overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Module Number Badge */}
            <div className="flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold text-white transform transition hover:scale-105"
                style={{ backgroundColor: color.bg }}
              >
                {index + 1}
              </div>
            </div>

            {/* Module Content */}
            <div className="flex-1 min-w-0">
              {/* Title and description are always visible */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">
                      {module.title}
                    </h3>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: color.light,
                        color: color.bg,
                      }}
                    >
                      {hasResources
                        ? `${resourceCount} Resources`
                        : "No Resources"}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {module.description}
                  </p>
                </div>
              </div>

              {/* Resources Section */}
              <div className="mt-4 rounded-lg">
                {isLocked ? (
                  <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Lock className="h-12 w-12 text-gray-400 mb-3" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Module Content Locked
                      </h4>
                      <p className="text-gray-600 max-w-md">
                        Get passing marks in the assessments in the previous
                        module to unlock this content
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: color.light }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4
                        className="text-sm font-medium"
                        style={{ color: color.bg }}
                      >
                        Learning Resources
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {module.resources && module.resources.length > 0 ? (
                        module.resources.map((resource) => (
                          <div
                            key={resource.id}
                            className="flex items-center bg-white p-3 rounded-lg group hover:shadow-md transition-all duration-200 border border-transparent hover:border-yellow-500"
                          >
                            <div
                              className="p-2 rounded-lg mr-3 transition-colors"
                              style={{
                                backgroundColor: `${color.bg}20`,
                                color: color.bg,
                              }}
                            >
                              <FileText size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <a
                                href={resource.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block truncate text-sm font-medium text-gray-900 group-hover:text-yellow-600"
                              >
                                {resource.title}
                              </a>
                              <p className="text-xs text-gray-500 truncate">
                                {resource.link}
                              </p>
                            </div>
                            <a
                              href={resource.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-400 hover:text-yellow-600 transition-colors rounded-full hover:bg-gray-50"
                              title="Open resource"
                            >
                              <ExternalLink size={16} />
                            </a>
                          </div>
                        ))
                      ) : (
                        <div
                          className="col-span-2 text-center py-8 bg-white rounded-lg border-2 border-dashed"
                          style={{ borderColor: `${color.bg}40` }}
                        >
                          <div className="mb-2">
                            <FileText
                              size={24}
                              className="mx-auto"
                              style={{ color: color.bg }}
                            />
                          </div>
                          <p className="text-sm text-gray-600">
                            No resources available yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />
        <div className="flex-1">
          <Header
            title={selectedCourse?.name || "Course Modules"}
            subtitle={selectedCourse?.code}
          />
          <MobileNavBar navItems={navItems} onLogout={logout} />
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-6">
          <Header
            title={selectedCourse?.name || "Course Modules"}
            subtitle={selectedCourse?.code}
          />
          <MobileNavBar navItems={navItems} onLogout={logout} />
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-red-500 mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {error}
            </h3>
            <button
              onClick={() => navigate("/Learner/Dashboard")}
              className="mt-4 px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529]"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && modules.length === 0) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-6">
          <Header
            title={selectedCourse?.name || "Course Modules"}
            subtitle={selectedCourse?.code}
          />
          <MobileNavBar navItems={navItems} onLogout={logout} />
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-full max-w-md text-center">
              <div className="mx-auto w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mb-6">
                <BookOpen size={40} className="text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Modules Available
              </h3>
              <p className="text-gray-500 mb-6">
                There are no learning modules available for this course yet. The
                teacher will add modules soon.
              </p>
              <button
                onClick={() => navigate("/Learner/Dashboard")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#212529] hover:bg-[#F6BA18] hover:text-[#212529]"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-auto">
        <Header
          title={selectedCourse?.name || "Course Modules"}
          subtitle={selectedCourse?.code}
        />
        <MobileNavBar navItems={navItems} onLogout={logout} />

        {!loading && !error && modules.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
            {modules.map((module, index) => renderModule(module, index))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnerCourseModules;
