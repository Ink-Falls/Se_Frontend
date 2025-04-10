import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Megaphone, BookOpen, ClipboardList, User, LineChart, ChevronDown, ArrowLeft, Award, BookCheck, AlertCircle, Users } from "lucide-react";
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

    const sum = studentBestScores.reduce((total, score) => {
      return total + ((score.score / score.maxScore) * 100);
    }, 0);

    return sum / studentBestScores.length;
  };

  const calculateModuleAverage = (moduleId) => {
    const assessments = moduleAssessments[moduleId] || [];
    if (!assessments.length) return null;

    const moduleSubmissions = assessments.flatMap(assessment => 
      studentSubmissions[assessment.id] || []
    );

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
    return moduleAvg !== null && moduleAvg >= 75;
  };

  const renderStatCards = () => {
    const totalAssessments = Object.values(moduleAssessments).flat().length;
    const totalSubmissions = Object.values(studentSubmissions).flat().length;
    
    const submissionRate = studentCount > 0 ? 
      (totalSubmissions / (totalAssessments * studentCount) * 100).toFixed(1) : 0;
    
    let totalScore = 0;
    let totalCount = 0;
    
    modules.forEach(module => {
      const moduleAvg = calculateModuleAverage(module.module_id);
      if (moduleAvg !== null) {
        totalScore += moduleAvg;
        totalCount++;
      }
    });
    
    const overallAverage = totalCount > 0 ? (totalScore / totalCount).toFixed(1) : 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-blue-800 text-sm font-medium mb-2">Modules</h3>
              <p className="text-3xl font-bold text-blue-900">{modules.length}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <BookOpen size={24} className="text-blue-700" />
            </div>
          </div>
          <p className="text-blue-600 text-xs mt-4">
            {modules.length === 1 ? '1 module' : `${modules.length} modules`} in this course
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-purple-800 text-sm font-medium mb-2">Assessments</h3>
              <p className="text-3xl font-bold text-purple-900">{totalAssessments}</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <ClipboardList size={24} className="text-purple-700" />
            </div>
          </div>
          <p className="text-purple-600 text-xs mt-4">
            {totalAssessments === 1 ? '1 assessment' : `${totalAssessments} assessments`} created
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-emerald-800 text-sm font-medium mb-2">Average Score</h3>
              <p className="text-3xl font-bold text-emerald-900">{overallAverage}%</p>
            </div>
            <div className="p-3 bg-emerald-200 rounded-lg">
              <Award size={24} className="text-emerald-700" />
            </div>
          </div>
          <p className="text-emerald-600 text-xs mt-4">
            Overall class average
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-amber-800 text-sm font-medium mb-2">Submission Rate</h3>
              <p className="text-3xl font-bold text-amber-900">{submissionRate}%</p>
            </div>
            <div className="p-3 bg-amber-200 rounded-lg">
              <Users size={24} className="text-amber-700" />
            </div>
          </div>
          <p className="text-amber-600 text-xs mt-4">
            {studentCount} {studentCount === 1 ? 'learner' : 'learners'} enrolled
          </p>
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
        const moduleAverage = calculateModuleAverage(module.module_id);
        const passedModuleStatus = allStudentsPassed(module.module_id);

        return (
          <div key={module.module_id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div 
              className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between items-center ${
                expandedModules.has(module.module_id) ? 'border-b border-gray-200' : ''
              }`}
              onClick={() => toggleModule(module.module_id)}
            >
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      passedModuleStatus ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {passedModuleStatus ? (
                        <BookCheck size={24} />
                      ) : (
                        <AlertCircle size={24} />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{module.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-3 ml-16">
                  <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {moduleAssessments[module.module_id]?.length || 0} Assessments
                  </span>
                  
                  {moduleAverage !== null && (
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      moduleAverage >= 75
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Average: {moduleAverage.toFixed(1)}%
                    </span>
                  )}
                  
                  {hasSubmissions && (
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      passedModuleStatus
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {passedModuleStatus ? 'All Passed' : 'Some Failed'}
                    </span>
                  )}
                </div>
              </div>
              
              <ChevronDown className={`w-6 h-6 text-gray-400 transform transition-transform duration-200 ${
                expandedModules.has(module.module_id) ? "rotate-180" : ""
              }`} />
            </div>

            {expandedModules.has(module.module_id) && (
              <div className="p-6 bg-gray-50">
                {moduleAssessments[module.module_id]?.length === 0 ? (
                  <div className="text-center p-8 bg-white rounded-lg border-2 border-dashed border-gray-200">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Assessments</h3>
                    <p className="text-gray-500">This module doesn't have any assessments yet.</p>
                  </div>
                ) : (
                  <div>
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
                      <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500">
                        <div>Assessment</div>
                        <div>Type</div>
                        <div>Due Date</div>
                        <div>Submissions</div>
                        <div>Average Score</div>
                        <div>Pass Rate</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {(moduleAssessments[module.module_id] || []).map(assessment => (
                        <div key={assessment.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all">
                          <div 
                            className="grid grid-cols-6 gap-4 items-center p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              if (selectedAssessment?.id === assessment.id) {
                                setSelectedAssessment(null);
                              } else {
                                setSelectedAssessment(assessment);
                              }
                            }}
                          >
                            <div className="font-medium text-gray-900">
                              <div className="flex items-center">
                                <ChevronDown 
                                  className={`w-4 h-4 mr-2 text-gray-400 transform transition-transform duration-200 ${
                                    selectedAssessment?.id === assessment.id ? "rotate-180" : ""
                                  }`} 
                                />
                                {assessment.title}
                              </div>
                            </div>
                            <div>
                              <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getTypeStyle(assessment.type)}`}>
                                {assessment.type?.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-gray-600 text-sm">
                              {new Date(assessment.due_date).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div>
                              {(() => {
                                const counts = countUniqueSubmissions(assessment);
                                const submissionRate = (counts.submitted / Math.max(1, counts.total)) * 100;
                                return (
                                  <div className="flex items-center">
                                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                      <div 
                                        className="bg-blue-500 h-2 rounded-full" 
                                        style={{width: `${submissionRate}%`}}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-600">
                                      {counts.submitted}/{counts.total}
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                            <div>
                              <span className={`font-medium ${
                                calculateAverageScore(studentSubmissions[assessment.id]) === null 
                                  ? 'text-gray-400' 
                                  : getSubmissionScoreClass(
                                      calculateAverageScore(studentSubmissions[assessment.id]),
                                      assessment.passing_score
                                    )
                              }`}>
                                {calculateAverageScore(studentSubmissions[assessment.id]) === null 
                                  ? '-' 
                                  : `${calculateAverageScore(studentSubmissions[assessment.id]).toFixed(1)}%`
                                }
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 text-sm">
                                {formatPassingPercentage(assessment.passing_score, assessment.max_score)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAssessment(
                                    selectedAssessment?.id === assessment.id ? null : assessment
                                  );
                                }}
                                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                              >
                                {selectedAssessment?.id === assessment.id ? "Hide" : "View"} Details
                              </button>
                            </div>
                          </div>
                          
                          {selectedAssessment?.id === assessment.id && (
                            <div className="border-t border-gray-200">
                              {renderStudentSubmissions(assessment)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderStudentSubmissions = (assessment) => {
    const submissions = studentSubmissions[assessment.id] || [];
    const groupedSubmissions = groupSubmissionsByStudent(submissions);
    
    return (
      <div className="p-6 bg-gray-50">
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Student Submissions</h4>
          <p className="text-sm text-gray-600">
            Review individual student performance for {assessment.title}
          </p>
        </div>
        
        {submissions.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg border-2 border-dashed border-gray-200">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Submissions</h3>
            <p className="text-gray-500">No students have submitted this assessment yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latest Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Best Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Submission</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(groupedSubmissions).length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No submissions found
                    </td>
                  </tr>
                ) : (
                  Object.values(groupedSubmissions).map((group) => {
                    const latestSubmission = group.submissions[0];
                    const bestSubmission = group.submissions.reduce((best, current) => {
                      if (!best.score || (current.score > best.score)) return current;
                      return best;
                    }, group.submissions[0]);
                    
                    const scorePercentage = (bestSubmission.score / bestSubmission.maxScore) * 100;
                    const isPassingScore = scorePercentage >= assessment.passing_score;
                    
                    return (
                      <React.Fragment key={group.student.id}>
                        <tr 
                          className={`hover:bg-gray-50 cursor-pointer ${
                            expandedStudents.has(group.student.id) ? 'bg-gray-50' : ''
                          }`}
                          onClick={() => toggleStudent(group.student.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <ChevronDown 
                                className={`w-4 h-4 mr-2 text-gray-400 transform transition-transform duration-200 ${
                                  expandedStudents.has(group.student.id) ? "rotate-180" : ""
                                }`}
                              />
                              <div className="font-medium text-gray-900">{group.student.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              latestSubmission.status === 'graded' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {latestSubmission.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="mr-2">
                                <span className={getScoreStyle(
                                  bestSubmission.score,
                                  assessment.passing_score,
                                  bestSubmission.maxScore
                                )}>
                                  {bestSubmission.score}/{bestSubmission.maxScore}
                                </span>
                              </div>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${isPassingScore ? 'bg-green-500' : 'bg-red-500'}`} 
                                  style={{width: `${scorePercentage}%`}}
                                ></div>
                              </div>
                              <span className="ml-2 text-xs text-gray-500">
                                ({scorePercentage.toFixed(1)}%)
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {group.submissions.length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(latestSubmission.submit_time).toLocaleString()}
                          </td>
                        </tr>
                        
                        {expandedStudents.has(group.student.id) && (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 bg-gray-50">
                              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                  <h5 className="text-sm font-medium text-gray-700">
                                    Submission History - {group.student.name}
                                  </h5>
                                </div>
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Attempt</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submission Time</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {group.submissions.map((submission, index) => {
                                      const submissionPercentage = (submission.score / submission.maxScore) * 100;
                                      const isPassed = submissionPercentage >= assessment.passing_score;
                                      
                                      return (
                                        <tr key={submission.id} className="hover:bg-gray-50">
                                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            #{index + 1}
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                              <span className={getSubmissionScoreClass(
                                                submission.score,
                                                assessment.passing_score
                                              )}>
                                                {submission.score}/{submission.maxScore}
                                              </span>
                                              <div className="ml-2 w-12 bg-gray-200 rounded-full h-1.5">
                                                <div 
                                                  className={`h-1.5 rounded-full ${isPassed ? 'bg-green-500' : 'bg-red-500'}`} 
                                                  style={{width: `${submissionPercentage}%`}}
                                                ></div>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                              submission.status === 'graded' 
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                              {submission.status?.toUpperCase()}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(submission.submit_time).toLocaleString()}
                                            {submission.isLate && 
                                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                LATE
                                              </span>
                                            }
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

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
            <div className="flex items-center justify-center h-[60vh]">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 h-[60vh]">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Progress Data</h3>
              <p className="text-gray-600 text-center mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {renderStatCards()}
              {renderModuleProgress()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherProgressTracker;
