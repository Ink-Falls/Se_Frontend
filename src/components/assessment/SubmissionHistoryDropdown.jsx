import React, { useState, useEffect } from 'react';
import { ChevronDown, Clock, Check, AlertTriangle } from 'lucide-react';
import { getUserSubmission } from '../../services/assessmentService';

/** / DEPRECATED-----------------------------------------------------------------
 * A dropdown component that displays submission history for an assessment
 * Uses the existing getUserSubmission function to fetch the submission data
 * 
 * @param {Object} props - Component props
 * @param {number} props.assessmentId - The ID of the assessment
 * @param {Object} props.currentSubmission - Currently selected submission object
 * @param {Function} props.onSelectSubmission - Callback when a submission is selected
 * @param {number} props.maxScore - Maximum possible score for the assessment
 * @returns {JSX.Element} The SubmissionHistoryDropdown component
 */
const SubmissionHistoryDropdown = ({ 
  assessmentId, 
  currentSubmission, 
  onSelectSubmission,
  maxScore = 0
}) => {
  const [submissions, setSubmissions] = useState([]);
  const [displaySubmissions, setDisplaySubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!assessmentId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Use the existing getUserSubmission function
        // We'll treat the single submission as our current submission
        const response = await getUserSubmission(assessmentId, true);
        
        if (response.success && response.submission) {
          // Store the original submission data
          const originalSubmission = {
            ...response.submission,
            total_score: response.submission.total_score || 0
          };
          
          // Create a display version with formatted time
          const displaySubmission = {
            ...originalSubmission,
            formatted_time: new Date(response.submission.submit_time).toLocaleString()
          };
          
          // Store both versions
          setSubmissions([originalSubmission]);
          setDisplaySubmissions([displaySubmission]);
          
          // If there's no current submission selected and we have one, select it
          if (!currentSubmission && onSelectSubmission) {
            onSelectSubmission(originalSubmission);
          }
        } else {
          setSubmissions([]);
          setDisplaySubmissions([]);
        }
      } catch (err) {
        console.error('Error fetching submission:', err);
        setError(err.message || 'Failed to load submission history');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [assessmentId, currentSubmission, onSelectSubmission]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (index) => {
    if (onSelectSubmission && submissions[index]) {
      onSelectSubmission(submissions[index]);
    }
    setIsOpen(false);
  };

  // Get status badge styling based on submission status
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'graded':
        return { color: 'bg-green-100 text-green-800', icon: <Check size={14} className="mr-1" /> };
      case 'late':
        return { color: 'bg-red-100 text-red-800', icon: <AlertTriangle size={14} className="mr-1" /> };
      case 'submitted':
        return { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} className="mr-1" /> };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: <Clock size={14} className="mr-1" /> };
    }
  };

  if (loading) {
    return <div role="status" className="h-10 w-full bg-gray-100 animate-pulse rounded-md"></div>;
  }

  if (error) {
    return (
      <div className="p-2 bg-red-50 text-red-600 text-sm rounded-md">
        Error: {error}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="p-2 bg-gray-50 text-gray-600 text-sm rounded-md">
        No submissions found
      </div>
    );
  }

  // Find currently selected submission
  const selectedSubmissionIndex = currentSubmission 
    ? submissions.findIndex(sub => sub.id === currentSubmission.id)
    : 0;
  
  const selectedSubmission = selectedSubmissionIndex >= 0 
    ? submissions[selectedSubmissionIndex]
    : submissions[0];
  
  const selectedDisplaySubmission = selectedSubmissionIndex >= 0
    ? displaySubmissions[selectedSubmissionIndex]
    : displaySubmissions[0];
    
  const statusBadge = getStatusBadge(selectedSubmission?.status);

  return (
    <div className="relative">
      <div className="text-sm text-gray-500 mb-1">Submission</div>
      
      {/* Dropdown trigger button */}
      <button
        onClick={toggleDropdown}
        aria-label="Submission"
        className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <span className="mr-2 text-sm">
            {selectedDisplaySubmission?.formatted_time || new Date(selectedSubmission?.submit_time).toLocaleString()}
          </span>
          <span className={`px-2 py-0.5 text-xs flex items-center rounded-full ${statusBadge.color}`}>
            {statusBadge.icon}
            {selectedSubmission?.status || 'Unknown'}
          </span>
        </div>

        <div className="flex items-center">
          {selectedSubmission?.total_score !== undefined && (
            <span className="mr-2 font-medium">
              Score: {selectedSubmission.total_score}/{maxScore}
            </span>
          )}
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      
      {/* Dropdown menu - only show if we have multiple submissions (future support) */}
      {isOpen && submissions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {displaySubmissions.map((displaySubmission, index) => {
            const submission = submissions[index];
            const subStatusBadge = getStatusBadge(submission.status);
            return (
              <button
                key={submission.id || index}
                onClick={() => handleSelect(index)}
                className={`w-full text-left p-2 hover:bg-gray-50 flex items-center justify-between ${
                  selectedSubmission?.id === submission.id ? 'bg-yellow-50' : ''
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    Attempt {index + 1}
                  </span>
                  <span className="text-xs text-gray-500">
                    {displaySubmission.formatted_time || new Date(submission.submit_time).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-0.5 mr-2 text-xs flex items-center rounded-full ${subStatusBadge.color}`}>
                    {subStatusBadge.icon}
                    {submission.status || 'Unknown'}
                  </span>
                  {submission.total_score !== undefined && (
                    <span className="font-medium text-sm">
                      {submission.total_score}/{maxScore}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubmissionHistoryDropdown;
