import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
  GraduationCap,
  ChevronDown,
  Award,
  AlertTriangle,
  Users,
  CheckCircle,
  Target,
} from "lucide-react";
import { useCourse } from "../../contexts/CourseContext";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import {
  getModulesByCourseId,
  getModuleGrade,
} from "../../services/moduleService";
import {
  getCourseAssessments,
  getUserSubmission,
} from "../../services/assessmentService";

const LearnerGrades = () => {
  const { selectedCourse } = useCourse();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modules, setModules] = useState([]);
  const [moduleGrades, setModuleGrades] = useState({});
  const [assessments, setAssessments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [moduleAssessments, setModuleAssessments] = useState({});
  const [overallStats, setOverallStats] = useState({
    totalAssessments: 0,
    completedAssessments: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 100,
    passingRate: 0,
  });

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

  const calculateScorePercentage = (score, maxScore) => {
    if (!maxScore) return 0;
    return (score / maxScore) * 100;
  };

  const calculateTotalPoints = (submission) => {
    if (!submission?.assessment?.questions) return 0;
    return submission.assessment.questions.reduce(
      (sum, question) => sum + (parseInt(question.points) || 0),
      0
    );
  };

  const getStatus = (submission) => {
    if (!submission) return "Not Started";

    if (submission.status === "graded") {
      return submission.is_late ? "Graded (Late)" : "Graded";
    }

    if (submission.status === "submitted") {
      return submission.is_late ? "Submitted (Late)" : "Submitted";
    }

    if (submission.is_late) return "Late";

    return (
      submission.status?.charAt(0).toUpperCase() +
        submission.status?.slice(1) || "Not Started"
    );
  };

  const getStatusColor = (status) => {
    if (status.includes("Graded")) {
      return "bg-green-100 text-green-800";
    }

    if (status.includes("Submitted")) {
      return "bg-yellow-100 text-yellow-800";
    }

    switch (status?.toLowerCase()) {
      case "late":
        return "bg-red-100 text-red-800";
      case "not started":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const renderSubmissionScore = (submission, assessment) => {
    if (!submission || !submission.status || submission.status === "null") {
      return <div className="text-sm text-gray-600">Not Started</div>;
    }

    if (submission.status === "submitted") {
      return (
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600 font-medium text-sm">
              Pending Grade
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Submitted for review</div>
        </div>
      );
    }

    if (submission.status === "graded") {
      const totalPoints = calculateTotalPoints(submission);
      const score =
        submission.answers?.reduce((sum, answer) => {
          return sum + (parseInt(answer.points_awarded) || 0);
        }, 0) || 0;

      const percentage = (score / totalPoints) * 100;
      const isPassed = percentage >= assessment.passing_score;

      return (
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-baseline">
              <span
                className={`text-lg font-bold ${
                  isPassed ? "text-green-600" : "text-red-600"
                }`}
              >
                {score}
              </span>
              <span className="text-base text-gray-500">/{totalPoints}</span>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isPassed
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isPassed ? "Passed" : "Failed"}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {isPassed ? (
              <span>Passed ({percentage.toFixed(1)}%)</span>
            ) : (
              <span>
                Need {(assessment.passing_score - percentage).toFixed(1)}% more
                to pass
              </span>
            )}
          </div>
        </div>
      );
    }

    return <div className="text-sm text-gray-600">{getStatus(submission)}</div>;
  };

  useEffect(() => {
    if (!selectedCourse?.id) {
      navigate("/Learner/Dashboard");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const modulesResponse = await getModulesByCourseId(selectedCourse.id);

        if (!modulesResponse) {
          throw new Error("Failed to fetch modules data");
        }

        setModules(modulesResponse);

        let allAssessments = [];
        let allSubmissions = {};
        let totalScorePercentage = 0;
        let completedCount = 0;
        let highestScorePercentage = 0;
        let lowestScorePercentage = 100;

        const assessmentsByModule = {};

        for (const module of modulesResponse) {
          const gradeResponse = await getModuleGrade(module.module_id);
          setModuleGrades((prev) => ({
            ...prev,
            [module.module_id]: gradeResponse,
          }));

          const assessmentsResponse = await getCourseAssessments(
            module.module_id,
            true
          );

          if (assessmentsResponse.success && assessmentsResponse.assessments) {
            const moduleAssessments = assessmentsResponse.assessments.filter(
              (assessment) =>
                assessment.module_id === module.module_id &&
                assessment.is_published
            );

            if (moduleAssessments.length > 0) {
              assessmentsByModule[module.module_id] = moduleAssessments;
              allAssessments = [...allAssessments, ...moduleAssessments];

              for (const assessment of moduleAssessments) {
                try {
                  const submissionData = await getUserSubmission(
                    assessment.id,
                    true
                  );
                  if (submissionData.success && submissionData.submission) {
                    const submission = submissionData.submission;
                    submission.assessment = assessment;

                    let score = 0;
                    let scorePercentage = 0;

                    if (submission.status === "graded" && submission.answers) {
                      score = submission.answers.reduce(
                        (sum, answer) =>
                          sum + (parseInt(answer.points_awarded) || 0),
                        0
                      );

                      const totalPoints =
                        assessment.questions?.reduce(
                          (sum, q) => sum + (parseInt(q.points) || 0),
                          0
                        ) || assessment.max_score;

                      scorePercentage = (score / totalPoints) * 100;

                      totalScorePercentage += scorePercentage;
                      completedCount++;

                      highestScorePercentage = Math.max(
                        highestScorePercentage,
                        scorePercentage
                      );
                      lowestScorePercentage = Math.min(
                        lowestScorePercentage,
                        scorePercentage
                      );
                    }

                    allSubmissions[assessment.id] = {
                      ...submission,
                      total_score: score,
                      percentage: scorePercentage,
                      max_score: assessment.max_score,
                      isPassed: scorePercentage >= assessment.passing_score,
                    };
                  }
                } catch (err) {
                  console.error(
                    `Error fetching submission for assessment ${assessment.id}:`,
                    err
                  );
                }
              }
            } else {
              assessmentsByModule[module.module_id] = [];
            }
          }
        }

        setAssessments(allAssessments);
        setSubmissions(allSubmissions);
        setModuleAssessments(assessmentsByModule);

        const averageScore =
          completedCount > 0 ? totalScorePercentage / completedCount : 0;

        const completedSubmissions = Object.values(allSubmissions).filter(
          (submission) =>
            submission.status === "graded" || submission.status === "submitted"
        );

        const passingCount = Object.values(allSubmissions).filter(
          (submission) => submission.status === "graded" && submission.isPassed
        ).length;

        const passingRate =
          completedCount > 0 ? (passingCount / completedCount) * 100 : 0;

        setOverallStats({
          totalAssessments: allAssessments.length,
          completedAssessments: completedSubmissions.length,
          averageScore: averageScore,
          highestScore: highestScorePercentage,
          lowestScore:
            lowestScorePercentage === 100 ? 0 : lowestScorePercentage,
          passingRate: passingRate,
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load grades. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCourse, navigate]);

  const renderStatistics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-blue-800 text-sm font-medium mb-2">
              Overall Average
            </h3>
            <p className="text-3xl font-bold text-blue-900">
              {overallStats.averageScore.toFixed(1)}%
            </p>
          </div>
          <div className="p-3 bg-blue-200 rounded-lg">
            <Award size={24} className="text-blue-700" />
          </div>
        </div>
        <p className="text-blue-600 text-xs mt-4">
          Your academic performance score
        </p>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-emerald-800 text-sm font-medium mb-2">
              Success Rate
            </h3>
            <p className="text-3xl font-bold text-emerald-900">
              {overallStats.passingRate.toFixed(1)}%
            </p>
          </div>
          <div className="p-3 bg-emerald-200 rounded-lg">
            <CheckCircle size={24} className="text-emerald-700" />
          </div>
        </div>
        <p className="text-emerald-600 text-xs mt-4">
          Percentage of assessments passed
        </p>
      </div>

      <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-rose-800 text-sm font-medium mb-2">
              Completed Tasks
            </h3>
            <p className="text-3xl font-bold text-rose-900">
              {overallStats.completedAssessments}/
              {overallStats.totalAssessments}
            </p>
          </div>
          <div className="p-3 bg-rose-200 rounded-lg">
            <Target size={24} className="text-rose-700" />
          </div>
        </div>
        <p className="text-rose-600 text-xs mt-4">
          Assessment completion progress
        </p>
      </div>

      <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-violet-800 text-sm font-medium mb-2">
              Completion Rate
            </h3>
            <p className="text-3xl font-bold text-violet-900">
              {(
                (overallStats.completedAssessments /
                  Math.max(overallStats.totalAssessments, 1)) *
                100
              ).toFixed(0)}
              %
            </p>
          </div>
          <div className="p-3 bg-violet-200 rounded-lg">
            <Users size={24} className="text-violet-700" />
          </div>
        </div>
        <p className="text-violet-600 text-xs mt-4">
          Progress toward course completion
        </p>
      </div>
    </div>
  );

  const renderModuleGrades = () => (
    <div className="space-y-12">
      {modules.map((module) => {
        const moduleAssessmentList = moduleAssessments[module.module_id] || [];
        const completedAssessments = moduleAssessmentList.filter(
          (assessment) =>
            submissions[assessment.id]?.status === "graded" ||
            submissions[assessment.id]?.status === "submitted"
        );
        const gradedAssessments = moduleAssessmentList.filter(
          (assessment) => submissions[assessment.id]?.status === "graded"
        );
        const moduleAverage =
          gradedAssessments.length > 0
            ? gradedAssessments.reduce((acc, assessment) => {
                const submission = submissions[assessment.id];
                return submission?.status === "graded"
                  ? acc + (submission.percentage || 0)
                  : acc;
              }, 0) / gradedAssessments.length
            : 0;

        return (
          <div
            key={module.module_id}
            className="relative bg-gradient-to-b from-white to-gray-50/50 rounded-2xl overflow-hidden"
          >
            {/* Decorative Elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
            <div className="absolute right-0 top-0 h-64 w-64 transform translate-x-32 -translate-y-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />

            <div className="relative">
              {/* Module Header */}
              <div className="p-8 pb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      {module.name}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium inline-flex items-center">
                        <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2" />
                        {completedAssessments.length}/
                        {moduleAssessmentList.length} Completed
                      </span>
                      <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium inline-flex items-center">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2" />
                        {
                          gradedAssessments.filter(
                            (a) => submissions[a.id]?.isPassed
                          ).length
                        }{" "}
                        Passed
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      {moduleAverage.toFixed(1)}%
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      Module Average
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessments List */}
              {moduleAssessmentList.length > 0 && (
                <div className="px-8 pb-8">
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl divide-y divide-gray-100 border border-gray-100">
                    {moduleAssessmentList.map((assessment) => {
                      const submission = submissions[assessment.id];
                      const status = getStatus(submission);
                      return (
                        <div
                          key={assessment.id}
                          className="p-4 hover:bg-white transition-colors duration-200"
                        >
                          <div className="flex items-center gap-6">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {assessment.title}
                                </h4>
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center ${getStatusColor(
                                    status
                                  )}`}
                                >
                                  {status}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                <span>
                                  Score to Pass: {assessment.passing_score}
                                </span>
                                <span>•</span>
                                <span>Max Score: {assessment.max_score}</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              {renderSubmissionScore(submission, assessment)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />
        <div className="flex-1">
          <Header
            title={selectedCourse?.name || "Grades"}
            subtitle={selectedCourse?.code}
          />
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
        <div className="flex-1">
          <Header
            title={selectedCourse?.name || "Grades"}
            subtitle={selectedCourse?.code}
          />
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {error}
            </h3>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529]"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-8 overflow-auto">
        <Header
          title={selectedCourse?.name || "Grades"}
          subtitle={selectedCourse?.code}
        />
        <MobileNavBar navItems={navItems} />

        {renderStatistics()}
        {renderModuleGrades()}
      </div>
    </div>
  );
};

export default LearnerGrades;
