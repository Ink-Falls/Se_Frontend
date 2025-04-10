import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import { useCourse } from "../../contexts/CourseContext";
import { useNavigate } from "react-router-dom";
import { getCourseAssessments, getAssessmentSubmissions, getSubmissionDetails } from "../../services/assessmentService";
import { getModulesByCourseId } from "../../services/moduleService";
import { getLearnerRoster } from "../../services/attendanceService";
import {
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
  User,
  LineChart,
  Calendar as CalendarIcon,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Clock,
  Award,
  Users,
  ArrowRight,
  AlertCircle,
  Calendar,
} from "lucide-react";

// Helper functions
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getDayName = (date) => {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
};

const isDateEqual = (date1, date2) => {
  return new Date(date1).toDateString() === new Date(date2).toDateString();
};

const isDateInRange = (date, startDate, endDate) => {
  const checkDate = new Date(date).setHours(0, 0, 0, 0);
  const start = new Date(startDate).setHours(0, 0, 0, 0);
  const end = new Date(endDate).setHours(0, 0, 0, 0);
  return checkDate >= start && checkDate <= end;
};

// Add the missing formatMonthYear function
const formatMonthYear = (date) => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const TeacherAttendance = () => {
  const { selectedCourse } = useCourse();
  const navigate = useNavigate();
  
  // States for data management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modules, setModules] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, present, absent
  const [attendanceData, setAttendanceData] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [studentStats, setStudentStats] = useState({});
  const [overallStats, setOverallStats] = useState({
    averageAttendance: 0,
    totalStudents: 0,
    totalAssessments: 0,
    averageSubmissionRate: 0,
  });

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

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0-6, 0 is Sunday)
    const startDayOfWeek = firstDay.getDay();
    
    // Calculate days from previous month to show
    const daysFromPreviousMonth = Array.from({ length: startDayOfWeek }, (_, i) => {
      const day = new Date(year, month, -startDayOfWeek + i + 1);
      return {
        date: day,
        isCurrentMonth: false,
        isWeekend: day.getDay() === 0 || day.getDay() === 6
      };
    });
    
    // Calculate days for the current month
    const daysInMonth = Array.from({ length: lastDay.getDate() }, (_, i) => {
      const day = new Date(year, month, i + 1);
      return {
        date: day,
        isCurrentMonth: true,
        isWeekend: day.getDay() === 0 || day.getDay() === 6
      };
    });
    
    // Calculate how many days to show from next month
    const totalDaysShown = Math.ceil((startDayOfWeek + lastDay.getDate()) / 7) * 7;
    const daysFromNextMonth = Array.from({ length: totalDaysShown - daysFromPreviousMonth.length - daysInMonth.length }, (_, i) => {
      const day = new Date(year, month + 1, i + 1);
      return {
        date: day,
        isCurrentMonth: false,
        isWeekend: day.getDay() === 0 || day.getDay() === 6
      };
    });
    
    return [...daysFromPreviousMonth, ...daysInMonth, ...daysFromNextMonth];
  }, [selectedMonth]);
  
  // Fetch data on component mount
  useEffect(() => {
    if (!selectedCourse?.id) {
      navigate("/Teacher/Dashboard");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setIsRefreshing(true);
        setError(null);

        // Step 1: Get the learner roster using the attendance service
        const learnerRoster = await getLearnerRoster(selectedCourse.id);
        if (learnerRoster && Array.isArray(learnerRoster)) {
          setStudents(learnerRoster);
        } else {
          throw new Error("Failed to fetch student roster");
        }

        // Step 2: Fetch modules for the course
        const modulesResponse = await getModulesByCourseId(selectedCourse.id);
        if (!modulesResponse) {
          throw new Error("Failed to fetch modules data");
        }
        setModules(modulesResponse);

        // Step 3: Fetch all assessments for each module
        let allAssessments = [];
        for (const module of modulesResponse) {
          try {
            const response = await getCourseAssessments(module.module_id, true);
            if (response.success && response.assessments) {
              const moduleAssessments = response.assessments.filter(
                assessment => assessment.is_published
              ).map(assessment => ({
                ...assessment,
                created_at: assessment.created_at || assessment.createdAt
              }));
              
              allAssessments = [...allAssessments, ...moduleAssessments];
            }
          } catch (err) {
            console.error(`Error fetching assessments for module ${module.module_id}:`, err);
          }
        }
        
        // Set assessments in the state
        setAssessments(allAssessments);
        
        // Initialize attendance data with empty submissions for all students
        const attendanceMapData = {};
        learnerRoster.forEach(student => {
          attendanceMapData[student.id] = [];
        });
        
        // Fetch submissions for each assessment
        for (const assessment of allAssessments) {
          try {
            const submissionsResponse = await getAssessmentSubmissions(assessment.id);
            if (submissionsResponse.success && submissionsResponse.submissions) {
              for (const submission of submissionsResponse.submissions) {
                try {
                  const detailsResponse = await getSubmissionDetails(submission.id);
                  if (detailsResponse.success && detailsResponse.submission) {
                    const submissionDetails = detailsResponse.submission;
                    const studentId = submissionDetails.user?.id;
                    
                    if (studentId) {
                      // If this student isn't already in our map, add them
                      if (!attendanceMapData[studentId]) {
                        attendanceMapData[studentId] = [];
                        
                        // If the student is found in submissions but not in our roster, add them
                        if (!learnerRoster.find(s => s.id === studentId)) {
                          const studentName = `${submissionDetails.user.first_name || ''} ${submissionDetails.user.last_name || ''}`.trim();
                          const newStudent = {
                            id: studentId,
                            name: studentName || 'Unknown Student',
                            email: submissionDetails.user.email
                          };
                          setStudents(prev => [...prev, newStudent]);
                        }
                      }
                      
                      // Add this submission to their record
                      attendanceMapData[studentId].push({
                        id: submission.id,
                        assessmentId: assessment.id,
                        assessmentTitle: assessment.title,
                        submissionDate: submissionDetails.submit_time,
                        onTime: !submissionDetails.is_late
                      });
                    }
                  }
                } catch (err) {
                  console.error(`Error fetching details for submission ${submission.id}:`, err);
                }
              }
            }
          } catch (err) {
            console.error(`Error fetching submissions for assessment ${assessment.id}:`, err);
          }
        }

        setAttendanceData(attendanceMapData);
        calculateStudentStats(attendanceMapData, allAssessments, learnerRoster.length);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchData();
  }, [selectedCourse, navigate, refreshTrigger]);
  
  // Calculate attendance statistics
  const calculateStudentStats = (attendanceMap, assessmentsList, totalStudentsCount) => {
    // Calculate per-student stats
    const stats = {};
    let totalAttendanceRate = 0;
    let totalSubmissions = 0;
    
    Object.entries(attendanceMap).forEach(([studentId, submissions]) => {
      // For each student, calculate attendance rate across all assessments
      const studentAssessments = new Set(submissions.map(sub => sub.assessmentId));
      const attendanceRate = assessmentsList.length > 0 ? 
        studentAssessments.size / assessmentsList.length : 0;
      
      // Track on-time vs late submissions
      const onTimeCount = submissions.filter(sub => sub.onTime).length;
      const lateCount = submissions.length - onTimeCount;
      
      stats[studentId] = {
        attendanceRate,
        submissionCount: submissions.length,
        onTimeCount,
        lateCount,
        assessmentsAttended: studentAssessments.size,
        totalAssessments: assessmentsList.length
      };
      
      totalAttendanceRate += attendanceRate;
      totalSubmissions += submissions.length;
    });
    
    setStudentStats(stats);
    
    // Calculate overall stats
    const avgAttendance = totalStudentsCount > 0 ? totalAttendanceRate / totalStudentsCount : 0;
    const submissionRate = (assessmentsList.length * totalStudentsCount) > 0 ?
      totalSubmissions / (assessmentsList.length * totalStudentsCount) : 0;
      
    setOverallStats({
      averageAttendance: avgAttendance * 100,
      totalStudents: totalStudentsCount,
      totalAssessments: assessmentsList.length,
      averageSubmissionRate: submissionRate * 100
    });
  };

  // Handle month navigation
  const navigateMonth = (direction) => {
    setSelectedMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + direction);
      return newMonth;
    });
  };

  // Reset to current month
  const resetToCurrentMonth = () => {
    setSelectedMonth(new Date());
  };

  // Check if a student has attendance on a specific date
  const getStudentAttendanceOnDate = (studentId, date) => {
    if (!studentId || !attendanceData[studentId]) return { present: false };
    
    // Find all assessment periods that include this date
    const relevantAssessments = assessments.filter(assessment => 
      isDateInRange(date, assessment.created_at || assessment.createdAt, assessment.due_date)
    );
    
    if (relevantAssessments.length === 0) return { present: false };
    
    // Check if student submitted any of these assessments
    const submissions = attendanceData[studentId].filter(submission => 
      relevantAssessments.some(assessment => assessment.id === submission.assessmentId)
    );
    
    // Find submissions that were submitted on this specific date
    const submittedOnDate = submissions.filter(submission => 
      isDateEqual(date, submission.submissionDate)
    );
    
    // Find late submissions on this date
    const lateSubmissions = submittedOnDate.filter(submission => !submission.onTime);
    
    const totalRequired = relevantAssessments.length;
    const submitted = submissions.length;
    const onTime = submissions.filter(s => s.onTime).length;
    
    return {
      present: submitted > 0,
      partial: submitted > 0 && submitted < totalRequired,
      completed: submitted === totalRequired,
      progress: totalRequired > 0 ? (submitted / totalRequired) : 0,
      onTimeSubmissions: onTime,
      lateSubmissions: submitted - onTime,
      totalRequired,
      submittedToday: submittedOnDate.length > 0,
      isLateToday: lateSubmissions.length > 0,
      assessments: relevantAssessments.map(a => ({
        title: a.title,
        id: a.id,
        created_at: a.created_at || a.createdAt,
        due_date: a.due_date
      })),
      submissions: submissions.map(s => ({
        id: s.id,
        assessmentId: s.assessmentId, 
        assessmentTitle: s.assessmentTitle,
        submissionDate: s.submissionDate,
        onTime: s.onTime
      }))
    };
  };

  // Get the attendance status for a specific date cell
  const getDateCellStatus = (date) => {
    if (!selectedStudent) return { status: "none" };
    
    const attendance = getStudentAttendanceOnDate(selectedStudent.id, date);
    
    if (!attendance.present) return { status: "absent" };
    if (attendance.partial) return { 
      status: "partial", 
      progress: attendance.progress,
      details: attendance
    };
    return { 
      status: "present", 
      details: attendance
    };
  };

  // Get the color class for a calendar cell based on attendance
  const getDateCellClass = (day) => {
    if (!day.isCurrentMonth) return "opacity-30"; // Dimmed for non-current month days
    if (day.isWeekend) return "bg-gray-50"; // Light gray for weekends
    
    if (!selectedStudent) return "bg-white";
    
    const status = getDateCellStatus(day.date);
    const hasAssessments = assessments.some(assessment => 
      isDateInRange(day.date, assessment.created_at || assessment.createdAt, assessment.due_date)
    );
    
    // For days with submissions made on that specific day
    if (status.details?.submittedToday) {
      return status.details.isLateToday 
        ? "bg-amber-50 border-amber-200 border-2"
        : "bg-emerald-50 border-emerald-200 border-2";
    }
    
    // Show absence indicator when there are assessments but no submissions
    if (status.status === "absent" && hasAssessments) {
      return "bg-red-50 border-red-200 border-l-4";
    }
    
    // Handle partial and present status
    switch (status.status) {
      case "present":
        return "bg-green-50 border-green-200 border-l-4";
      case "partial":
        return "bg-yellow-50 border-yellow-200 border-l-4";
      default:
        return "bg-white";
    }
  };

  const handleRefreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(prev => {
      // Toggle selection if clicking the same student again
      if (prev?.id === student.id) return null;
      return student;
    });
    
    // Ensure calendar rerenders by forcing a state update
    if (student) {
      // Force calendar redraw if needed
      setSelectedMonth(prev => new Date(prev));
    }
  };

  // Calculate attendance percentage for visual display
  const getAttendancePercentage = (studentId) => {
    if (!studentStats[studentId]) return 0;
    return (studentStats[studentId].attendanceRate * 100).toFixed(0);
  };

  // Filter students based on search and attendance filter
  const filteredStudents = useMemo(() => {
    if (!students || students.length === 0) return [];
    
    return students.filter(student => {
      // Apply search filter
      const matchesSearch = !searchQuery || 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply attendance filter
      if (filterType === "all") return matchesSearch;
      
      const studentAttendance = studentStats[student.id] || { attendanceRate: 0 };
      if (filterType === "present") {
        return matchesSearch && studentAttendance.attendanceRate > 0.7; // 70% or more attendance
      } else if (filterType === "absent") {
        return matchesSearch && studentAttendance.attendanceRate < 0.3; // Less than 30% attendance
      }
      
      return matchesSearch;
    });
  }, [students, searchQuery, filterType, studentStats]);

  // Header for statistics display
  const renderStatistics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-blue-800 text-sm font-medium mb-2">Average Attendance</h3>
            <p className="text-3xl font-bold text-blue-900">{overallStats.averageAttendance.toFixed(1)}%</p>
          </div>
          <div className="p-3 bg-blue-200 rounded-lg">
            <UserCheck size={24} className="text-blue-700" />
          </div>
        </div>
        <p className="text-blue-600 text-xs mt-4">Class participation rate</p>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-emerald-800 text-sm font-medium mb-2">Total Students</h3>
            <p className="text-3xl font-bold text-emerald-900">{overallStats.totalStudents}</p>
          </div>
          <div className="p-3 bg-emerald-200 rounded-lg">
            <Users size={24} className="text-emerald-700" />
          </div>
        </div>
        <p className="text-emerald-600 text-xs mt-4">Enrolled learners</p>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-amber-800 text-sm font-medium mb-2">Assessments</h3>
            <p className="text-3xl font-bold text-amber-900">{overallStats.totalAssessments}</p>
          </div>
          <div className="p-3 bg-amber-200 rounded-lg">
            <ClipboardList size={24} className="text-amber-700" />
          </div>
        </div>
        <p className="text-amber-600 text-xs mt-4">Published assessments</p>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-purple-800 text-sm font-medium mb-2">Submission Rate</h3>
            <p className="text-3xl font-bold text-purple-900">{overallStats.averageSubmissionRate.toFixed(1)}%</p>
          </div>
          <div className="p-3 bg-purple-200 rounded-lg">
            <Award size={24} className="text-purple-700" />
          </div>
        </div>
        <p className="text-purple-600 text-xs mt-4">Assessment completion rate</p>
      </div>
    </div>
  );

  // Render calendar - modified to fix overlapping indicators
  const renderCalendar = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Attendance Calendar</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="text-lg font-medium w-44 text-center">{formatMonthYear(selectedMonth)}</span>
            <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronRight size={18} />
            </button>
            <button onClick={resetToCurrentMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-2" title="Go to current month">
              <CalendarIcon size={18} />
            </button>
          </div>
        </div>
        
        {selectedStudent ? (
          <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                {selectedStudent.name[0]}
              </div>
              <div>
                <h3 className="font-semibold">{selectedStudent.name}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                    Attendance: {getAttendancePercentage(selectedStudent.id)}%
                  </span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                    {studentStats[selectedStudent.id]?.assessmentsAttended || 0}/{studentStats[selectedStudent.id]?.totalAssessments || 0} Assessments
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)} 
                className="ml-auto bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
            <p className="text-center text-sm">Select a student to view their attendance</p>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Days of week headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            const dateStatus = selectedStudent ? getDateCellStatus(day.date) : { status: 'none' };
            const dayAssessments = assessments.filter(assessment => 
              isDateInRange(day.date, assessment.created_at || assessment.createdAt, assessment.due_date)
            );
            const hasAssessments = dayAssessments.length > 0;
            
            // Find any assessments that start on this day
            const startsToday = assessments.some(assessment => 
              isDateEqual(day.date, assessment.created_at || assessment.createdAt)
            );
            
            // Find any assessments that are due on this day
            const dueToday = assessments.some(assessment => 
              isDateEqual(day.date, assessment.due_date)
            );
            const dueTodayAssessments = assessments.filter(assessment => 
              isDateEqual(day.date, assessment.due_date)
            );
            
            // For a selected student, find if they submitted anything on this day
            let submittedToday = false;
            let isLateSubmission = false;
            let submittedAssessments = [];
            
            if (selectedStudent && attendanceData[selectedStudent.id]) {
              const studentSubmissions = attendanceData[selectedStudent.id];
              
              // Filter submissions that were made on this specific date
              const submissionsOnDate = studentSubmissions.filter(sub => 
                isDateEqual(day.date, sub.submissionDate)
              );
              
              submittedToday = submissionsOnDate.length > 0;
              isLateSubmission = submissionsOnDate.some(sub => !sub.onTime);
              
              // Get assessment details for the submissions made today
              submittedAssessments = submissionsOnDate.map(sub => {
                const assessment = assessments.find(a => a.id === sub.assessmentId);
                return {
                  id: sub.assessmentId,
                  title: assessment?.title || sub.assessmentTitle || 'Unknown Assessment',
                  onTime: sub.onTime,
                  submissionDate: sub.submissionDate
                };
              });
            }
            
            return (
              <div 
                key={i} 
                className={`p-2 min-h-[80px] border rounded-lg transition-all relative ${getDateCellClass(day)}`}
              >
                <div className={`text-sm ${day.isCurrentMonth ? 'font-medium' : 'text-gray-400'}`}>
                  {day.date.getDate()}
                </div>
                
                {/* Corner indicators for start and due dates */}
                <div className="absolute top-0 left-0 right-0 flex justify-between">
                  {startsToday && (
                    <div className="w-0 h-0 border-t-[16px] border-t-blue-500 border-r-[16px] border-r-transparent">
                      <div className="absolute top-[-16px] left-1 text-[10px] text-white font-bold">
                        {assessments.filter(a => isDateEqual(day.date, a.created_at || a.createdAt)).length}
                      </div>
                    </div>
                  )}
                  
                  {dueToday && (
                    <div className="ml-auto w-0 h-0 border-t-[16px] border-t-red-500 border-l-[16px] border-l-transparent">
                      <div className="absolute top-[-16px] right-1 text-[10px] text-white font-bold">
                        {dueTodayAssessments.length}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Assessment details shown for all users, not just when student is selected */}
                {(dueToday || startsToday) && (
                  <div className="mt-5 mb-2 text-[9px] space-y-1">
                    {dueToday && (
                      <div className="font-medium bg-red-50 text-red-700 px-1 py-0.5 rounded border border-red-200 truncate">
                        Due: {dueTodayAssessments.map(a => a.title.substring(0, 8) + (a.title.length > 8 ? '...' : '')).join(', ')}
                      </div>
                    )}
                    {startsToday && (
                      <div className="font-medium bg-blue-50 text-blue-700 px-1 py-0.5 rounded border border-blue-200 truncate">
                        Start: {assessments
                          .filter(a => isDateEqual(day.date, a.created_at || a.createdAt))
                          .map(a => a.title.substring(0, 8) + (a.title.length > 8 ? '...' : ''))
                          .join(', ')}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Show assessment names always, regardless of student selection */}
                {dayAssessments.length > 0 && (
                  <div className="mt-2">
                    {dayAssessments.slice(0, 2).map((assessment, idx) => (
                      <div key={assessment.id} className="mt-1 text-[9px] truncate text-gray-600">
                        {assessment.title.substring(0, 12) + (assessment.title.length > 12 ? '...' : '')}
                      </div>
                    ))}
                    
                    {dayAssessments.length > 2 && (
                      <div className="mt-1 text-xs font-medium bg-indigo-100 text-indigo-700 py-0.5 px-1 rounded-md text-center border border-indigo-200">
                        +{dayAssessments.length - 2} more
                      </div>
                    )}
                  </div>
                )}
                
                {/* Student-specific assessment stats - only show when student is selected */}
                {selectedStudent && dateStatus.details?.assessmentStats && dateStatus.details.assessmentStats.length > 0 && (
                  <div className="mt-2">
                    {dateStatus.details.assessmentStats.map((stat, idx) => (
                      <div 
                        key={idx}
                        className={`mb-1 text-[9px] font-medium px-1 py-0.5 rounded border truncate ${
                          stat.submitted 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}
                      >
                        {stat.title.substring(0, 10) + (stat.title.length > 10 ? '...' : '')}
                        {stat.submitted && <span className="ml-1">({stat.submissionCount})</span>}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Submission indicators - only show for selected student */}
                {submittedToday && submittedAssessments.length > 0 && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <div 
                      className="rounded-full h-5 w-5 flex items-center justify-center text-white text-xs"
                      style={{ 
                        backgroundColor: isLateSubmission ? '#f59e0b' : '#10b981',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }}
                    >
                      <Check size={12} />
                    </div>
                    {submittedAssessments.length > 1 && (
                      <div className="bg-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center border-2"
                           style={{ 
                             borderColor: isLateSubmission ? '#f59e0b' : '#10b981',
                             color: isLateSubmission ? '#f59e0b' : '#10b981'
                           }}>
                        {submittedAssessments.length}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Progress bar - only for selected student with partial completion */}
                {selectedStudent && dateStatus.status === 'partial' && (
                  <div className="absolute bottom-1 left-1 right-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400" 
                      style={{ width: `${dateStatus.progress * 100}%` }}
                    ></div>
                  </div>
                )}
                
                {/* Status indicators - only for selected student */}
                {selectedStudent && (dateStatus.status === 'present' || dateStatus.status === 'partial') && (
                  <div className="absolute top-2 right-2 bg-green-100 rounded-full p-1">
                    <Check size={14} className={`${
                      dateStatus.status === 'partial' ? 'text-yellow-500' : 'text-green-500'
                    }`} />
                  </div>
                )}
                
                {selectedStudent && dateStatus.status === 'absent' && hasAssessments && (
                  <div className="absolute top-2 right-2 bg-red-100 rounded-full p-1">
                    <X size={14} className="text-red-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Updated legend with more detailed descriptions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-green-100 border-l-4 border-green-500"></div>
            <span>Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-yellow-100 border-l-4 border-yellow-500"></div>
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-red-100 border-l-4 border-red-500"></div>
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-green-500 text-white text-xs">
              <Check size={10} />
              <span className="text-xs font-bold ml-1 text-white">3</span>
            </div>
            <span>On-time Submissions (count)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-100 border-l-4 border-blue-500"></div>
            <span>Assessment Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-red-100 border-l-4 border-red-500"></div>
            <span>Assessment Due</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render student list with assessment summary
  const renderStudentList = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <div className="p-6 bg-gradient-to-r from-violet-600 to-purple-500 text-white">
        <h2 className="text-xl font-bold mb-4">Student Roster</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students..."
              className="w-full bg-white/10 text-white placeholder:text-white/60 border border-white/20 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:bg-white/20"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-white/60" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`py-2 px-4 rounded-lg transition-colors ${
                filterType === "all" 
                  ? "bg-white text-purple-600" 
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("present")}
              className={`py-2 px-4 rounded-lg transition-colors flex items-center gap-1 ${
                filterType === "present" 
                  ? "bg-white text-purple-600" 
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <UserCheck size={16} /> High
            </button>
            <button
              onClick={() => setFilterType("absent")}
              className={`py-2 px-4 rounded-lg transition-colors flex items-center gap-1 ${
                filterType === "absent" 
                  ? "bg-white text-purple-600" 
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <UserX size={16} /> Low
            </button>
            <button
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className={`p-2 rounded-lg transition-colors ${
                isRefreshing 
                  ? "bg-white/30 cursor-not-allowed" 
                  : "bg-white/10 hover:bg-white/20"
              }`}
              title="Refresh data"
            >
              <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Assessment Calendar Summary */}
      <div className="bg-indigo-50 p-4 border-b border-indigo-100">
        <h3 className="text-sm font-medium text-indigo-800 mb-3">Assessment Summary</h3>
        <div className="max-h-[200px] overflow-y-auto pr-2">
          {selectedMonth && (
            <div className="space-y-2">
              {assessments
                .filter(assessment => {
                  const assessmentMonth = new Date(assessment.created_at || assessment.createdAt).getMonth();
                  const selectedMonthValue = selectedMonth.getMonth();
                  return assessmentMonth === selectedMonthValue;
                })
                .map(assessment => {
                  // Get assessment start date
                  const startDate = new Date(assessment.created_at || assessment.createdAt);
                  
                  // Get assessment due date
                  const dueDate = new Date(assessment.due_date);
                  
                  return (
                    <div key={assessment.id} className="flex flex-col p-3 bg-white rounded-lg border border-indigo-100">
                      <div className="text-sm font-medium text-gray-800 mb-1">{assessment.title}</div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar size={12} className="mr-1 text-indigo-500" />
                          <span>
                            {startDate.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                          <span className="mx-1">→</span>
                          <span>
                            {dueDate.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full flex items-center">
                          <ClipboardList size={10} className="mr-1" />
                          {assessment.type}
                        </span>
                      </div>
                      
                      {/* Submission counts by date - NEW SECTION */}
                      {selectedStudent && attendanceData[selectedStudent.id] && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="text-xs font-medium text-gray-500 mb-1">Submissions by this student:</div>
                          {attendanceData[selectedStudent.id]
                            .filter(submission => submission.assessmentId === assessment.id)
                            .map((submission, idx) => {
                              const submissionDate = new Date(submission.submissionDate);
                              return (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center">
                                    <Clock size={10} className="mr-1 text-gray-400" />
                                    <span>{submissionDate.toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      year: '2-digit' 
                                    })}</span>
                                  </div>
                                  <span className={`px-1.5 py-0.5 rounded ${
                                    submission.onTime 
                                      ? 'bg-green-50 text-green-600' 
                                      : 'bg-yellow-50 text-yellow-600'
                                  }`}>
                                    {submission.onTime ? 'On time' : 'Late'}
                                  </span>
                                </div>
                              );
                            })}
                          {attendanceData[selectedStudent.id].filter(
                            submission => submission.assessmentId === assessment.id
                          ).length === 0 && (
                            <div className="text-xs text-red-500">No submissions</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              
              {assessments.filter(assessment => {
                const assessmentMonth = new Date(assessment.created_at || assessment.createdAt).getMonth();
                const selectedMonthValue = selectedMonth.getMonth();
                return assessmentMonth === selectedMonthValue;
              }).length === 0 && (
                <div className="text-center py-4 text-sm text-gray-500">
                  No assessments in {selectedMonth.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200 max-h-[440px] overflow-y-auto">
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery || filterType !== "all" 
              ? "No students match your search or filter criteria" 
              : "No students found in this course"}
          </div>
        ) : (
          filteredStudents.map((student) => {
            const stats = studentStats[student.id] || { 
              attendanceRate: 0, 
              onTimeCount: 0,
              lateCount: 0,
              submissionCount: 0,
              assessmentsAttended: 0,
              totalAssessments: assessments.length
            };
            
            return (
              <div 
                key={student.id}
                onClick={() => handleStudentSelect(student)}
                className={`p-4 flex items-center cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedStudent?.id === student.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="mr-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {student.name[0]}
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900">{student.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock size={14} className="mr-1" />
                    <span className="mr-3">{stats.onTimeCount} on-time</span>
                    <Clock size={14} className="mr-1 text-yellow-500" />
                    <span>{stats.lateCount} late</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    stats.attendanceRate > 0.7 
                      ? 'text-green-600' 
                      : stats.attendanceRate > 0.3 
                      ? 'text-yellow-600' 
                      : 'text-red-600'
                  }`}>
                    {(stats.attendanceRate * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.assessmentsAttended}/{stats.totalAssessments} assessments
                  </div>
                </div>
                <div className="ml-4">
                  <ChevronRight size={20} className={`text-gray-400 ${
                    selectedStudent?.id === student.id ? 'transform rotate-90' : ''
                  }`} />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{filteredStudents.length}</span> of <span className="font-medium">{students.length}</span> students displayed
        </div>
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
          <Header
            title={selectedCourse?.name || "Attendance Tracker"}
            subtitle={selectedCourse?.code}
          />
          <div className="relative z-50">
            <MobileNavBar navItems={navItems} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 h-[60vh]">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Error Loading Attendance Data
              </h3>
              <p className="text-gray-600 text-center mb-6">{error}</p>
              <button 
                onClick={() => handleRefreshData()}
                className="px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {renderStatistics()}
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  {renderCalendar()}
                </div>
                <div className="lg:col-span-1">
                  {renderStudentList()}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendance;
