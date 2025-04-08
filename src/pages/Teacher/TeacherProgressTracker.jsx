import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Megaphone, BookOpen, ClipboardList, User, LineChart, ChevronDown, ArrowLeft } from "lucide-react";
import Sidebar from "../../components/common/layout/Sidebar";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Header from "../../components/common/layout/Header";
import { useCourse } from "../../contexts/CourseContext";
import { getModulesByCourseId, getModuleGrade } from "../../services/moduleService";
import { getCourseAssessments, getAssessmentSubmissions, getSubmissionDetails } from "../../services/assessmentService";

const TeacherProgressTracker = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [modules, setModules] = useState([]);
  const [moduleAssessments, setModuleAssessments] = useState({});
  const [moduleGrades, setModuleGrades] = useState({});
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [error, setError] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [studentSubmissions, setStudentSubmissions] = useState({});
  const [expandedStudents, setExpandedStudents] = useState(new Set());
  const [studentCount, setStudentCount] = useState(0);
  const { selectedCourse: contextCourse } = useCourse();
  const navigate = useNavigate();

  const navItems = [
    { text: "Home", icon: <Home size={20} />, route: "/Teacher/Dashboard" },
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

  useEffect(() => {
    const fetchData = async () => {
      if (!contextCourse?.id) {
        navigate('/Teacher/Dashboard');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Store student count from the course
        setStudentCount(contextCourse.studentCount || 0);
        
        const modulesResponse = await getModulesByCourseId(contextCourse.id);
        if (!modulesResponse || !Array.isArray(modulesResponse)) {
          throw new Error("Failed to fetch modules");
        }

        const assessmentsByModule = {};
        const gradesByModule = {};
        const submissionsByAssessment = {};

        
      for (const module of modulesResponse) {
        try {
          const assessmentResponse = await getCourseAssessments(module.module_id, true);
          if (assessmentResponse.success) {
            assessmentsByModule[module.module_id] = assessmentResponse.assessments;
            
            // Fetch submissions for each assessment immediately
            for (const assessment of assessmentResponse.assessments) {
              try {
                const submissionsResponse = await getAssessmentSubmissions(assessment.id);
                if (submissionsResponse.success) {
                  const detailedSubmissions = await Promise.all(
                    submissionsResponse.submissions.map(async (sub) => {
                      try {
                        const detailsResponse = await getSubmissionDetails(sub.id);
                        if (detailsResponse.success && detailsResponse.submission) {
                          const scores = calculateSubmissionScore(detailsResponse.submission);
                          return {
                            id: sub.id,
                            student: {
                              name: `${detailsResponse.submission.user?.first_name || ''} ${detailsResponse.submission.user?.last_name || ''}`.trim(),
                              id: detailsResponse.submission.user?.id
                            },
                            status: areAllQuestionsGraded(detailsResponse.submission) ? 'graded' : 'Not Graded',
                            score: scores.total,
                            maxScore: scores.possible,
                            percentage: scores.possible > 0 ? ((scores.total / scores.possible) * 100).toFixed(1) : '0',
                            submit_time: sub.submit_time,
                            isLate: detailsResponse.submission.is_late,
                            fullSubmission: detailsResponse.submission
                          };
                        }
                      } catch (err) {
                        console.error(`Error fetching details for submission ${sub.id}:`, err);
                      }
                      return null;
                    })
                  );
                  submissionsByAssessment[assessment.id] = detailedSubmissions.filter(Boolean);
                }
              } catch (err) {
                console.warn(`Failed to fetch submissions for assessment ${assessment.id}:`, err);
                submissionsByAssessment[assessment.id] = [];
              }
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch assessments for module ${module.module_id}:`, err);
          assessmentsByModule[module.module_id] = [];
        }

        try {
          const gradeResponse = await getModuleGrade(module.module_id);
          gradesByModule[module.module_id] = gradeResponse;
        } catch (err) {
          console.warn(`Failed to fetch grades for module ${module.module_id}:`, err);
          gradesByModule[module.module_id] = null;
        }
      }

        setModules(modulesResponse);
        setModuleAssessments(assessmentsByModule);
        setModuleGrades(gradesByModule);
        setStudentSubmissions(submissionsByAssessment);
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contextCourse?.id, navigate]);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const toggleStudent = (studentId) => {
    setExpandedStudents(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const getSubmissionScoreClass = (score, passingScore) => {
    if (score === null || score === undefined) return 'text-gray-400';
    return score >= passingScore ? 'text-green-600' : 'text-red-600';
  };

  const calculateSubmissionScore = (submission) => {
    if (!submission?.answers) return { total: 0, possible: 0 };

    const totalAwarded = submission.answers.reduce((sum, answer) => {
      if (answer.points_awarded !== null && answer.points_awarded !== undefined) {
        return sum + (parseFloat(answer.points_awarded) || 0);
      }
      return sum;
    }, 0);

    const totalPossible = submission.assessment.questions.reduce((sum, question) => {
      return sum + (parseFloat(question.points) || 0);
    }, 0);

    return { total: totalAwarded, possible: totalPossible };
  };

  const areAllQuestionsGraded = (submission) => {
    if (!submission?.answers) return false;

    return submission.answers.every((answer) => {
      const hasPoints = answer.points_awarded !== null && answer.points_awarded !== undefined;
      const isAutoGraded = submission.assessment?.questions?.find(
        (q) => q.id === answer.question_id
      )?.question_type === "multiple_choice" ||
      submission.assessment?.questions?.find(
        (q) => q.id === answer.question_id
      )?.question_type === "true_false";

      return hasPoints || (isAutoGraded && answer.is_auto_graded);
    });
  };

  const fetchStudentSubmissions = async (assessment) => {
    try {
      const submissionsResponse = await getAssessmentSubmissions(assessment.id);
      if (submissionsResponse.success) {
        const detailedSubmissions = await Promise.all(
          submissionsResponse.submissions.map(async (sub) => {
            try {
              const detailsResponse = await getSubmissionDetails(sub.id);
              if (detailsResponse.success && detailsResponse.submission) {
                const scores = calculateSubmissionScore(detailsResponse.submission);
                const allGraded = areAllQuestionsGraded(detailsResponse.submission);

                return {
                  id: sub.id,
                  student: {
                    name: `${detailsResponse.submission.user?.first_name || ''} ${detailsResponse.submission.user?.last_name || ''}`.trim(),
                    id: detailsResponse.submission.user?.id
                  },
                  status: allGraded ? 'graded' : 'Not Graded',
                  score: scores.total,
                  maxScore: scores.possible,
                  percentage: scores.possible > 0 ? ((scores.total / scores.possible) * 100).toFixed(1) : '0',
                  submit_time: sub.submit_time,
                  isLate: detailsResponse.submission.is_late,
                  fullSubmission: detailsResponse.submission
                };
              }
            } catch (err) {
              console.error(`Error fetching details for submission ${sub.id}:`, err);
            }
            return null;
          })
        );

        setStudentSubmissions(prev => ({
          ...prev,
          [assessment.id]: detailedSubmissions.filter(Boolean)
        }));
      }
    } catch (err) {
      console.error("Error fetching student submissions:", err);
    }
  };

  const countUniqueSubmissions = (assessment) => {
    if (!assessment) return { submitted: 0, total: contextCourse?.studentCount || 0 };
    
    const assessmentSubmissions = studentSubmissions[assessment.id] || [];
    
    const uniqueStudents = new Set();
    assessmentSubmissions.forEach(submission => {
      if (submission.student?.id) {
        uniqueStudents.add(submission.student.id);
      }
    });

    return {
      submitted: uniqueStudents.size,
      total: contextCourse?.studentCount || 0
    };
  };

  const groupSubmissionsByStudent = (submissions) => {
    return submissions.reduce((acc, submission) => {
      const studentId = submission.student.id;
      if (!acc[studentId]) {
        acc[studentId] = {
          student: submission.student,
          submissions: []
        };
      }
      acc[studentId].submissions.push(submission);
      return acc;
    }, {});
  };

  const getTypeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case 'quiz':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'exam':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'assignment':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getScoreStyle = (score, passingScore, maxScore) => {
    if (score === null || score === undefined) return 'text-gray-400';
    const percentage = (score / maxScore) * 100;
    return percentage >= passingScore ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold';
  };

  const formatPassingPercentage = (passing, max) => {
    if (!passing || !max) return 'N/A';
    const percentage = (passing / max) * 100;
    return `${percentage.toFixed(1)}%`;
  };

  const calculateAverageScore = (submissions) => {
    if (!submissions || submissions.length === 0) return null;
    
    // Group submissions by student and get their best scores
    const studentBestScores = Object.values(
      submissions.reduce((acc, submission) => {
        const studentId = submission.student.id;
        if (!acc[studentId] || (submission.score / submission.maxScore) > (acc[studentId].score / acc[studentId].maxScore)) {
          acc[studentId] = {
            score: submission.score,
            maxScore: submission.maxScore
          };
        }
        return acc;
      }, {})
    );

    if (studentBestScores.length === 0) return null;

    // Calculate average using best scores
    const sum = studentBestScores.reduce((total, score) => {
      return total + ((score.score / score.maxScore) * 100);
    }, 0);

    return sum / studentBestScores.length;
  };

  const calculateModuleAverage = (moduleId) => {
    const assessments = moduleAssessments[moduleId] || [];
    if (!assessments.length) return null;

    // Get all submissions for all assessments in this module
    const moduleSubmissions = assessments.flatMap(assessment => 
      studentSubmissions[assessment.id] || []
    );

    // Group by student and get best scores per assessment
    const studentBestScores = {};
    
    moduleSubmissions.forEach(submission => {
      const studentId = submission.student.id;
      const assessmentId = submission.fullSubmission.assessment.id;
      
      if (!studentBestScores[studentId]) {
        studentBestScores[studentId] = {};
      }
      
      if (!studentBestScores[studentId][assessmentId] || 
          (submission.score / submission.maxScore) > 
          (studentBestScores[studentId][assessmentId].score / studentBestScores[studentId][assessmentId].maxScore)) {
        studentBestScores[studentId][assessmentId] = {
          score: submission.score,
          maxScore: submission.maxScore
        };
      }
    });

    // Calculate average for each student across their best assessment scores
    let totalAverage = 0;
    let studentCount = 0;

    Object.values(studentBestScores).forEach(studentScores => {
      const assessmentScores = Object.values(studentScores);
      if (assessmentScores.length > 0) {
        const studentAverage = assessmentScores.reduce((sum, score) => 
          sum + (score.score / score.maxScore * 100), 0) / assessmentScores.length;
        totalAverage += studentAverage;
        studentCount++;
      }
    });

    return studentCount > 0 ? totalAverage / studentCount : null;
  };

  const allStudentsPassed = (moduleId) => {
    const moduleAvg = calculateModuleAverage(moduleId);
    return moduleAvg !== null && moduleAvg >= 75; // assuming 75 is passing score
  };

  const renderStudentSubmissions = (assessment) => {
    const submissions = studentSubmissions[assessment.id] || [];
    const groupedSubmissions = groupSubmissionsByStudent(submissions);
    
    return (
      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-lg font-semibold">Student Submissions</h4>
          <button
            onClick={() => setSelectedAssessment(null)}
            className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
          >
            Close
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latest Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Best Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Submission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.values(groupedSubmissions).map((group) => {
                const latestSubmission = group.submissions[0];
                const bestSubmission = group.submissions.reduce((best, current) => {
                  if (!best.score || (current.score > best.score)) return current;
                  return best;
                }, group.submissions[0]);
                
                return (
                  <React.Fragment key={group.student.id}>
                    <tr 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleStudent(group.student.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform ${
                              expandedStudents.has(group.student.id) ? 'rotate-180' : ''
                            }`}
                          />
                          <span className="font-medium">{group.student.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          latestSubmission.status === 'graded' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {latestSubmission.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={getScoreStyle(
                          bestSubmission.score,
                          assessment.passing_score,
                          bestSubmission.maxScore
                        )}>
                          {bestSubmission.score}/{bestSubmission.maxScore}
                          <span className="ml-1 text-xs">
                            ({((bestSubmission.score / bestSubmission.maxScore) * 100).toFixed(1)}%)
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3">{group.submissions.length}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(latestSubmission.submit_time).toLocaleString()}
                      </td>
                    </tr>
                    
                    {expandedStudents.has(group.student.id) && (
                      <tr>
                        <td colSpan="5" className="px-4 py-3">
                          <div className="bg-gray-50 rounded-lg p-4 mt-2">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-3 py-2 text-xs text-gray-500">Attempt</th>
                                  <th className="px-3 py-2 text-xs text-gray-500">Score</th>
                                  <th className="px-3 py-2 text-xs text-gray-500">Status</th>
                                  <th className="px-3 py-2 text-xs text-gray-500">Submission Time</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {group.submissions.map((submission, index) => (
                                  <tr key={submission.id} className="text-sm">
                                    <td className="px-3 py-2">#{index + 1}</td>
                                    <td className="px-3 py-2">
                                      <span className={getSubmissionScoreClass(
                                        submission.score,
                                        assessment.passing_score
                                      )}>
                                        {submission.score}/{submission.maxScore}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        submission.status === 'graded' 
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {submission.status?.toUpperCase()}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-gray-500">
                                      {new Date(submission.submit_time).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderModuleProgress = () => (
    <div className="space-y-6">
      {modules.map(module => {
        const hasAssessments = moduleAssessments[module.module_id]?.length > 0;
        const hasSubmissions = hasAssessments && moduleAssessments[module.module_id].some(
          assessment => (studentSubmissions[assessment.id]?.length || 0) > 0
        );

        return (
          <div key={module.module_id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div 
              className="p-6 bg-gray-50 border-l-4 border-yellow-500 flex justify-between items-center cursor-pointer hover:bg-gray-100"
              onClick={() => toggleModule(module.module_id)}
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{module.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                {moduleGrades[module.module_id] && (
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {hasAssessments ? (
                        hasSubmissions ? (
                          `Average: ${calculateModuleAverage(module.module_id)?.toFixed(1)}%`
                        ) : 'No submissions yet'
                      ) : 'No assessments'
                    }
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      hasAssessments ? (
                        hasSubmissions ? (
                          allStudentsPassed(module.module_id)
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        ) : 'bg-gray-100 text-gray-600'
                      ) : 'bg-gray-100 text-gray-600'
                    }`}>
                      {hasAssessments ? (
                        hasSubmissions ? (
                          allStudentsPassed(module.module_id) ? 'All Passed' : 'Some Failed'
                        ) : 'Waiting for submissions'
                      ) : 'No assessments available'
                    }
                    </span>
                  </div>
                )}
              </div>
              <ChevronDown className={`w-6 h-6 text-gray-400 transform transition-transform duration-200 ${
                expandedModules.has(module.module_id) ? "rotate-180" : ""
              }`} />
            </div>

            {expandedModules.has(module.module_id) && (
              <div className="p-6">
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                  <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500">
                    <div>Assessment</div>
                    <div>Type</div>
                    <div>Due Date</div>
                    <div>Submissions</div>
                    <div>Average Score</div>
                    <div>Pass Rate</div>
                  </div>
                </div>

                {(moduleAssessments[module.module_id] || []).map(assessment => (
                  <div key={assessment.id} className="mb-6 last:mb-0">
                    <div className="grid grid-cols-6 gap-4 items-center hover:bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium text-gray-900">{assessment.title}</div>
                      <div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getTypeStyle(assessment.type)}`}>
                          {assessment.type?.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-gray-500">{new Date(assessment.due_date).toLocaleDateString()}</div>
                      <div className="text-gray-500">
                        {(() => {
                          const counts = countUniqueSubmissions(assessment);
                          return `${counts.submitted} / ${counts.total} ${counts.total === 1 ? "Learner" : "Learners"}`;
                        })()}
                      </div>
                      <div className={`${
                        calculateAverageScore(studentSubmissions[assessment.id]) === null 
                          ? 'text-gray-400' 
                          : getSubmissionScoreClass(
                              calculateAverageScore(studentSubmissions[assessment.id]),
                              assessment.passing_score
                            )
                      }`}>
                        {calculateAverageScore(studentSubmissions[assessment.id]) === null 
                          ? 'No submissions' 
                          : `${calculateAverageScore(studentSubmissions[assessment.id]).toFixed(1)}%`
                        }
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">
                          {formatPassingPercentage(assessment.passing_score, assessment.max_score)}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedAssessment(assessment);
                          }}
                          className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                        >
                          View Submissions
                        </button>
                      </div>
                    </div>
                    {selectedAssessment?.id === assessment.id && renderStudentSubmissions(assessment)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderHeader = () => (
    <div>
      <Header
        title={contextCourse?.name || "Progress Tracker"}
        subtitle={contextCourse?.code}
      />
      <div className="relative z-50">
        <MobileNavBar navItems={navItems} />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <div className="flex flex-1 h-[calc(100vh-32px)]">
        <div className="hidden lg:flex">
          <Sidebar navItems={navItems} />
        </div>

        <div className="flex-1 p-6 max-md:p-5 overflow-y-auto">
          {renderHeader()}

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">Error: {error}</div>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529]"
              >
                Retry
              </button>
            </div>
          ) : (
            renderModuleProgress()
          )}
        </div>

        <MobileNavBar navItems={navItems} />
      </div>
    </div>
  );
};

export default TeacherProgressTracker;
