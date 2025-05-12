import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, FileText, AlertCircle, Check, ExternalLink, Loader, AlertTriangle, UserCheck, UserX, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAssessmentSubmissions, getSubmissionDetails, getAssessmentById } from '../../services/assessmentService';
import { getUserAttendanceInCourse } from '../../services/attendanceService';

const SubmissionHistoryModal = ({ isOpen, onClose, student, assessments }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionsByDate, setSubmissionsByDate] = useState({});
  const [attendanceByDate, setAttendanceByDate] = useState({});
  const [expandedDate, setExpandedDate] = useState(null);
  const [dateFilter, setDateFilter] = useState(''); // New state for date filtering
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen || !student) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([fetchSubmissions(), fetchAttendance()]);
      } catch (err) {
        console.error("Error fetching student data:", err);
        setError("Failed to load student history");
      } finally {
        setLoading(false);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const allSubmissions = [];

        for (const assessment of assessments) {
          try {
            const response = await getAssessmentSubmissions(assessment.id);

            if (response.success && Array.isArray(response.submissions)) {
              const studentSubmissions = response.submissions
                .filter(
                  (sub) =>
                    sub.user_id === student.id || sub.user?.id === student.id
                )
                .map((sub) => ({
                  ...sub,
                  assessment_title: assessment.title,
                  assessment_type: assessment.type,
                  module_id: assessment.module_id,
                }));

              allSubmissions.push(...studentSubmissions);
            }
          } catch (err) {
            console.warn(
              `Error fetching submissions for assessment ${assessment.id}:`,
              err
            );
          }
        }

        const groupedSubmissions = groupSubmissionsByDate(allSubmissions);
        setSubmissionsByDate(groupedSubmissions);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        throw err;
      }
    };

    const fetchAttendance = async () => {
      try {
        if (!assessments || assessments.length === 0) return;

        const courseId = assessments[0]?.course_id;
        if (!courseId) {
          console.warn("No course ID found to fetch attendance");
          return;
        }

        const attendanceRecords = await getUserAttendanceInCourse(
          courseId,
          student.id
        );

        if (Array.isArray(attendanceRecords)) {
          const attendanceMap = groupAttendanceByDate(attendanceRecords);
          setAttendanceByDate(attendanceMap);
        } else {
          console.warn("No attendance records found or invalid data format");
        }
      } catch (err) {
        console.error("Error fetching attendance records:", err);
      }
    };

    fetchData();
  }, [isOpen, student, assessments]);

  const groupAttendanceByDate = (records) => {
    return records.reduce((acc, record) => {
      if (!record.date) return acc;

      const recordDate = record.date.split('T')[0];

      if (!acc[recordDate]) {
        acc[recordDate] = [];
      }

      acc[recordDate].push(record);
      return acc;
    }, {});
  };

  const groupSubmissionsByDate = (submissions) => {
    return submissions.reduce((acc, submission) => {
      if (!submission.submit_time) return acc;

      const submitDate = submission.submit_time.split('T')[0];

      if (!acc[submitDate]) {
        acc[submitDate] = [];
      }

      acc[submitDate].push(submission);
      return acc;
    }, {});
  };

  const getAllDates = () => {
    const allDates = new Set([
      ...Object.keys(submissionsByDate),
      ...Object.keys(attendanceByDate)
    ]);

    return Array.from(allDates).sort((a, b) => new Date(b) - new Date(a));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    date.setHours(12, 0, 0, 0);

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAttendanceStatus = (date) => {
    const dateObj = new Date(date);
    dateObj.setHours(12, 0, 0, 0);
    const normalizedDate = dateObj.toISOString().split('T')[0];

    const records = attendanceByDate[normalizedDate] || [];
    if (records.length === 0) return null;

    return records[0].status;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "—";
    return new Date(timeString).toLocaleTimeString();
  };

  const toggleDateExpansion = (date) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  const getSubmissionStatusCount = (submissions) => {
    const counts = { onTime: 0, late: 0, total: submissions.length };

    submissions.forEach((submission) => {
      if (submission.is_late) {
        counts.late++;
      } else {
        counts.onTime++;
      }
    });

    return counts;
  };

  const handleViewSubmission = async (submissionId, assessmentId) => {
    try {
      const clickedButton = document.activeElement;
      if (clickedButton) {
        clickedButton.disabled = true;
        clickedButton.innerHTML =
          '<div class="flex items-center gap-2"><div class="w-4 h-4 border-2 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>Loading...</div>';
      }

      const submissionResponse = await getSubmissionDetails(submissionId);
      if (!submissionResponse.success) {
        throw new Error(
          submissionResponse.message || "Failed to fetch submission details"
        );
      }

      const assessmentResponse = await getAssessmentById(assessmentId, true);
      if (!assessmentResponse.success) {
        throw new Error(
          assessmentResponse.message || "Failed to fetch assessment details"
        );
      }

      navigate(`/Teacher/Assessment/Submission/${submissionId}`, {
        state: {
          submission: submissionResponse.submission,
          assessment: assessmentResponse.assessment,
        },
      });

      onClose();
    } catch (error) {
      console.error("Error fetching submission data:", error);
      alert(
        "Error loading submission: " +
          (error.message || "Please try again")
      );

      const clickedButton = document.activeElement;
      if (clickedButton) {
        clickedButton.disabled = false;
        clickedButton.innerHTML =
          '<div class="flex items-center gap-1.5"><ExternalLink size={14} />View Details</div>';
      }
    }
  };

  const getAttendanceStatusStyle = (status) => {
    switch (status) {
      case "present":
        return {
          text: "Present",
          bg: "bg-green-100",
          text_color: "text-green-700",
          icon: <UserCheck size={14} className="text-green-700" />,
        };
      case "late":
        return {
          text: "Late",
          bg: "bg-amber-100",
          text_color: "text-amber-700",
          icon: <Clock size={14} className="text-amber-700" />,
        };
      case "absent":
        return {
          text: "Absent",
          bg: "bg-red-100",
          text_color: "text-red-700",
          icon: <UserX size={14} className="text-red-700" />,
        };
      default:
        return {
          text: "Unknown",
          bg: "bg-gray-100",
          text_color: "text-gray-600",
          icon: <AlertCircle size={14} className="text-gray-600" />,
        };
    }
  };

  const getFilteredDates = () => {
    const allDates = getAllDates();

    if (!dateFilter.trim()) {
      return allDates;
    }

    return allDates.filter(date => {
      const formattedDate = formatDate(date).toLowerCase();
      return formattedDate.includes(dateFilter.toLowerCase());
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200">
        <div className="p-6 bg-gradient-to-r from-[#212529] to-[#343a40] text-white rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-700/80 flex items-center justify-center text-xl font-bold shadow-inner border-2 border-[#F6BA18]/50">
                {student?.name?.[0] || "?"}
              </div>
              <div>
                <h2 className="text-xl font-bold">{student?.name || "Student"}</h2>
                <p className="text-gray-300">{student?.email || "No email available"}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-700 text-white transition-all"
            >
              <X size={22} />
            </button>
          </div>
          
          <div className="mt-5 py-3 px-4 bg-gray-700/40 rounded-lg backdrop-blur-sm shadow-inner">
            <h3 className="font-medium text-white mb-1">Activity History</h3>
            <p className="text-sm text-gray-300">
              Showing manual attendance records and assessment submissions for this learner
            </p>
            
            <div className="mt-3 bg-[#F6BA18]/20 rounded-lg p-3 text-xs">
              <div className="flex items-center mb-2">
                <AlertTriangle size={14} className="mr-1 text-[#F6BA18]" />
                <span className="font-medium text-[#F6BA18]">Attendance Status:</span>
              </div>
              <div className="flex flex-wrap gap-4 text-gray-200">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>Late</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Absent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search dates... (e.g., April, Monday, 2023)"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6BA18] focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto p-5 bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader size={40} className="text-[#212529] animate-spin mb-4" />
              <p className="text-gray-500">Loading student history...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle size={40} className="text-red-500 mb-4" />
              <p className="text-gray-700 font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-gray-700"
              >
                Retry
              </button>
            </div>
          ) : getFilteredDates().length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText size={40} className="text-gray-300 mb-4" />
              <p className="text-gray-500">
                {dateFilter ? "No records match your search" : "No records found for this learner"}
              </p>
              {dateFilter && (
                <button 
                  onClick={() => setDateFilter('')}
                  className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {getFilteredDates().map(date => {
                const isExpanded = expandedDate === date;
                const submissions = submissionsByDate[date] || [];
                const attendanceStatus = getAttendanceStatus(date);
                const statusStyle = attendanceStatus ? getAttendanceStatusStyle(attendanceStatus) : null;
                const hasSubmissions = submissions.length > 0;
                const statusCounts = hasSubmissions ? getSubmissionStatusCount(submissions) : { onTime: 0, late: 0, total: 0 };
                
                return (
                  <div key={date} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div 
                      className={`flex items-center gap-2 px-6 py-3.5 border-b cursor-pointer hover:bg-gray-100 transition-colors ${
                        isExpanded ? 'bg-gray-100' : 'bg-white'
                      }`}
                      onClick={() => toggleDateExpansion(date)}
                    >
                      <Calendar size={18} className="text-[#212529]" />
                      <span className="font-medium text-gray-800">
                        {formatDate(date)}
                      </span>
                      
                      <div className="ml-auto flex flex-wrap items-center gap-3">
                        {statusStyle && (
                          <div className={`flex items-center gap-1.5 ${statusStyle.bg} ${statusStyle.text_color} px-2.5 py-1 rounded-full`}>
                            {statusStyle.icon}
                            <span className="text-xs font-medium">
                              {statusStyle.text}
                            </span>
                          </div>
                        )}
                        
                        {statusCounts.onTime > 0 && (
                          <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                            <Check size={14} />
                            <span className="text-xs font-medium">{statusCounts.onTime} On-time</span>
                          </div>
                        )}
                        
                        {statusCounts.late > 0 && (
                          <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full">
                            <Clock size={14} />
                            <span className="text-xs font-medium">{statusCounts.late} Late</span>
                          </div>
                        )}
                        
                        <div className={`text-sm flex items-center gap-1 ${
                          isExpanded ? 'text-[#212529] font-medium' : 'text-gray-500'
                        }`}>
                          <span>{hasSubmissions ? `${submissions.length} submission${submissions.length !== 1 ? 's' : ''}` : 'No submissions'}</span>
                          <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                               fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px]' : 'max-h-0'}`}>
                      <div className="divide-y divide-gray-100 bg-white">
                        {attendanceStatus && (
                          <div className={`px-6 py-4 ${statusStyle.bg}/40`}>
                            <h4 className="font-medium text-gray-700 mb-2">Attendance Record</h4>
                            <div className="flex flex-wrap items-center gap-4">
                              <div className={`flex items-center gap-2 ${statusStyle.text_color} font-medium`}>
                                {statusStyle.icon}
                                <span>{statusStyle.text}</span>
                              </div>
                              
                              {attendanceByDate[date]?.length > 0 && attendanceByDate[date][0].created_at && (
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                  <Clock size={14} />
                                  <span>Recorded at: {new Date(attendanceByDate[date][0].created_at).toLocaleTimeString()}</span>
                                </div>
                              )}
                              
                              {attendanceByDate[date]?.length > 0 && attendanceByDate[date][0].notes && (
                                <div className="w-full mt-2 text-sm text-gray-600">
                                  <strong>Notes:</strong> {attendanceByDate[date][0].notes}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {submissions.length > 0 && (
                          <>
                            <div className="px-6 py-3 bg-gray-50">
                              <h4 className="font-medium text-gray-700">Submissions</h4>
                            </div>
                            {submissions.map((submission) => (
                              <div key={submission.id} className="px-6 py-4 hover:bg-gray-50">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                  <div className="flex-grow">
                                    <h3 className="font-medium text-gray-900">
                                      {submission.assessment_title || "Unknown Assessment"}
                                    </h3>
                                    
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      <div className="flex items-center text-xs text-gray-500 gap-1">
                                        <Clock size={14} />
                                        <span>Submitted at: {formatTime(submission.submit_time)}</span>
                                      </div>
                                      
                                      <div className={`text-xs px-2 py-0.5 rounded-full ${
                                        submission.status === "submitted" 
                                          ? "bg-green-100 text-green-800" 
                                          : submission.status === "in_progress"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-gray-100 text-gray-800"
                                      }`}>
                                        {submission.status}
                                      </div>
                                      
                                      {submission.score !== null && (
                                        <div className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                          Score: {submission.score}/{submission.max_score || 'N/A'}
                                        </div>
                                      )}
                                      
                                      {submission.is_late && (
                                        <div className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                          Late submission
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <button
                                    onClick={() => handleViewSubmission(submission.id, submission.assessment_id)}
                                    className="flex items-center gap-1.5 text-sm px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#343a40] transition-colors"
                                  >
                                    <ExternalLink size={14} />
                                    View Details
                                  </button>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                        
                        {!attendanceStatus && submissions.length === 0 && (
                          <div className="px-6 py-8 text-center">
                            <p className="text-gray-500 text-sm">No records on this date</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-[#212529] bg-[#F6BA18] rounded-md hover:bg-[#e5ad16] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionHistoryModal;
