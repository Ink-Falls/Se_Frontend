import React, { useState, useEffect } from 'react';
import { X, Search, User, Check, UserCheck, UserX, Clock, Filter, Calendar, Plus, ChevronLeft, Info, AlertCircle } from 'lucide-react';

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
  const [modalStep, setModalStep] = useState('initial'); 
  const [showGuide, setShowGuide] = useState(false);
  
  // Format the date for display without timezone complications
  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';
  
  // Log the date for debugging
  console.log("Modal received date:", date);
  console.log("Modal formatted date for display:", formattedDate);
  
  // Determine if there are existing attendance records
  const hasExistingAttendance = existingAttendance && existingAttendance.length > 0;
  
  // Initialize attendance records from existing data without a default status
  useEffect(() => {
    if (!students) return;
    
    // Set modal step based on whether there's existing attendance
    setModalStep(hasExistingAttendance ? 'mark' : 'initial');
    
    // Create normalized map of existing attendance
    const existingMap = {};
    if (existingAttendance && existingAttendance.length > 0) {
      existingAttendance.forEach(record => {
        const studentId = String(record.student_id || record.user_id);
        existingMap[studentId] = {
          status: record.status,
          id: record.attendance_id || record.id,
          notes: record.notes
        };
      });
    }
    
    // Create normalized attendance records for all students
    const initialRecords = {};
    students.forEach(student => {
      const studentId = String(student.id);
      
      initialRecords[studentId] = {
        student_id: studentId,
        name: student.name,
        email: student.email,
        ...existingMap[studentId] // Spread existing attendance data if available
      };
    });
    
    setAttendanceRecords(initialRecords);
    setFilteredStudents(students);
  }, [students, existingAttendance, hasExistingAttendance]);
  
  // Handle search filtering
  useEffect(() => {
    if (!students) return;
    
    const lowercaseQuery = searchQuery.toLowerCase();
    
    const filtered = students.filter(student => {
      return (
        student.name.toLowerCase().includes(lowercaseQuery) || 
        (student.email && student.email.toLowerCase().includes(lowercaseQuery))
      );
    });
    
    setFilteredStudents(filtered);
  }, [searchQuery, students]);
  
  // Handle status change - correctly track the status
  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prevRecords => {
      const currentStatus = prevRecords[studentId]?.status;
      const newStatus = currentStatus === status ? undefined : status;
      
      return {
        ...prevRecords,
        [studentId]: {
          ...prevRecords[studentId],
          status: newStatus
        }
      };
    });
  };
  
  // Handle creating new attendance records directly from the initial step
  const handleCreateAttendance = () => {
    // When creating initial attendance, mark all students as present by default
    const defaultRecords = {};
    students.forEach(student => {
      const studentId = String(student.id);
      defaultRecords[studentId] = {
        student_id: studentId,
        name: student.name,
        email: student.email,
        status: "present" // Default to present
      };
    });
    
    setAttendanceRecords(defaultRecords);
    
    // Format date as YYYY-MM-DD without timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    console.log("Creating new attendance records for date:", dateStr);
    
    // Extract the records in the format expected by the API
    const records = students.map(student => ({
      student_id: student.id,
      status: "present" // Default all to present
    }));
    
    // Save the attendance records directly
    onSave(dateStr, records);
  };
  
  // Handle save with proper date formatting
  const handleSave = () => {
    // Format date as YYYY-MM-DD without timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    console.log("Modal saving with date:", dateStr);
    
    if (modalStep === 'initial') {
      // Move to the marking step and create attendance with all students present
      handleCreateAttendance();
      return;
    }
    
    // Get all records that have a status set (present, absent, or late)
    const records = Object.values(attendanceRecords).filter(record => 
      record.status === "present" || record.status === "absent" || record.status === "late"
    );
    
    if (records.length === 0) {
      alert("No attendance records to save. Please mark at least one student.");
      return;
    }
    
    // Save with the correct date string
    onSave(dateStr, records);
  };
  
  // Mark all students with a specific status
  const markAll = (status) => {
    const newRecords = {};
    Object.keys(attendanceRecords).forEach(studentId => {
      newRecords[studentId] = {
        ...attendanceRecords[studentId],
        status
      };
    });
    setAttendanceRecords(newRecords);
  };
  
  // Clear all selections
  const clearAll = () => {
    const newRecords = {};
    Object.keys(attendanceRecords).forEach(studentId => {
      newRecords[studentId] = {
        ...attendanceRecords[studentId],
        status: undefined
      };
    });
    setAttendanceRecords(newRecords);
  };
  
  // Get attendance status counts
  const getStatusCounts = () => {
    const counts = {
      present: 0,
      absent: 0,
      late: 0,
      unmarked: 0
    };
    
    Object.values(attendanceRecords).forEach(record => {
      if (record.status === "present") counts.present++;
      else if (record.status === "absent") counts.absent++;
      else if (record.status === "late") counts.late++;
      else counts.unmarked++;
    });
    
    return counts;
  };
  
  const statusCounts = getStatusCounts();
  
  if (!isOpen) return null;

  // Render different content based on the current modal step
  const renderModalContent = () => {
    if (modalStep === 'initial') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="h-20 w-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <Calendar size={32} className="text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No Attendance Records</h3>
          <p className="text-gray-600 max-w-lg mb-8">
            There are no attendance records for {formattedDate}. Would you like to create and mark attendance for this date?
          </p>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-[#F6BA18] text-[#212529] rounded-lg hover:bg-[#E5AD16] transition-colors flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent border-[#212529] rounded-full animate-spin mr-2"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus size={18} className="mr-2" />
                  <span>Create Attendance</span>
                </>
              )}
            </button>
          </div>
        </div>
      );
    }
    
    // Mark attendance step
    return (
      <>
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          {/* Attendance Guide Toggle */}
          <button 
            onClick={() => setShowGuide(!showGuide)} 
            className="mb-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Info size={18} />
            {showGuide ? "Hide attendance guide" : "How does attendance tracking work?"}
          </button>
          
          {/* Attendance Guide Panel */}
          {showGuide && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-blue-800">
              <h4 className="font-medium mb-2">Attendance Guide:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Mark each student as Present, Late, or Absent using the corresponding buttons</li>
                <li>Use "Mark All Present" or "Mark All Absent" to quickly set attendance for the entire class</li>
                <li>Use the search bar to find specific students in large classes</li>
                <li>Attendance records are saved automatically when you click "Save Attendance"</li>
                <li>You can edit attendance records at any time by selecting the date again</li>
              </ul>
            </div>
          )}
          
          {/* Action Buttons and Search */}
          <div className="flex flex-col md:flex-row items-stretch justify-between gap-4">
            {/* Improved Search Bar */}
            <div className="relative flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F6BA18] focus:border-transparent shadow-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {filteredStudents.length > 0 && searchQuery && (
                <div className="absolute text-xs text-gray-500 mt-1 ml-1">
                  Found {filteredStudents.length} of {students.length} students
                </div>
              )}
            </div>
            
            {/* Improved Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => markAll("present")}
                className="flex-1 md:flex-initial px-4 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <UserCheck size={16} />
                Mark All Present
              </button>
              <button
                onClick={() => markAll("absent")}
                className="flex-1 md:flex-initial px-4 py-3 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <UserX size={16} />
                Mark All Absent
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium shadow-sm"
                title="Clear all selections"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center p-6">
              <AlertCircle size={24} className="text-gray-400 mb-2" />
              <p className="text-gray-500">No students found matching your search.</p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-0.5 p-4">
              {filteredStudents.map(student => {
                const record = attendanceRecords[student.id] || { student_id: student.id };
                const status = record?.status;
                
                return (
                  <div 
                    key={student.id} 
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className="p-4 flex items-center justify-between">
                      {/* Student Info */}
                      <div className="flex items-center gap-3 flex-grow">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-[#212529] to-gray-700 flex items-center justify-center text-sm font-medium text-white shadow-sm">
                          {student.name?.[0] || <User size={18} />}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{student.name}</h3>
                          <p className="text-xs text-gray-500 truncate">{student.email}</p>
                        </div>
                      </div>

                      {/* Attendance Buttons */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          className={`flex items-center justify-center w-10 h-10 rounded-full ${
                            status === 'present' 
                              ? 'bg-green-500 text-white ring-2 ring-green-200' 
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-green-100'
                          }`}
                          onClick={() => handleStatusChange(student.id, 'present')}
                          title="Present"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          className={`flex items-center justify-center w-10 h-10 rounded-full ${
                            status === 'late' 
                              ? 'bg-yellow-500 text-white ring-2 ring-yellow-200' 
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-yellow-100'
                          }`}
                          onClick={() => handleStatusChange(student.id, 'late')}
                          title="Late"
                        >
                          <Clock size={18} />
                        </button>
                        <button
                          className={`flex items-center justify-center w-10 h-10 rounded-full ${
                            status === 'absent' 
                              ? 'bg-red-500 text-white ring-2 ring-red-200' 
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-red-100'
                          }`}
                          onClick={() => handleStatusChange(student.id, 'absent')}
                          title="Absent"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Status Indicator */}
                    {status && (
                      <div 
                        className={`h-1.5 rounded-b-lg ${
                          status === 'present' ? 'bg-green-500' : 
                          status === 'absent' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header with gradient background - matching the style in SubmissionHistoryModal */}
        <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-700 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#F6BA18] flex items-center justify-center text-lg font-bold text-[#212529] shadow-sm">
                <Calendar size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {modalStep === 'initial' ? 'Attendance' : 'Mark Attendance'} for {formattedDate}
                </h2>
                <span className="text-sm text-gray-300">
                  {students.length} students enrolled
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        {renderModalContent()}
          
        {modalStep === 'mark' && (
          <div className="p-4 bg-white border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-3">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                <UserCheck size={14} />
                Present: {statusCounts.present}
              </span>
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                <Clock size={14} />
                Late: {statusCounts.late}
              </span>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                <UserX size={14} />
                Absent: {statusCounts.absent}
              </span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                <Filter size={14} />
                Unmarked: {statusCounts.unmarked}
              </span>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex-1 md:flex-initial"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`px-4 py-2 bg-[#F6BA18] text-[#212529] rounded-lg hover:bg-[#E5AD16] transition-colors flex items-center justify-center gap-2 flex-1 md:flex-initial ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent border-[#212529] rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : hasExistingAttendance ? (
                  <>
                    <Check size={16} />
                    <span>Update Attendance</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Save Attendance</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceModal;
