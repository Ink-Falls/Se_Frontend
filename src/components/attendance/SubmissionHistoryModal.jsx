import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, FileText, AlertCircle, Check, ExternalLink, Loader, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAssessmentSubmissions, getSubmissionDetails, getAssessmentById } from '../../services/assessmentService';

const SubmissionHistoryModal = ({ isOpen, onClose, student, assessments }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionsByDate, setSubmissionsByDate] = useState({});
  const navigate = useNavigate();

  // Add a new state to track which date is expanded for more details
  const [expandedDate, setExpandedDate] = useState(null);

  useEffect(() => {
    if (!isOpen || !student) return;

    const fetchSubmissions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const allSubmissions = [];
        
        // Fetch submissions for each assessment
        for (const assessment of assessments) {
          try {
            const response = await getAssessmentSubmissions(assessment.id);
            
            if (response.success && Array.isArray(response.submissions)) {
              // Filter submissions for this student and add assessment title
              const studentSubmissions = response.submissions
                .filter(sub => 
                  sub.user_id === student.id || 
                  sub.user?.id === student.id
                )
                .map(sub => ({
                  ...sub,
                  assessment_title: assessment.title,
                  assessment_type: assessment.type,
                  module_id: assessment.module_id
                }));
                
              allSubmissions.push(...studentSubmissions);
            }
          } catch (err) {
            console.warn(`Error fetching submissions for assessment ${assessment.id}:`, err);
          }
        }

        // Group submissions by date
        const groupedSubmissions = groupSubmissionsByDate(allSubmissions);
        setSubmissionsByDate(groupedSubmissions);
      } catch (err) {
        console.error("Error fetching student submissions:", err);
        setError("Failed to load submission history");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [isOpen, student, assessments]);

  // Group submissions by date
  const groupSubmissionsByDate = (submissions) => {
    return submissions.reduce((acc, submission) => {
      if (!submission.submit_time) return acc;
      
      const submitDate = submission.submit_time.split('T')[0]; // Extract YYYY-MM-DD
      
      if (!acc[submitDate]) {
        acc[submitDate] = [];
      }
      
      acc[submitDate].push(submission);
      return acc;
    }, {});
  };

  // Format submission time
  const formatTime = (timeString) => {
    if (!timeString) return '—';
    return new Date(timeString).toLocaleTimeString();
  };

  // Format date for display
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Toggle expanded date details
  const toggleDateExpansion = (date) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  // Count submissions by status for a specific date
  const getSubmissionStatusCount = (submissions) => {
    const counts = { onTime: 0, late: 0, total: submissions.length };
    
    submissions.forEach(submission => {
      if (submission.is_late) {
        counts.late++;
      } else {
        counts.onTime++;
      }
    });
    
    return counts;
  };

  // Updated handleViewSubmission to pre-fetch data before navigating
  const handleViewSubmission = async (submissionId, assessmentId) => {
    try {
      // Set loading state for the button
      const clickedButton = document.activeElement;
      if (clickedButton) {
        clickedButton.disabled = true;
        clickedButton.innerHTML = '<div class="flex items-center gap-2"><div class="w-4 h-4 border-2 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>Loading...</div>';
      }
      
      // Step 1: Fetch submission details
      const submissionResponse = await getSubmissionDetails(submissionId);
      if (!submissionResponse.success) {
        throw new Error(submissionResponse.message || 'Failed to fetch submission details');
      }
      
      // Step 2: Fetch assessment details
      const assessmentResponse = await getAssessmentById(assessmentId, true);
      if (!assessmentResponse.success) {
        throw new Error(assessmentResponse.message || 'Failed to fetch assessment details');
      }
      
      // Step 3: Navigate with the complete data
      navigate(`/Teacher/Assessment/Submission/${submissionId}`, {
        state: {
          submission: submissionResponse.submission,
          assessment: assessmentResponse.assessment
        }
      });
      
      onClose();
    } catch (error) {
      console.error("Error fetching submission data:", error);
      alert("Error loading submission: " + (error.message || "Please try again"));
      
      // Reset button state if there was an error
      const clickedButton = document.activeElement;
      if (clickedButton) {
        clickedButton.disabled = false;
        clickedButton.innerHTML = '<div class="flex items-center gap-1.5"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M7 7L17 17"></path></svg>View Details</div>';
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200">
        {/* Header section - updated with new color scheme */}
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
            <h3 className="font-medium text-white mb-1">Submission History</h3>
            <p className="text-sm text-gray-300">
              Showing all assessment submissions for this learner
            </p>
            
            {/* Add an explanation about calendar indicators - updated styling */}
            <div className="mt-3 bg-[#F6BA18]/20 rounded-lg p-3 text-xs">
              <div className="flex items-center mb-2">
                <AlertTriangle size={14} className="mr-1 text-[#F6BA18]" />
                <span className="font-medium text-[#F6BA18]">Calendar Indicators Explained:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-200">
                <li>Numbers in <span className="text-green-300 font-medium">green circles</span> show on-time submissions made that day</li>
                <li>Numbers in <span className="text-yellow-300 font-medium">yellow circles</span> show late submissions made that day</li>
                <li>Click on any date below to see submission details from that day</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Content - updated styling */}
        <div className="flex-grow overflow-y-auto p-5 bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader size={40} className="text-[#212529] animate-spin mb-4" />
              <p className="text-gray-500">Loading submission history...</p>
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
          ) : Object.keys(submissionsByDate).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText size={40} className="text-gray-300 mb-4" />
              <p className="text-gray-500">No submissions found for this learner</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(submissionsByDate)
                .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                .map(([date, submissions]) => {
                  const isExpanded = expandedDate === date;
                  const statusCounts = getSubmissionStatusCount(submissions);
                  
                  return (
                    <div key={date} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
                      {/* Date header - updated styling */}
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
                        
                        {/* Add status indicators matching the calendar */}
                        <div className="ml-auto flex items-center gap-3">
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
                            <span>{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</span>
                            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Submissions list - updated styling */}
                      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px]' : 'max-h-0'}`}>
                        <div className="divide-y divide-gray-100 bg-white">
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
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
        
        {/* Footer - updated styling */}
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
