import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  AlertCircle,
  Search,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

const AttendanceModal = ({
  isOpen,
  onClose,
  date,
  students,
  existingAttendance,
  onSave,
  isLoading
}) => {
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  
  // Format the date for display
  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';
  
  // Initialize attendance records from existing data without a default status
  useEffect(() => {
    if (students && Array.isArray(students)) {
      const initialRecords = {};
      
      students.forEach(student => {
        // Check if there's an existing record for this student
        const existingRecord = Array.isArray(existingAttendance) ? 
          existingAttendance.find(record => 
            String(record.student_id) === String(student.id) || 
            String(record.user_id) === String(student.id)
          ) : null;
        
        initialRecords[student.id] = {
          student_id: student.id,
          // Only set status if there's an existing one, otherwise leave undefined
          status: existingRecord ? existingRecord.status : undefined,
          // Use attendance_id property from the API response (not id)
          id: existingRecord?.attendance_id
        };
        
        // Debug logs to help troubleshoot
        if (existingRecord) {
          console.log(`Found existing record for student ${student.id}: status=${existingRecord.status}, id=${existingRecord.attendance_id}`);
        }
      });
      
      setAttendanceRecords(initialRecords);
      setFilteredStudents(students);
    }
  }, [students, existingAttendance]);
  
  // Handle search filtering
  useEffect(() => {
    if (!students) return;
    
    if (!searchQuery) {
      setFilteredStudents(students);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = students.filter(student => {
      const fullName = student.name.toLowerCase();
      return fullName.includes(query);
    });
    
    setFilteredStudents(filtered);
  }, [searchQuery, students]);
  
  // Handle status change - correctly track the status
  const handleStatusChange = (studentId, status) => {
    console.log(`Setting status for student ${studentId} to ${status}`);
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        student_id: studentId,
        status: status
      }
    }));
  };
  
  // Handle save with better debugging
  const handleSave = () => {
    const dateStr = date.toISOString().split('T')[0];
    // Only include records where a status has been selected
    const records = Object.values(attendanceRecords).filter(record => record.status !== undefined);
    
    console.log("Saving attendance records:", records);
    if (records.length === 0) {
      console.warn("No attendance records to save - all statuses are undefined");
      alert("Please mark at least one student's attendance before saving");
      return;
    }
    
    onSave(dateStr, records);
  };
  
  // Mark all students with a specific status
  const markAll = (status) => {
    const updatedRecords = { ...attendanceRecords };
    
    filteredStudents.forEach(student => {
      updatedRecords[student.id] = {
        ...updatedRecords[student.id],
        status
      };
    });
    
    setAttendanceRecords(updatedRecords);
  };
  
  // Clear all selections
  const clearAll = () => {
    const updatedRecords = { ...attendanceRecords };
    
    filteredStudents.forEach(student => {
      updatedRecords[student.id] = {
        student_id: student.id,
        status: undefined
      };
    });
    
    setAttendanceRecords(updatedRecords);
  };
  
  // Get attendance status counts
  const getStatusCounts = () => {
    const counts = { present: 0, absent: 0, late: 0, unselected: 0, total: filteredStudents.length };
    
    filteredStudents.forEach(student => {
      const status = attendanceRecords[student.id]?.status;
      if (status) {
        counts[status]++;
      } else {
        counts.unselected++;
      }
    });
    
    return counts;
  };
  
  const statusCounts = getStatusCounts();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200">
        {/* Header - Updated color scheme */}
        <div className="p-6 bg-gradient-to-r from-[#212529] to-[#343a40] rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-xl font-bold">Attendance Record</h2>
              <p className="text-gray-300 mt-1">{formattedDate}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Search and bulk actions */}
          <div className="mt-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-grow w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students..."
                className="w-full bg-gray-700/50 text-white placeholder:text-gray-400 border border-gray-600 rounded-lg py-2.5 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-[#F6BA18] transition-all"
              />
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => markAll('present')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                <CheckCircle size={16} />
                <span>All Present</span>
              </button>
              <button
                onClick={() => markAll('absent')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                <XCircle size={16} />
                <span>All Absent</span>
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
              >
                <X size={16} />
                <span>Clear</span>
              </button>
            </div>
          </div>
          
          {/* Status counts - Updated design */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="bg-green-500/20 rounded-lg p-3 text-center backdrop-blur-sm">
              <span className="text-white text-xl font-bold">{statusCounts.present}</span>
              <p className="text-green-300 text-sm font-medium">Present</p>
            </div>
            <div className="bg-yellow-500/20 rounded-lg p-3 text-center backdrop-blur-sm">
              <span className="text-white text-xl font-bold">{statusCounts.late}</span>
              <p className="text-yellow-300 text-sm font-medium">Late</p>
            </div>
            <div className="bg-red-500/20 rounded-lg p-3 text-center backdrop-blur-sm">
              <span className="text-white text-xl font-bold">{statusCounts.absent}</span>
              <p className="text-red-300 text-sm font-medium">Absent</p>
            </div>
            <div className="bg-gray-500/20 rounded-lg p-3 text-center backdrop-blur-sm">
              <span className="text-white text-xl font-bold">{statusCounts.unselected}</span>
              <p className="text-gray-300 text-sm font-medium">Unselected</p>
            </div>
          </div>
        </div>
        
        {/* Student list - enhanced design */}
        <div className="flex-grow overflow-y-auto p-6 bg-gray-50">
          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle size={48} className="text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No students found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => {
                const record = attendanceRecords[student.id] || {};
                const status = record.status; // Could be undefined
                
                return (
                  <div 
                    key={student.id} 
                    className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-[#F6BA18]"
                  >
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
                      <div className="md:w-1/3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#212529] to-gray-700 flex items-center justify-center text-white font-bold shadow-sm">
                            {student.name[0]}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{student.name}</h3>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => handleStatusChange(student.id, 'present')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all ${
                              status === 'present'
                                ? 'bg-green-100 text-green-700 border-green-300 shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:bg-green-50'
                            }`}
                          >
                            <CheckCircle size={16} />
                            Present
                          </button>
                          
                          <button
                            onClick={() => handleStatusChange(student.id, 'late')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all ${
                              status === 'late'
                                ? 'bg-yellow-100 text-yellow-700 border-yellow-300 shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                            }`}
                          >
                            <Clock size={16} />
                            Late
                          </button>
                          
                          <button
                            onClick={() => handleStatusChange(student.id, 'absent')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all ${
                              status === 'absent'
                                ? 'bg-red-100 text-red-700 border-red-300 shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:bg-red-50'
                            }`}
                          >
                            <XCircle size={16} />
                            Absent
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer - Updated design */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || filteredStudents.length === 0 || statusCounts.unselected === statusCounts.total}
            className="px-5 py-2 text-[#212529] bg-[#F6BA18] rounded-md hover:bg-[#e5ad16] transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-800/30 border-t-gray-800 rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Check size={18} />
                Save Attendance
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;
