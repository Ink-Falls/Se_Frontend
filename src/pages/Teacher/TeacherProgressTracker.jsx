import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  Megaphone, 
  BookOpen, 
  ClipboardList, 
  User, 
  LineChart, 
  ChevronDown, 
  Filter,
  Users,
  Search,
  AlertCircle,
  BarChart,
  TrendingUp,
  Eye,
  EyeOff
} from "lucide-react";
import Sidebar from "../../components/common/layout/Sidebar";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Header from "../../components/common/layout/Header";
import { useCourse } from "../../contexts/CourseContext";
import { getModulesByCourseId, getModuleGrade } from "../../services/moduleService";
import { getCourseAssessments, getAssessmentSubmissions, getSubmissionDetails } from "../../services/assessmentService";
import { getLearnerRoster } from "../../services/attendanceService";
import PerformanceVisualization from "../../components/specific/performance/PerformanceVisualization";
import PerformanceTrendChart from "../../components/specific/performance/PerformanceTrendChart";

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
  const [studentData, setStudentData] = useState({});
  const [expandedStudentModules, setExpandedStudentModules] = useState({});
  const { selectedCourse: contextCourse } = useCourse();
  const navigate = useNavigate();

  const [lateScorePreferences, setLateScorePreferences] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [studentStats, setStudentStats] = useState({});
  const [showPerformanceGraph, setShowPerformanceGraph] = useState(false);
  const [performanceTrendData, setPerformanceTrendData] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

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
        
        const learnerRoster = await getLearnerRoster(contextCourse.id);
        if (!learnerRoster || !Array.isArray(learnerRoster)) {
          throw new Error("Failed to fetch student roster");
        }
        
        const studentSubmissionsMap = {};
        const allSubmissions = [];
        
        learnerRoster.forEach(student => {
          studentSubmissionsMap[student.id] = {
            student: {
              id: student.id,
              name: student.name,
              email: student.email
            },
            modules: {}
          };
        });
        
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
              const moduleAssessments = assessmentResponse.assessments;
              assessmentsByModule[module.module_id] = moduleAssessments;
              
              learnerRoster.forEach(student => {
                if (!studentSubmissionsMap[student.id].modules[module.module_id]) {
                  studentSubmissionsMap[student.id].modules[module.module_id] = {
                    moduleId: module.module_id,
                    moduleName: module.name,
                    assessments: {}
                  };
                }
                
                moduleAssessments.forEach(assessment => {
                  studentSubmissionsMap[student.id].modules[module.module_id].assessments[assessment.id] = {
                    assessment,
                    submissions: []
                  };
                });
              });
              
              for (const assessment of moduleAssessments) {
                try {
                  const submissionsResponse = await getAssessmentSubmissions(assessment.id);
                  
                  if (submissionsResponse.success) {
                    const processedSubmissions = await Promise.all(
                      submissionsResponse.submissions.map(async (sub) => {
                        try {
                          const detailsResponse = await getSubmissionDetails(sub.id);
                          
                          if (detailsResponse.success && detailsResponse.submission) {
                            const submissionData = detailsResponse.submission;
                            const studentId = submissionData.user?.id;
                            
                            if (!studentId) return null;
                            
                            const scores = calculateSubmissionScore(submissionData);
                            const isGraded = areAllQuestionsGraded(submissionData);
                            
                            const submission = {
                              id: sub.id,
                              student: {
                                id: studentId,
                                name: `${submissionData.user?.first_name || ''} ${submissionData.user?.last_name || ''}`.trim()
                              },
                              moduleId: module.module_id,
                              moduleName: module.name,
                              assessmentId: assessment.id,
                              assessmentTitle: assessment.title,
                              assessment: assessment,
                              status: isGraded ? 'graded' : 'Not Graded',
                              score: scores.total,
                              maxScore: scores.possible,
                              percentage: scores.percentage,
                              submit_time: sub.submit_time,
                              isLate: submissionData.is_late,
                              fullSubmission: submissionData,
                              answers: submissionData.answers || []
                            };
                            
                            allSubmissions.push(submission);
                            return submission;
                          }
                        } catch (err) {
                          console.error(`Error processing submission ${sub.id}:`, err);
                        }
                        return null;
                      })
                    );
                    
                    const validSubmissions = processedSubmissions.filter(Boolean);
                    submissionsByAssessment[assessment.id] = validSubmissions;

                    validSubmissions.forEach(submission => {
                      const studentId = submission.student?.id;
                      if (studentId && studentSubmissionsMap[studentId]) {
                        const moduleId = submission.moduleId;
                        
                        if (!studentSubmissionsMap[studentId].modules[moduleId]?.assessments[assessment.id]) {
                          if (!studentSubmissionsMap[studentId].modules[moduleId]) {
                            studentSubmissionsMap[studentId].modules[moduleId] = {
                              moduleId: moduleId,
                              moduleName: module.name,
                              assessments: {}
                            };
                          }
                          
                          studentSubmissionsMap[studentId].modules[moduleId].assessments[assessment.id] = {
                            assessment: assessment,
                            submissions: []
                          };
                        }
                        
                        studentSubmissionsMap[studentId].modules[moduleId].assessments[assessment.id].submissions.push(submission);
                      }
                    });
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
        setStudentData(studentSubmissionsMap);
        setStudents(learnerRoster);
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contextCourse?.id, navigate]);

  useEffect(() => {
    if (expandedStudentModules && Object.keys(expandedStudentModules).length > 0) {
      setExpandedStudentModules(prev => ({...prev}));
    }
  }, [lateScorePreferences]);

  useEffect(() => {
    if (!students.length || Object.keys(studentSubmissions).length === 0) return;
    
    const allAssessments = [];
    const assessmentDates = {};
    
    Object.values(moduleAssessments).forEach(moduleAsm => {
      moduleAsm.forEach(assessment => {
        allAssessments.push({
          id: assessment.id,
          title: assessment.title,
          moduleId: assessment.module_id,
          dueDate: new Date(assessment.due_date || new Date())
        });
        assessmentDates[assessment.id] = assessment.due_date;
      });
    });
    
    const sortedAssessments = allAssessments.sort((a, b) => {
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
    
    const scoreMatrix = {};
    
    students.forEach(student => {
      scoreMatrix[student.id] = sortedAssessments.map(assessment => {
        const bestSubmission = findBestSubmission(
          student.id,
          assessment.id,
          Object.values(studentSubmissions).flat()
        );
        
        return bestSubmission ? parseFloat(bestSubmission.percentage) : 0;
      });
    });
    
    setPerformanceTrendData({
      students,
      assessments: sortedAssessments,
      scoreMatrix
    });
  }, [students, moduleAssessments, studentSubmissions]);

  const calculateSubmissionScore = (submission) => {
    if (!submission?.answers || !Array.isArray(submission.answers)) {
      return { total: 0, possible: 0, percentage: 0 };
    }
    
    const total = submission.answers.reduce((sum, answer) => {
      return sum + (parseFloat(answer.points_awarded) || 0);
    }, 0);
    
    const possible = submission.answers.reduce((sum, answer) => {
      return sum + (parseFloat(answer.question?.points) || 0);
    }, 0);
    
    const percentage = possible > 0 ? (total / possible) * 100 : 0;
    
    return {
      total: parseFloat(total),
      possible: parseFloat(possible),
      percentage: parseFloat(percentage.toFixed(1))
    };
  };

  const areAllQuestionsGraded = (submission) => {
    if (!submission?.answers || !Array.isArray(submission.answers)) return false;
    
    return submission.answers.every(answer => 
      answer.points_awarded !== null && answer.points_awarded !== undefined
    );
  };

  const findBestSubmission = (studentId, assessmentId, allSubmissions) => {
    if (!studentId || !assessmentId || !allSubmissions) return null;
    
    const studentSubmissions = allSubmissions.filter(
      sub => sub.student?.id === studentId && sub.assessmentId === assessmentId
    );
    
    if (!studentSubmissions || studentSubmissions.length === 0) return null;
    
    const allSubmissionsAreLate = studentSubmissions.every(sub => sub.isLate);
    const hasLateSubmissions = studentSubmissions.some(sub => sub.isLate);
    const hasOnTimeSubmissions = studentSubmissions.some(sub => !sub.isLate);
    
    if (lateScorePreferences[assessmentId] || (allSubmissionsAreLate && hasLateSubmissions)) {
      const lateSubmissions = studentSubmissions.filter(sub => sub.isLate);
      if (lateSubmissions.length > 0) {
        return lateSubmissions.sort((a, b) => {
          const scoreA = parseFloat(a.percentage) || 0;
          const scoreB = parseFloat(b.percentage) || 0;
          return scoreB - scoreA;
        })[0];
      }
    }

    if (!lateScorePreferences[assessmentId] && hasOnTimeSubmissions) {
      const onTimeSubmissions = studentSubmissions.filter(sub => !sub.isLate);
      const gradedOnTimeSubmissions = onTimeSubmissions.filter(sub => 
        sub.status === 'graded' || 
        (sub.fullSubmission && areAllQuestionsGraded(sub.fullSubmission))
      );
      
      if (gradedOnTimeSubmissions.length > 0) {
        return gradedOnTimeSubmissions.sort((a, b) => {
          const scoreA = parseFloat(a.percentage) || 0;
          const scoreB = parseFloat(b.percentage) || 0;
          return scoreB - scoreA;
        })[0];
      }
      
      if (onTimeSubmissions.length > 0) {
        return onTimeSubmissions.sort((a, b) => {
          const scoreA = parseFloat(a.percentage) || 0;
          const scoreB = parseFloat(b.percentage) || 0;
          return scoreB - scoreA;
        })[0];
      }
    }
    
    return studentSubmissions.sort((a, b) => {
      const scoreA = parseFloat(a.percentage) || 0;
      const scoreB = parseFloat(b.percentage) || 0;
      return scoreB - scoreA;
    })[0];
  };

  const toggleStudentModule = (studentId, moduleId) => {
    setExpandedStudentModules(prev => {
      const next = {...prev};
      const key = `${studentId}-${moduleId}`;
      next[key] = !next[key];
      return next;
    });
  };

  const calculateModuleAverage = (moduleId, studentId = null) => {
    let totalScore = 0;
    let submissionCount = 0;
    
    const assessmentsInModule = moduleAssessments[moduleId] || [];
    
    const studentsToProcess = studentId 
      ? [studentData[studentId]].filter(Boolean) 
      : Object.values(studentData);
    
    studentsToProcess.forEach(student => {
      if (student?.modules[moduleId]?.assessments) {
        Object.values(student.modules[moduleId].assessments).forEach(assessmentInfo => {
          const bestSubmission = findBestSubmission(
            student.student.id,
            assessmentInfo.assessment.id,
            Object.values(studentSubmissions).flat()
          );
          
          if (bestSubmission) {
            totalScore += parseFloat(bestSubmission.percentage) || 0;
            submissionCount++;
          }
        });
      }
    });
    
    return submissionCount > 0 ? totalScore / submissionCount : 0;
  };

  const calculateStudentOverallAverage = (studentId) => {
    const studentInfo = studentData[studentId];
    if (!studentInfo) return null;
    
    let totalPercentage = 0;
    let assessmentCount = 0;
    
    Object.values(studentInfo.modules).forEach(moduleInfo => {
      Object.values(moduleInfo.assessments).forEach(assessmentInfo => {
        const bestSubmission = findBestSubmission(
          studentId,
          assessmentInfo.assessment.id,
          Object.values(studentSubmissions).flat()
        );
        
        if (bestSubmission) {
          totalPercentage += parseFloat(bestSubmission.percentage) || 0;
          assessmentCount++;
        }
      });
    });
    
    return assessmentCount > 0 ? (totalPercentage / assessmentCount).toFixed(1) : null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const navigateToSubmissionView = (submission) => {
    if (!submission) {
      console.error("Cannot navigate: submission is undefined");
      return;
    }
    
    try {
      const assessmentData = {
        id: submission.assessment.id,
        title: submission.assessment.title,
        moduleId: submission.moduleId,
        moduleName: submission.moduleName,
        type: submission.assessment.type || "quiz",
        passing_score: parseFloat(submission.assessment.passing_score) || 75,
        max_score: parseFloat(submission.assessment.max_score) || 100,
        description: submission.assessment.instructions || submission.assessment.description || "",
        questions: submission.assessment.questions || [],
        due_date: submission.assessment.due_date,
      };
      
      const submissionData = {
        id: submission.id,
        studentName: submission.student.name,
        studentId: submission.student.id,
        status: submission.isLate ? "Late" : (submission.status === 'graded' ? "Graded" : "Submitted"),
        score: submission.score,
        maxScore: submission.maxScore,
        percentage: submission.percentage,
        submit_time: submission.submit_time,
        is_late: submission.isLate,
      };
      
      navigate(`/Teacher/Assessment/Submission/${submission.id}`, {
        state: {
          assessment: assessmentData,
          submission: submissionData
        }
      });
    } catch (error) {
      console.error("Error navigating to submission view:", error);
      alert("Failed to view submission details. Please try again.");
    }
  };

  const getTypeStyle = (type) => {
    switch(type?.toLowerCase()) {
      case 'quiz': return 'bg-blue-100';
      case 'exam': return 'bg-purple-100';
      case 'assignment': return 'bg-green-100';
      default: return 'bg-gray-100';
    }
  };

  const formatPassingPercentage = (passingScore, maxScore) => {
    if (!passingScore) return "0";
    return `${passingScore}`;
  };

  const getSubmissionScoreClass = (score, maxScore, percentage, passingScore) => {
    if (score === 0) return "text-gray-500";
    
    const passingPercentage = passingScore && maxScore ? 
      (parseFloat(passingScore) / parseFloat(maxScore)) * 100 : 
      75;
      
    if (percentage >= passingPercentage) return "text-green-600";
    if (percentage >= passingPercentage * 0.8) return "text-yellow-600";
    return "text-red-600";
  };

  const getStudentAttemptCount = (studentId, assessmentId) => {
    if (!studentId || !assessmentId) return 0;
    
    const studentSubmissionsForAssessment = Object.values(studentSubmissions)
      .flat()
      .filter(sub => sub.student?.id === studentId && sub.assessmentId === assessmentId);
    
    return studentSubmissionsForAssessment.length || 0;
  };

  const renderNoSubmissionItem = (assessment, index) => {
    const passingScore = parseFloat(assessment.passing_score) || 75;
    const maxScore = parseFloat(assessment.max_score) || 100;
    const maxAllowedAttempts = assessment.allowed_attempts || assessment.max_attempts || 1;
    
    const formattedDueDate = assessment.due_date
      ? formatDate(assessment.due_date)
      : 'No due date';
    const typeStyle = getTypeStyle(assessment.type);

    return (
      <div key={assessment.id}>
        {index > 0 && <div className="mx-6 border-t border-gray-200"></div>}
        
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${typeStyle}`}>
                {assessment.type === 'quiz' && <BarChart className="text-blue-600" />}
                {assessment.type === 'exam' && <BookOpen className="text-purple-600" />}
                {assessment.type === 'assignment' && <ClipboardList className="text-green-600" />}
                {!['quiz', 'exam', 'assignment'].includes(assessment.type) && 
                  <ClipboardList className="text-gray-600" />}
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{assessment.title}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">
                    {assessment.type || 'Assessment'}
                  </span>
                  <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="text-xs px-1.5 py-0.5 rounded border bg-gray-100 text-gray-800 border-gray-200">
                    Not Submitted
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Not submitted</span>
              <span className="text-xs text-gray-500">
                Passing: {formatPassingPercentage(passingScore)}/{maxScore}
              </span>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-3 rounded-lg border border-gray-100">
            <div className="md:col-span-1 flex flex-col">
              <span className="text-xs font-medium text-gray-500 uppercase mb-1">Best Score</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold text-gray-500">N/A</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Due: {formattedDueDate}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <span className="text-xs font-medium text-gray-500 uppercase mb-1">Submission Details</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-gray-500">Date Submitted</span>
                  <span className="font-medium text-gray-700">Not submitted</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Attempts</span>
                  <span className="font-medium text-gray-700">
                    0 / {maxAllowedAttempts}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-1 flex items-end justify-end">
              <span className="text-sm text-gray-500">No submission</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSubmissionItem = (submission, index) => {
    const assessment = submission.assessment;
    const score = submission.score;
    const maxScore = submission.maxScore;
    const percentage = submission.percentage;
    
    const passingScoreValue = parseFloat(assessment.passing_score) || 75;
    const maxScoreValue = parseFloat(maxScore) || 100;
    
    const passingPercentage = (passingScoreValue / maxScoreValue) * 100;
    
    const maxAllowedAttempts = assessment.allowed_attempts || assessment.max_attempts || 1;
    const studentAttempts = getStudentAttemptCount(submission.student?.id, assessment.id);
    
    const isGraded = submission.status === 'graded' || 
      (submission.fullSubmission && areAllQuestionsGraded(submission.fullSubmission));
    const isLate = submission.isLate;
    const statusText = isLate ? 'Late' : isGraded ? 'Graded' : 'Submitted';
    const statusStyle = isLate 
      ? 'bg-amber-100 text-amber-800 border-amber-200' 
      : isGraded
        ? 'bg-green-100 text-green-800 border-green-200'
        : 'bg-blue-100 text-blue-800 border-blue-200';
    
    const formattedDueDate = assessment.due_date
      ? formatDate(assessment.due_date)
      : 'No due date';
    const submissionDate = submission.submit_time
      ? formatDate(submission.submit_time)
      : 'Not available';
    const typeStyle = getTypeStyle(assessment.type);
    const scoreClass = getSubmissionScoreClass(score, maxScore, percentage, passingScoreValue);

    const hasLateSubmissions = Object.values(studentSubmissions)
      .flat()
      .some(sub => 
        sub.student?.id === submission.student?.id && 
        sub.assessmentId === submission.assessmentId &&
        sub.isLate
      );
    
    const hasOnTimeSubmissions = Object.values(studentSubmissions)
      .flat()
      .some(sub => 
        sub.student?.id === submission.student?.id && 
        sub.assessmentId === submission.assessmentId &&
        !sub.isLate
      );
    
    const showToggle = hasLateSubmissions && hasOnTimeSubmissions;
    
    const showingLate = lateScorePreferences[submission.assessmentId] || false;
    const onlyHasLateSubmissions = hasLateSubmissions && !hasOnTimeSubmissions;

    const isPassing = percentage >= passingPercentage;

    return (
      <div key={submission.id}>
        {index > 0 && <div className="mx-6 border-t border-gray-200"></div>}
        
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${typeStyle}`}>
                {assessment.type === 'quiz' && <BarChart className="text-blue-600" />}
                {assessment.type === 'exam' && <BookOpen className="text-purple-600" />}
                {assessment.type === 'assignment' && <ClipboardList className="text-green-600" />}
                {!['quiz', 'exam', 'assignment'].includes(assessment.type) && 
                  <ClipboardList className="text-gray-600" />}
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{assessment.title}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">
                    {assessment.type || 'Assessment'}
                  </span>
                  <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${statusStyle}`}>
                    {statusText}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${scoreClass}`}>
                {`${score} / ${maxScore} (${percentage}%)`}
              </span>
              <span className="text-xs text-gray-500">
                Passing: {passingScoreValue}/{maxScore}
              </span>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-3 rounded-lg border border-gray-100">
            <div className="md:col-span-1 flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-500 uppercase">Best Score</span>
                {showToggle && (
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <span className={`text-xs ${showingLate ? "text-amber-700" : "text-gray-700"}`}>
                        {showingLate ? "Late" : "On-time"}
                      </span>
                      <div className="relative ml-2">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={showingLate}
                          onChange={() => {
                            setLateScorePreferences(prev => ({
                              ...prev, 
                              [submission.assessmentId]: !prev[submission.assessmentId]
                            }));
                          }}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                      </div>
                    </label>
                  </div>
                )}
                {onlyHasLateSubmissions && (
                  <span className="text-xs text-amber-700">Late only</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-semibold ${scoreClass}`}>
                  {percentage}%
                </span>
                {isPassing ? (
                  <span className="inline-block p-1 bg-green-100 text-green-700 text-xs rounded-full">
                    PASSED
                  </span>
                ) : (
                  <span className="inline-block p-1 bg-red-100 text-red-700 text-xs rounded-full">
                    FAILED
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Due: {formattedDueDate}
              </div>
              {isLate && (
                <div className="mt-1">
                  <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs px-1.5 py-0.5 rounded-full">
                    {onlyHasLateSubmissions ? "ONLY LATE SUBMISSION" : "LATE SUBMISSION"}
                  </span>
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <span className="text-xs font-medium text-gray-500 uppercase mb-1">Submission Details</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-gray-500">Date Submitted</span>
                  <span className="font-medium text-gray-700">{submissionDate}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Attempts</span>
                  <span className="font-medium text-gray-700">
                    {studentAttempts} / {maxAllowedAttempts}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-1 flex items-end justify-end">
              <button
                className="px-4 py-2 bg-[#212529] text-white text-sm rounded hover:bg-[#F6BA18] hover:text-[#212529] transition-colors flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToSubmissionView(submission);
                }}
              >
                <span>View Submission</span>
              </button>
            </div>
          </div>
        </div>
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
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowPerformanceGraph(prev => !prev)}
          className="flex items-center gap-2 px-4 py-2 bg-[#212529] text-white rounded-lg hover:bg-[#F6BA18] hover:text-[#212529] transition-colors"
        >
          {showPerformanceGraph ? (
            <>
              <EyeOff size={18} />
              <span>Hide Performance Graph</span>
            </>
          ) : (
            <>
              <TrendingUp size={18} />
              <span>Show Performance Graph</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderPerformanceGraph = () => {
    if (!showPerformanceGraph) return null;
    
    const studentMetrics = students.map(student => {
      const studentAvg = calculateStudentOverallAverage(student.id) || '0';
      
      let completedAssessments = 0;
      let totalAssessments = 0;
      
      if (selectedModule) {
        const moduleAsms = moduleAssessments[selectedModule.module_id] || [];
        totalAssessments = moduleAsms.length;
        
        if (studentData[student.id]?.modules[selectedModule.module_id]?.assessments) {
          Object.values(studentData[student.id].modules[selectedModule.module_id].assessments).forEach(assessmentInfo => {
            const bestSubmission = findBestSubmission(
              student.id,
              assessmentInfo.assessment.id,
              Object.values(studentSubmissions).flat()
            );
            
            if (bestSubmission) {
              completedAssessments++;
            }
          });
        }
      } else {
        Object.values(moduleAssessments).forEach(moduleAsms => {
          totalAssessments += moduleAsms.length;
        });
        
        Object.values(studentData[student.id]?.modules || {}).forEach(moduleInfo => {
          Object.values(moduleInfo.assessments || {}).forEach(assessmentInfo => {
            const bestSubmission = findBestSubmission(
              student.id,
              assessmentInfo.assessment.id,
              Object.values(studentSubmissions).flat()
            );
            
            if (bestSubmission) {
              completedAssessments++;
            }
          });
        });
      }
      
      let onTimeSubmissions = 0;
      let lateSubmissions = 0;
      
      let highPerformance = 0;
      let mediumPerformance = 0;
      let lowPerformance = 0;
      
      if (selectedModule) {
        if (studentData[student.id]?.modules[selectedModule.module_id]) {
          Object.values(studentData[student.id].modules[selectedModule.module_id].assessments || {}).forEach(assessmentInfo => {
            const bestSubmission = findBestSubmission(
              student.id,
              assessmentInfo.assessment.id,
              Object.values(studentSubmissions).flat()
            );
            
            if (bestSubmission) {
              if (bestSubmission.isLate) {
                lateSubmissions++;
              } else {
                onTimeSubmissions++;
              }
              
              const score = parseFloat(bestSubmission.percentage) || 0;
              if (score >= 85) highPerformance++;
              else if (score >= 70) mediumPerformance++;
              else lowPerformance++;
            }
          });
        }
      } else {
        Object.values(studentData[student.id]?.modules || {}).forEach(moduleInfo => {
          Object.values(moduleInfo.assessments || {}).forEach(assessmentInfo => {
            const bestSubmission = findBestSubmission(
              student.id,
              assessmentInfo.assessment.id,
              Object.values(studentSubmissions).flat()
            );
            
            if (bestSubmission) {
              if (bestSubmission.isLate) {
                lateSubmissions++;
              } else {
                onTimeSubmissions++;
              }
              
              const score = parseFloat(bestSubmission.percentage) || 0;
              if (score >= 85) highPerformance++;
              else if (score >= 70) mediumPerformance++;
              else lowPerformance++;
            }
          });
        });
      }
      
      const completionRate = totalAssessments > 0 ? 
        (completedAssessments / totalAssessments) * 100 : 0;
      
      return {
        student,
        averageScore: parseFloat(studentAvg),
        completedAssessments,
        totalAssessments,
        onTimeSubmissions,
        lateSubmissions,
        completionRate,
        highPerformance,
        mediumPerformance,
        lowPerformance
      };
    }).sort((a, b) => b.averageScore - a.averageScore);
    
    const studentAverages = {};
    studentMetrics.forEach(metric => {
      studentAverages[metric.student.id] = metric.averageScore;
    });
    
    const moduleMetrics = modules.map(module => {
      const moduleAssessmentsList = moduleAssessments[module.module_id] || [];
      let totalScore = 0;
      let totalSubmissionCount = 0;
      
      let totalPossibleSubmissions = moduleAssessmentsList.length * students.length;
      let submittedCount = 0;
      let passedCount = 0;
      let failedCount = 0;
      
      let studentsCompletedAll = 0;
      
      const studentCompletions = {};
      students.forEach(student => {
        studentCompletions[student.id] = {
          completedAssessments: 0,
          totalAssessments: moduleAssessmentsList.length,
          totalAttempts: 0,
          passedAssessments: 0,
          failedAssessments: 0,
          hasCompletedAllAssessments: false
        };
      });
      
      let totalAttempts = 0;
      let assessmentsWithSubmissions = 0;
      
      let totalAssessmentsCompleted = 0;
      let totalAssessmentsPassed = 0;
      
      students.forEach(student => {
        if (studentData[student.id]?.modules[module.module_id]?.assessments) {
          let studentCompletedCount = 0;
          let studentPassedCount = 0;
          
          if (moduleAssessmentsList.length > 0) {
            studentCompletedCount = 0;
            
            moduleAssessmentsList.forEach(assessment => {
              const studentSubmissionsForAssessment = Object.values(studentSubmissions)
                .flat()
                .filter(sub => 
                  sub.student?.id === student.id && 
                  sub.assessmentId === assessment.id
                );
              
              const attemptCount = studentSubmissionsForAssessment.length;
              
              if (attemptCount > 0) {
                studentCompletions[student.id].totalAttempts += attemptCount;
                totalAttempts += attemptCount;
                
                assessmentsWithSubmissions++;
                
                const bestSubmission = findBestSubmission(
                  student.id,
                  assessment.id,
                  Object.values(studentSubmissions).flat()
                );
                
                if (bestSubmission) {
                  submittedCount++;
                  studentCompletedCount++;
                  totalAssessmentsCompleted++;
                  
                  studentCompletions[student.id].completedAssessments++;
                  
                  const score = parseFloat(bestSubmission.percentage) || 0;
                  totalScore += score;
                  totalSubmissionCount++;
                  
                  const passingScore = parseFloat(assessment.passing_score) || 0;
                  const maxScore = parseFloat(assessment.max_score) || 100;
                  const passingPercentage = maxScore > 0 ? (passingScore / maxScore) * 100 : 75;
                  
                  if (score >= passingPercentage) {
                    passedCount++;
                    studentPassedCount++;
                    totalAssessmentsPassed++;
                    studentCompletions[student.id].passedAssessments++;
                  } else {
                    failedCount++;
                    studentCompletions[student.id].failedAssessments++;
                  }
                }
              }
            });
            
            if (studentCompletedCount === moduleAssessmentsList.length) {
              studentsCompletedAll++;
              studentCompletions[student.id].hasCompletedAllAssessments = true;
            }
          }
        }
      });
      
      const averageScore = totalSubmissionCount > 0 ? 
        totalScore / totalSubmissionCount : 0;
        
      const averageAttempts = assessmentsWithSubmissions > 0 ? 
        totalAttempts / assessmentsWithSubmissions : 0;
      
      const passRatio = totalAssessmentsCompleted > 0 ? 
        (totalAssessmentsPassed / totalAssessmentsCompleted) * 100 : 0;
      
      return {
        module,
        averageScore,
        totalAssessments: moduleAssessmentsList.length,
        submittedCount,
        passedCount,
        failedCount,
        totalPossibleSubmissions,
        studentsCompleted: studentsCompletedAll,
        totalStudents: students.length,
        totalAttempts,
        averageAttempts,
        passRatio
      };
    });

    const filteredPerformanceData = selectedModule ? {
      ...performanceTrendData,
      assessments: performanceTrendData.assessments.filter(a => 
        moduleAssessments[selectedModule.module_id]?.some(ma => ma.id === a.id)
      )
    } : performanceTrendData;
    
    return (
      <div className="mb-8">
        <PerformanceTrendChart 
          performanceData={filteredPerformanceData}
          title={selectedModule ? `${selectedModule.name} - Performance Trends` : "Student Performance Trends"}
          topPerformerAverages={studentAverages}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-sm overflow-hidden border border-gray-200/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Average Performance by Module</h3>
              {selectedModule && (
                <button 
                  onClick={() => setSelectedModule(null)}
                  className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Clear Selection
                </button>
              )}
            </div>
            
            <div className="space-y-6">
              {moduleMetrics.map((moduleMetric) => {
                const getScoreColor = (score) => {
                  if (score >= 80) return 'text-green-600';
                  if (score >= 70) return 'text-blue-600'; 
                  return 'text-red-600';
                };

                const isSelected = selectedModule?.module_id === moduleMetric.module.module_id;

                return (
                  <div 
                    key={moduleMetric.module.module_id} 
                    className={`space-y-2 p-3 rounded-lg transition-colors cursor-pointer ${
                      isSelected ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedModule(isSelected ? null : moduleMetric.module)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-gray-800">{moduleMetric.module.name}</h4>
                        <p className="text-xs text-gray-500">
                          {moduleMetric.totalAssessments} {moduleMetric.totalAssessments === 1 ? 'assessment' : 'assessments'} • 
                          {moduleMetric.submittedCount} submissions
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="w-full h-3 bg-red-300 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-r-none"
                          style={{ width: `${moduleMetric.passRatio}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between mt-1 text-xs text-gray-600">
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          <span className="text-green-700 font-medium">
                            {moduleMetric.passedCount} assessments passed
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="text-red-700 font-medium">
                            {moduleMetric.failedCount} assessments failed
                          </span>
                          <span className="inline-block w-2 h-2 bg-red-400 rounded-full ml-1"></span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center mt-2 pt-2 border-t border-gray-100">
                        <div className="text-xs text-amber-600 font-medium">
                          <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mr-1"></span>
                          Avg {moduleMetric.averageAttempts.toFixed(1)} attempt{moduleMetric.averageAttempts !== 1 ? 's' : ''} per assessment
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-2 border-t border-gray-100 text-xs text-gray-500">
              <p>* Average score is calculated from each student's <strong>best submission</strong> for each assessment</p>
              <p>* Progress bar shows the proportion of <strong>passed assessments</strong> (green) vs <strong>failed assessments</strong> (red)</p>
              <p>* Click on a module to see detailed performance for that module</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm overflow-hidden border border-gray-200/50">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">
                {selectedModule ? `Top Performers - ${selectedModule.name}` : "Top Performers"}
              </h3>
              <div className="flex items-center text-xs text-gray-500">
                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded mr-1">High</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded mr-1">Medium</span>
                <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded">Low</span>
              </div>
            </div>
            
            <div className="space-y-5">
              {studentMetrics.slice(0, 5).map((metric, index) => {
                return (
                  <div key={metric.student.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#212529] to-gray-700 flex items-center justify-center text-white text-sm mr-3">
                          {metric.student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{metric.student.name}</span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {index + 1 <= 3 ? `#${index + 1}` : ''}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {metric.completedAssessments}/{metric.totalAssessments} assessments completed ({metric.completionRate.toFixed(0)}%)
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          metric.averageScore >= 85 ? 'text-green-600' : 
                          metric.averageScore >= 70 ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          {metric.averageScore.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Average score</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mb-1 ml-11">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className="flex h-full">
                          {metric.highPerformance > 0 && (
                            <div 
                              className="bg-green-500 h-full" 
                              style={{ flex: metric.highPerformance }}
                              title={`${metric.highPerformance} high scores (>85%)`}
                            ></div>
                          )}
                          {metric.mediumPerformance > 0 && (
                            <div 
                              className="bg-blue-500 h-full" 
                              style={{ flex: metric.mediumPerformance }}
                              title={`${metric.mediumPerformance} medium scores (70-85%)`}
                            ></div>
                          )}
                          {metric.lowPerformance > 0 && (
                            <div 
                              className="bg-red-500 h-full" 
                              style={{ flex: metric.lowPerformance }}
                              title={`${metric.lowPerformance} low scores (<70%)`}
                            ></div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-11 flex justify-between text-xs text-gray-500">
                      <div className="flex gap-3">
                        {metric.highPerformance > 0 && (
                          <span className="text-green-600">{metric.highPerformance} high</span>
                        )}
                        {metric.mediumPerformance > 0 && (
                          <span className="text-blue-600">{metric.mediumPerformance} medium</span>
                        )}
                        {metric.lowPerformance > 0 && (
                          <span className="text-red-600">{metric.lowPerformance} low</span>
                        )}
                      </div>
                      <span>
                        {metric.onTimeSubmissions} on time / {metric.lateSubmissions} late
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {studentMetrics.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No student data available
              </div>
            )}
            
            <div className="mt-4 pt-2 border-t border-gray-100 text-xs text-gray-500">
              <p>* Performance categories: High (≥85%), Medium (70-85%), Low (&lt;70%)</p>
              <p>* Rankings based on average scores across all submitted assessments</p>
              {selectedModule && (
                <p>* Currently showing data filtered for module: <strong>{selectedModule.name}</strong></p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
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

  const renderStudentModules = (studentId) => {
    const studentInfo = studentData[studentId];
    if (!studentInfo || !studentInfo.modules) return null;
    
    return (
      <div className="divide-y divide-gray-200">
        {Object.entries(studentInfo.modules).map(([moduleId, moduleInfo]) => {
          const isExpanded = expandedStudentModules[`${studentId}-${moduleId}`];
          const assessments = Object.values(moduleInfo.assessments || {});
          
          const totalAssessments = assessments.length;
          const completedAssessments = assessments.filter(assessmentInfo => {
            return assessmentInfo.submissions && assessmentInfo.submissions.length > 0;
          }).length;

          return (
            <div key={moduleId}>
              <div 
                className={`flex items-center justify-between px-6 py-4 cursor-pointer ${
                  isExpanded ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
                onClick={() => toggleStudentModule(studentId, moduleId)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200">
                    <BookOpen className="text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{moduleInfo.moduleName}</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500">{totalAssessments} assessments</p>
                      <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-700">
                        {completedAssessments}/{totalAssessments} completed
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <ChevronDown 
                    className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} 
                  />
                </div>
              </div>

              {isExpanded && (
                <div className="bg-gray-50 border-b border-gray-200">
                  {assessments.map((assessmentInfo, index) => {
                    const assessment = assessmentInfo.assessment;
                    
                    const bestSubmission = findBestSubmission(
                      studentId, 
                      assessment.id, 
                      Object.values(studentSubmissions).flat()
                    );
                    
                    if (!bestSubmission) {
                      return renderNoSubmissionItem(assessment, index);
                    }
                    
                    return renderSubmissionItem(bestSubmission, index);
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const filteredStudents = useMemo(() => {
    if (!students || students.length === 0) {
      return [];
    }

    return students.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
        
      if (!matchesSearch) return false;
      
      if (filterType === 'all') return true;
      
      return true;
    });
  }, [students, searchQuery, filterType]);

  const renderStudentList = () => {
    if (!students || students.length === 0) {
      return (
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200/50">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students</h3>
          <p className="text-gray-500">There are no students enrolled in this course yet.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200/50">
        <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-600 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Enrolled Students</h2>
          </div>
          
          <p className="text-sm text-gray-300 mb-4">
            Track individual student performance and assessment completion status
          </p>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700/50 text-white placeholder:text-gray-400 border border-gray-600 rounded-lg py-2.5 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-[#F6BA18] transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => {
              const isExpanded = expandedStudents.has(student.id);
              const studentInfo = studentData[student.id];

              return (
                <div key={student.id} className="divide-y divide-gray-100">
                  <div 
                    className={`px-6 py-4 bg-white cursor-pointer ${
                      isExpanded ? "bg-gray-50 border-l-4 border-[#F6BA18]" : "hover:bg-gray-50"
                    }`}
                    onClick={() => toggleStudent(student.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#212529] to-gray-700 flex items-center justify-center text-white shadow-sm">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{student.name}</h4>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {studentInfo?.modules ? Object.keys(studentInfo.modules).length : 0} modules
                          </p>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="bg-gray-50 border-b border-gray-200">
                      {renderStudentModules(student.id)}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center">
              <Users className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <p className="text-gray-500">No students match your search</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const calculateOverallStats = () => {
    const totalPossibleSubmissions = students.length * Object.values(moduleAssessments).flat().length;
    const totalSubmissions = Object.values(studentSubmissions).flat().length;
    
    let totalScore = 0;
    let assessmentCount = 0;
    
    const allAssessments = Object.values(moduleAssessments).flat();
    
    students.forEach(student => {
      allAssessments.forEach(assessment => {
        assessmentCount++;
        
        const bestSubmission = findBestSubmission(
          student.id,
          assessment.id,
          Object.values(studentSubmissions).flat()
        );
        
        const score = bestSubmission ? parseFloat(bestSubmission.percentage) : 0;
        totalScore += score;
      });
    });
    
    const averageScore = assessmentCount > 0 
      ? (totalScore / assessmentCount).toFixed(1) 
      : '0.0';
      
    return {
      averageScore,
      totalAssessments: Object.values(moduleAssessments).flat().length,
    };
  };

  const renderStatCards = () => {
    const stats = calculateOverallStats();

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-rose-800 text-sm font-medium mb-2">Assessments</h3>
              <p className="text-3xl font-bold text-rose-900">{stats.totalAssessments}</p>
            </div>
            <div className="p-3 bg-rose-200 rounded-lg">
              <ClipboardList size={24} className="text-rose-700" />
            </div>
          </div>
          <p className="text-rose-600 text-xs mt-4">
            {stats.totalAssessments === 1 ? '1 assessment' : `${stats.totalAssessments} assessments`} created
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow" 
             title="Average score across all student submissions">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-emerald-800 text-sm font-medium mb-2">Average Score</h3>
              <p className="text-3xl font-bold text-emerald-900">{stats.averageScore}%</p>
            </div>
            <div className="p-3 bg-emerald-200 rounded-lg">
              <Users size={24} className="text-emerald-700" />
            </div>
          </div>
          <p className="text-emerald-600 text-xs mt-4">
            Average of all student scores
          </p>
        </div>
      </div>
    );
  };

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
              <p className="text-gray-500 text-center mb-6">{error}</p>
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
              {renderPerformanceGraph()}
              {renderStudentList()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherProgressTracker;
