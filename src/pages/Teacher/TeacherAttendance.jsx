import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import { useCourse } from "../../contexts/CourseContext";
import { useNavigate } from "react-router-dom";
import { getCourseAssessments, getAssessmentSubmissions, getSubmissionDetails } from "../../services/assessmentService";
import { getModulesByCourseId } from "../../services/moduleService";
import { getLearnerRoster, getAttendanceByDate, createAttendance, updateAttendanceStatus } from "../../services/attendanceService";
import AttendanceModal from "../../components/attendance/AttendanceModal";
import SubmissionHistoryModal from "../../components/attendance/SubmissionHistoryModal";
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
  ToggleLeft,
  ToggleRight,
  FileText
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
  });

  // Add new states for attendance tracking
  const [attendanceMode, setAttendanceMode] = useState("assessment"); // "assessment" or "manual"
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [manualAttendanceData, setManualAttendanceData] = useState({});
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

  // Add state for submission history modal
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);

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
  
  // New effect to fetch manual attendance data when date changes or mode changes
  useEffect(() => {
    const fetchManualAttendance = async () => {
      if (attendanceMode !== "manual" || !selectedCourse?.id) return;
      
      try {
        setIsLoadingAttendance(true);
        
        // Fetch attendance records for the selected month
        const firstDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
        const lastDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
        
        // For each day in the month, check if there's attendance data
        const attendanceMap = {};
        
        for (let day = new Date(firstDayOfMonth); day <= lastDayOfMonth; day.setDate(day.getDate() + 1)) {
          const dateStr = day.toISOString().split('T')[0];
          try {
            const response = await getAttendanceByDate(selectedCourse.id, dateStr);
            if (response && Array.isArray(response)) {
              attendanceMap[dateStr] = response;
            }
          } catch (err) {
            console.warn(`No attendance for ${dateStr}:`, err);
          }
        }
        
        setManualAttendanceData(attendanceMap);
      } catch (err) {
        console.error("Error fetching manual attendance:", err);
      } finally {
        setIsLoadingAttendance(false);
      }
    };
    
    fetchManualAttendance();
  }, [selectedCourse?.id, selectedMonth, attendanceMode]);

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
      
    setOverallStats({
      averageAttendance: avgAttendance * 100,
      totalStudents: totalStudentsCount,
      totalAssessments: assessmentsList.length,
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

  // Modified getDateCellClass to handle both modes
  const getDateCellClass = (day) => {
    if (!day.isCurrentMonth) return "opacity-30"; // Dimmed for non-current month days
    if (day.isWeekend) return "bg-gray-50"; // Light gray for weekends
    
    const dateStr = day.date.toISOString().split('T')[0];
    
    if (attendanceMode === "manual") {
      // Handle manual attendance mode
      const hasAttendanceRecord = manualAttendanceData[dateStr] && manualAttendanceData[dateStr].length > 0;
      
      if (hasAttendanceRecord) {
        return "bg-green-50 border-green-200 border-l-4 cursor-pointer";
      }
      
      // Date has no attendance record but is in the past or today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (day.date <= today) {
        return "bg-yellow-50 border-yellow-100 border-dashed border-2 cursor-pointer";
      }
      
      return "bg-white cursor-pointer";
    } else {
      // Assessment-based attendance (original logic)
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
    }
  };

  // Handle calendar date click for manual attendance
  const handleDateClick = (date) => {
    if (attendanceMode === "manual") {
      setSelectedDate(date);
      setShowAttendanceModal(true);
    }
  };

  // Handle refresh data
  const handleRefreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Updated handleSaveAttendance function to properly handle attendance IDs
  const handleSaveAttendance = async (dateStr, attendanceRecords) => {
    try {
      setIsLoadingAttendance(true);
      console.log("Saving attendance for date:", dateStr);
      console.log("Records to save:", attendanceRecords);
      
      // Check if attendance already exists for this date
      const existingRecords = manualAttendanceData[dateStr] || [];
      
      // If we have no existing records for this date, create all records in batch
      if (existingRecords.length === 0) {
        console.log("Creating new attendance records in batch");
        try {
          await createAttendance({
            courseId: selectedCourse.id,
            date: dateStr,
            records: attendanceRecords.map(record => ({
              student_id: record.student_id,
              status: record.status
            }))
          });
        } catch (err) {
          if (err.message && err.message.includes("already exists")) {
            console.warn("Some records already exist, falling back to individual updates");
            // If batch create fails, try individual updates
            for (const record of attendanceRecords) {
              try {
                // Try to create each record individually
                await createAttendance({
                  courseId: selectedCourse.id,
                  date: dateStr,
                  records: [{
                    student_id: record.student_id,
                    status: record.status
                  }]
                });
              } catch (innerErr) {
                console.error(`Failed to create individual record for student ${record.student_id}:`, innerErr);
                // Continue with next record even if one fails
              }
            }
          } else {
            throw err; // Re-throw if it's not a duplicate error
          }
        }
      } else {
        // Update existing records individually
        console.log("Processing updates to existing records");
        
        for (const record of attendanceRecords) {
          // Find if this student already has a record
          const existingRecord = existingRecords.find(r => 
            String(r.student_id) === String(record.student_id) || 
            String(r.user_id) === String(record.student_id)
          );
          
          // Use attendance_id instead of id - this is the key fix
          if (existingRecord && existingRecord.attendance_id) {
            // Use the correct ID from the existing record
            console.log(`Updating existing record ID ${existingRecord.attendance_id} for student ${record.student_id}`);
            try {
              await updateAttendanceStatus(existingRecord.attendance_id, record.status);
            } catch (updateErr) {
              console.error(`Failed to update attendance for student ${record.student_id}:`, updateErr);
            }
          } else if (record.id) {
            // Use the ID from the record itself if available
            console.log(`Using provided record ID ${record.id} for student ${record.student_id}`);
            try {
              await updateAttendanceStatus(record.id, record.status);
            } catch (updateErr) {
              console.error(`Failed to update attendance using record ID for student ${record.student_id}:`, updateErr);
            }
          } else {
            // Create a new record
            console.log(`Creating new record for student ${record.student_id}`);
            try {
              await createAttendance({
                courseId: selectedCourse.id,
                date: dateStr,
                records: [{
                  student_id: record.student_id,
                  status: record.status
                }]
              });
            } catch (createErr) {
              console.error(`Failed to create record for student ${record.student_id}:`, createErr);
            }
          }
        }
      }
      
      // Refresh attendance data
      console.log("Refreshing attendance data for date:", dateStr);
      const response = await getAttendanceByDate(selectedCourse.id, dateStr);
      
      if (response && Array.isArray(response)) {
        console.log(`Successfully fetched ${response.length} attendance records for ${dateStr}`);
        setManualAttendanceData(prev => ({
          ...prev,
          [dateStr]: response
        }));
      }
      
      setShowAttendanceModal(false);
    } catch (err) {
      console.error("Error saving attendance:", err);
      
      // Provide a more helpful error message based on the specific error
      let errorMessage = "Failed to save attendance records";
      
      if (err.message && err.message.includes("already exists")) {
        errorMessage = "Some attendance records already exist for this date. Please refresh and try again.";
      } else if (err.message && err.message.includes("undefined")) {
        errorMessage = "Could not find attendance record IDs. Try refreshing the page.";
      }
      
      alert(errorMessage);
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  // Handle student select for attendance view
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
  
  // Handle opening submission history modal
  const handleViewSubmissionHistory = (student, e) => {
    // Prevent triggering the row click (handleStudentSelect)
    e.stopPropagation();
    
    // Set the selected student for the history modal
    setSelectedStudentForHistory(student);
    
    // Show the submission history modal
    setShowSubmissionModal(true);
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

  // Header for statistics display - updated color scheme
  const renderStatistics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-gray-700 text-sm font-medium mb-2">Average Attendance</h3>
            <p className="text-3xl font-bold text-[#212529]">{overallStats.averageAttendance.toFixed(1)}%</p>
          </div>
          <div className="p-3 bg-[#F6BA18] rounded-lg shadow-sm">
            <UserCheck size={24} className="text-[#212529]" />
          </div>
        </div>
        <p className="text-gray-600 text-xs mt-4">Class participation rate</p>
      </div>

      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-gray-700 text-sm font-medium mb-2">Total Students</h3>
            <p className="text-3xl font-bold text-[#212529]">{overallStats.totalStudents}</p>
          </div>
          <div className="p-3 bg-[#F6BA18] rounded-lg shadow-sm">
            <Users size={24} className="text-[#212529]" />
          </div>
        </div>
        <p className="text-gray-600 text-xs mt-4">Enrolled learners</p>
      </div>

      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-gray-700 text-sm font-medium mb-2">Assessments</h3>
            <p className="text-3xl font-bold text-[#212529]">{overallStats.totalAssessments}</p>
          </div>
          <div className="p-3 bg-[#F6BA18] rounded-lg shadow-sm">
            <ClipboardList size={24} className="text-[#212529]" />
          </div>
        </div>
        <p className="text-gray-600 text-xs mt-4">Published assessments</p>
      </div>
    </div>
  );

  // Render calendar - updated color scheme
  const renderCalendar = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <div className="p-6 bg-gradient-to-r from-[#212529] to-[#343a40] text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Attendance Calendar</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-white/15 rounded-lg transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="text-lg font-medium w-44 text-center">{formatMonthYear(selectedMonth)}</span>
            <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-white/15 rounded-lg transition-colors">
              <ChevronRight size={18} />
            </button>
            <button onClick={resetToCurrentMonth} className="p-2 hover:bg-white/15 rounded-lg transition-colors ml-2" title="Go to current month">
              <CalendarIcon size={18} />
            </button>
          </div>
        </div>

        {/* Updated toggle switch for attendance mode */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <span className={`text-sm ${attendanceMode === 'assessment' ? 'font-medium' : 'text-gray-400'}`}>
            Assessment-Based
          </span>
          <button 
            onClick={() => setAttendanceMode(prev => prev === 'assessment' ? 'manual' : 'assessment')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              attendanceMode === 'assessment' ? 'bg-gray-600' : 'bg-[#F6BA18]'
            }`}
          >
            <span 
              className={`block w-4 h-4 rounded-full bg-white shadow-sm absolute top-1 transition-all ${
                attendanceMode === 'assessment' ? 'left-1' : 'left-7'
              }`} 
            />
          </button>
          <span className={`text-sm ${attendanceMode === 'manual' ? 'font-medium' : 'text-gray-400'}`}>
            Manual Tracking
          </span>
        </div>
        
        {selectedStudent && attendanceMode === 'assessment' ? (
          <div className="bg-[#343a40]/70 p-3.5 rounded-lg backdrop-blur-sm shadow-inner">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#F6BA18] flex items-center justify-center text-lg font-bold text-[#212529] shadow-sm">
                {selectedStudent.name[0]}
              </div>
              <div>
                <h3 className="font-semibold">{selectedStudent.name}</h3>
                <div className="flex items-center gap-2 text-sm mt-0.5">
                  <span className="bg-[#F6BA18]/20 px-2.5 py-0.5 rounded text-xs text-[#F6BA18]">
                    Attendance: {getAttendancePercentage(selectedStudent.id)}%
                  </span>
                  <span className="bg-white/20 px-2.5 py-0.5 rounded text-xs">
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
        ) : attendanceMode === 'assessment' ? (
          <div className="bg-[#343a40]/70 p-3.5 rounded-lg backdrop-blur-sm shadow-inner">
            <p className="text-center text-sm">Select a student to view their attendance</p>
          </div>
        ) : (
          <div className="bg-[#343a40]/70 p-3.5 rounded-lg backdrop-blur-sm shadow-inner">
            <p className="text-center text-sm">Click on a date to manage attendance for all students</p>
          </div>
        )}
      </div>

      {/* Calendar content with days - leave mostly unchanged for functionality */}
      <div className="p-4">
        {/* Days of week headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days grid with date click handling */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((day, i) => {
            const dateStr = day.date.toISOString().split('T')[0];
            const dateStatus = selectedStudent && attendanceMode === "assessment" 
              ? getDateCellStatus(day.date) 
              : { status: 'none' };
            
            const dayAssessments = assessments.filter(assessment => 
              isDateInRange(day.date, assessment.created_at || assessment.createdAt, assessment.due_date)
            );
            const hasAssessments = dayAssessments.length > 0;
            
            // Get manual attendance info if in manual mode
            const hasManualAttendance = attendanceMode === "manual" && manualAttendanceData[dateStr]?.length > 0;
            const presentCount = hasManualAttendance ? 
              manualAttendanceData[dateStr].filter(record => record.status === "present").length : 0;
            const absentCount = hasManualAttendance ? 
              manualAttendanceData[dateStr].filter(record => record.status === "absent").length : 0;
            const lateCount = hasManualAttendance ? 
              manualAttendanceData[dateStr].filter(record => record.status === "late").length : 0;
            const totalStudents = students.length;
            
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
                className={`p-2 min-h-[80px] border rounded-lg transition-all relative hover:shadow-sm ${getDateCellClass(day)}`}
                onClick={() => handleDateClick(day.date)}
              >
                <div className={`text-sm ${day.isCurrentMonth ? 'font-medium' : 'text-gray-400'}`}>
                  {day.date.getDate()}
                </div>
                
                {/* Show different indicators based on attendance mode */}
                {attendanceMode === "manual" && hasManualAttendance && (
                  <div className="mt-2 text-xs">
                    {presentCount === 0 && absentCount === 0 && lateCount === 0 ? (
                      <div className="bg-indigo-100 border border-indigo-300 text-indigo-800 font-medium px-2 py-1 rounded flex items-center justify-center space-x-1 shadow-sm">
                        <AlertCircle size={12} />
                        <span>Not marked</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-green-600 font-medium">
                          Present: {presentCount}/{totalStudents}
                        </div>
                        {lateCount > 0 && (
                          <div className="text-yellow-600 font-medium">
                            Late: {lateCount}/{totalStudents}
                          </div>
                        )}
                        {absentCount > 0 && (
                          <div className="text-red-600 font-medium">
                            Absent: {absentCount}/{totalStudents}
                          </div>
                        )}
                        {totalStudents > (presentCount + absentCount + lateCount) && (
                          <div className="text-amber-600 font-medium">
                            Unmarked: {totalStudents - (presentCount + absentCount + lateCount)}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                {/* Keep existing assessment indicators if in assessment mode */}
                {attendanceMode === "assessment" && (
                  <>
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
                    
                    {/* Assessment details shown for all users */}
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
                    
                    {/* Student-specific assessment stats */}
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
                    
                    {/* Submission indicators */}
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
                    
                    {/* Progress bar */}
                    {selectedStudent && dateStatus.status === 'partial' && (
                      <div className="absolute bottom-1 left-1 right-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400" 
                          style={{ width: `${dateStatus.progress * 100}%` }}
                        ></div>
                      </div>
                    )}
                    
                    {/* Status indicators */}
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
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Updated legend with mode-specific descriptions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-4 text-sm">
          {attendanceMode === "assessment" ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-green-100 border-l-4 border-green-500"></div>
                <span className="text-gray-700">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-yellow-100 border-l-4 border-yellow-500"></div>
                <span className="text-gray-700">Partial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-red-100 border-l-4 border-red-500"></div>
                <span className="text-gray-700">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-green-500 text-white text-xs">
                  <Check size={10} />
                  <span className="text-xs font-bold ml-1 text-white">3</span>
                </div>
                <span className="text-gray-700">On-time Submissions</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-green-50 border-l-4 border-green-200"></div>
                <span className="text-gray-700">Has Attendance Record</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-yellow-50 border-dashed border-2 border-yellow-100"></div>
                <span className="text-gray-700">No Attendance Record</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-white"></div>
                <span className="text-gray-700">Future Date</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Updated student list with refreshed design
  const renderStudentList = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-full">
      <div className="p-6 bg-gradient-to-r from-[#212529] to-[#343a40] text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Learners</h2>
          
          <button
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="p-2 hover:bg-white/15 rounded-lg transition-colors"
            title="Refresh data"
          >
            {isRefreshing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <RefreshCw size={18} />
            )}
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search learners..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-gray-700/50 text-white placeholder:text-gray-400 border border-gray-600 rounded-lg py-2.5 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-[#F6BA18] transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>

        {/* Updated filter section with responsive design */}
        <div className="mt-4">
          <div className="text-gray-400 text-sm mb-2">Filter by:</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm flex-1 sm:flex-none ${
                filterType === "all"
                  ? "bg-[#F6BA18] text-[#212529] font-medium"
                  : "bg-gray-700/50 text-white/70 hover:bg-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("present")}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm flex-1 sm:flex-none ${
                filterType === "present"
                  ? "bg-[#F6BA18] text-[#212529] font-medium"
                  : "bg-gray-700/50 text-white/70 hover:bg-gray-700"
              }`}
            >
              <span className="sm:hidden">High</span>
              <span className="hidden sm:inline">High Attendance</span>
            </button>
            <button
              onClick={() => setFilterType("absent")}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm flex-1 sm:flex-none ${
                filterType === "absent"
                  ? "bg-[#F6BA18] text-[#212529] font-medium"
                  : "bg-gray-700/50 text-white/70 hover:bg-gray-700"
              }`}
            >
              <span className="sm:hidden">Low</span>
              <span className="hidden sm:inline">Low Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student listing - updated design with improved overflow handling */}
      <div className="overflow-y-auto bg-gray-50" style={{ maxHeight: "calc(100vh - 370px)" }}>
        {isRefreshing ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#212529]"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 h-[60vh]">
            <AlertCircle size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500">No learners found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredStudents.map(student => {
              const attendanceInfo = studentStats[student.id] || {
                attendanceRate: 0,
                submissionCount: 0,
                onTimeCount: 0,
                lateCount: 0,
              };
              
              const attendancePercentage = getAttendancePercentage(student.id);
              const attendanceColor = 
                attendancePercentage > 70 ? '#10b981' :  // green
                attendancePercentage > 30 ? '#f59e0b' :  // yellow
                '#ef4444';                              // red
              
              return (
                <div
                  key={student.id}
                  className={`px-4 py-4 transition-all bg-white ${
                    selectedStudent?.id === student.id
                      ? "bg-gray-50 border-l-4 border-[#F6BA18]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {/* Content Container - modified to use flex-grow instead of flex and add min-width */}
                    <div 
                      className="flex-grow min-w-0 flex items-center gap-3 cursor-pointer"
                      onClick={() => handleStudentSelect(student)}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#212529] to-gray-700 flex items-center justify-center text-sm font-medium text-white shadow-sm">
                        {student.name[0]}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{student.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{student.email}</p>
                      </div>
                    </div>
                    
                    {/* Actions Section - modified to be more compact and handle overflow */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <div className="hidden sm:flex items-center gap-2">
                        <div className="w-16 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{ 
                              width: `${attendancePercentage}%`, 
                              backgroundColor: attendanceColor 
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold whitespace-nowrap" style={{ color: attendanceColor }}>
                          {attendancePercentage}%
                        </span>
                      </div>
                      
                      <button
                        onClick={(e) => handleViewSubmissionHistory(student, e)}
                        className="p-1.5 rounded-md border border-gray-200 bg-white hover:bg-[#F6BA18] hover:text-[#212529] hover:border-[#F6BA18] text-gray-600 transition-colors flex-shrink-0"
                        title="View submission history"
                      >
                        <FileText size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Mobile view stats - show below name for small screens */}
                  <div className="sm:hidden mt-2 flex items-center gap-2">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${attendancePercentage}%`, 
                          backgroundColor: attendanceColor 
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold whitespace-nowrap" style={{ color: attendanceColor }}>
                      {attendancePercentage}%
                    </span>
                  </div>
                  
                  {/* Submission count - moved below */}
                  <div className="text-xs text-gray-500 mt-1">
                    {attendanceInfo.submissionCount} submissions
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

      {/* Attendance Modal */}
      {showAttendanceModal && selectedDate && (
        <AttendanceModal
          isOpen={showAttendanceModal}
          onClose={() => setShowAttendanceModal(false)}
          date={selectedDate}
          students={students}
          existingAttendance={manualAttendanceData[selectedDate.toISOString().split('T')[0]] || []}
          onSave={handleSaveAttendance}
          isLoading={isLoadingAttendance}
        />
      )}

      {/* Submission History Modal */}
      {showSubmissionModal && (
        <SubmissionHistoryModal
          isOpen={showSubmissionModal}
          onClose={() => setShowSubmissionModal(false)}
          student={selectedStudentForHistory}
          assessments={assessments}
        />
      )}
    </div>
  );
};

export default TeacherAttendance;
