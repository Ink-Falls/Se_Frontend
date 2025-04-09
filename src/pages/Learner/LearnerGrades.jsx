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
} from "lucide-react";
import { useCourse } from "../../contexts/CourseContext";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import { getModulesByCourseId, getModuleGrade } from "../../services/moduleService";
import { getCourseAssessments, getUserSubmission } from "../../services/assessmentService";

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
            <span className="text-yellow-600 font-medium text-sm">Pending Grade</span>
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
              <span className="text-base text-gray-500">
                /{totalPoints}
              </span>
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
                Need {(assessment.passing_score - percentage).toFixed(1)}% more to pass
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
                assessment.module_id === module.module_id && assessment.is_published
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
                        (sum, answer) => sum + (parseInt(answer.points_awarded) || 0),
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
          lowestScore: lowestScorePercentage === 100 ? 0 : lowestScorePercentage,
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
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white mb-8">
      <div className="flex items-center justify-between">
        <Award className="w-8 h-8 opacity-75" />
        <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
          Grade Summary
        </span>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold">{overallStats.averageScore.toFixed(1)}%</div>
        <div className="text-sm opacity-75">Average Score</div>
      </div>
    </div>
  );

  const renderModuleGrades = () => (
    <div className="space-y-6">
      {modules.map((module, index) => {
        const moduleAssessmentList = moduleAssessments[module.module_id] || [];

        const completedAssessments = moduleAssessmentList.filter((assessment) => {
          const sub = submissions[assessment.id];
          return sub && (sub.status === "graded" || sub.status === "submitted");
        });

        const gradedAssessments = moduleAssessmentList.filter(
          (assessment) => submissions[assessment.id]?.status === "graded"
        );

        const moduleAverage =
          gradedAssessments.length > 0
            ? gradedAssessments.reduce((acc, assessment) => {
                const submission = submissions[assessment.id];
                if (submission && submission.status === "graded") {
                  return acc + (submission.percentage || 0);
                }
                return acc;
              }, 0) / gradedAssessments.length
            : 0;

        return (
          <div
            key={module.module_id}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="p-6 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {module.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                  <div className="text-lg font-bold text-gray-800 mt-2">
                    Average: {moduleAverage.toFixed(1)}%
                    {gradedAssessments.length === 0 && <span className="text-sm text-gray-500 ml-2">(No graded assessments yet)</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base text-gray-500">
                    {completedAssessments.length} of {moduleAssessmentList.length} completed
                  </div>
                </div>
              </div>

              {moduleAssessmentList.length > 0 && (
                <div className="mt-6 space-y-4">
                  {moduleAssessmentList.map((assessment) => {
                    const submission = submissions[assessment.id];
                    const status = getStatus(submission);

                    return (
                      <div
                        key={assessment.id}
                        className="bg-gray-50 p-4 rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">
                              {assessment.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  status
                                )}`}
                              >
                                {status}
                              </span>
                              <span className="text-sm text-gray-600">
                                Passing: {assessment.passing_score}/{assessment.max_score}
                              </span>
                            </div>
                          </div>
                          <div>{renderSubmissionScore(submission, assessment)}</div>
                        </div>
                      </div>
                    );
                  })}
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{error}</h3>
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
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-auto">
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
