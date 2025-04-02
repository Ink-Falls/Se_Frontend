import React, { useState } from "react";
import {
  Edit,
  Trash2,
  Filter,
  Search,
  FileText,
  SquarePen,
  X, // Add X icon import
} from "lucide-react";
import EnrolleeStatusModal from "/src/components/common/Modals/Edit/EnrolleeStatusModal.jsx";
import ReportViewerModal from "../../common/Modals/View/ReportViewerModal";
import { generateEnrollmentReport } from "../../../services/reportService";
import { getAllEnrollments } from '../../../services/enrollmentService';

function EnrolleeTable({
  enrollees,
  onDeleteSelected,
  onApprove,
  onReject,
  currentPage,
  totalPages,
  onPageChange,
  onFilterChange,
  currentFilter,
  itemsPerPage,
  totalItems,
  onSearch,
  onSearchCancel,
  searchQuery,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [error, setError] = useState(null); // Add this line

  // State for modals
  const [selectedEnrollee, setSelectedEnrollee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportUrl, setReportUrl] = useState(null);
  const [reportError, setReportError] = useState(null);

  // Handle checkbox selection
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle delete selected records
  const handleDeleteSelected = () => {
    onDeleteSelected(selectedIds);
    setSelectedIds([]);
  };

  // Handle row click to show details modal
  const handleRowClick = (enrollee) => {
    setSelectedEnrollee(enrollee);
    setShowDetailsModal(true);
  };

  // Handle reject button click in details modal
  const handleReject = () => {
    setShowDetailsModal(false); // Close details modal
    setShowRejectModal(true); // Open reject modal
  };

  // Handle confirm reject in reject modal
  const handleConfirmReject = async (reason) => {
    try {
      await onReject(selectedEnrollee.id, reason);
      setShowRejectModal(false);
      setSelectedEnrollee(null);
      // Refresh data through parent component
      if (onReject) {
        await onReject(selectedEnrollee.id);
      }
    } catch (error) {
      console.error("Error rejecting enrollment:", error);
    }
  };

  // Handle cancel reject in reject modal
  const handleCancelReject = () => {
    setShowRejectModal(false); // Close reject modal
    setShowDetailsModal(true); // Reopen details modal
  };

  // Handle edit button click
  const handleEditClick = (enrollee, e) => {
    e.stopPropagation();
    setSelectedEnrollee(enrollee);
    setIsModalOpen(true);
  };

  const handleCloseModal = async (wasActionTaken = false) => {
    setIsModalOpen(false);
    setSelectedEnrollee(null);
    // If an action was taken (approve/reject), trigger a data refresh
    if (wasActionTaken) {
      // This will trigger the parent's refresh logic
      onFilterChange(currentFilter || '');
    }
  };

  const handleGenerateReport = async () => {
    try {
      setError(null);
      setReportError(null);
      
      // Format enrollments data for report
      const formattedEnrollments = enrollees.map(enrollee => ({
        id: enrollee.id,
        fullName: enrollee.fullName,
        status: enrollee.status,
        enrollmentDate: enrollee.enrollmentDate
      }));

      const doc = await generateEnrollmentReport(formattedEnrollments);
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      setReportUrl(pdfUrl);
      setShowReportModal(true);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate enrollment report');
      setReportError('Failed to generate enrollment report');
      setShowReportModal(true);
    }
  };

  const handleCloseReport = () => {
    if (reportUrl) {
      URL.revokeObjectURL(reportUrl);
    }
    setReportUrl(null);
    setReportError(null);
    setShowReportModal(false);
  };

  const handlePrintReport = () => {
    if (reportUrl) {
      window.open(reportUrl, '_blank');
    }
  };

  const handleDeleteReport = () => {
    if (reportUrl) {
      URL.revokeObjectURL(reportUrl);
      setReportUrl(null);
      setShowReportModal(false);
    }
  };

  // Remove ROWS_PER_PAGE constant since we're using itemsPerPage from props
  
  // Remove client-side filtering and pagination logic
  // const filteredEnrollees = enrollees.filter((enrollee) => {
  //   if (filterStatus === "All") return true;
  //   return enrollee.status === filterStatus;
  // })
  // .filter((enrollee) =>
  //   enrollee.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  // const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  // const endIndex = startIndex + ROWS_PER_PAGE;
  // const paginatedEnrollees = filteredEnrollees.slice(startIndex, endIndex);

  // Instead, use the enrollees directly since they're already paginated from the server
  const filteredEnrollees = enrollees;

  // Update handleFilterChange to use the parent's filter change handler
  const handleFilterChange = (e) => {
    const status = e.target.value;
    setFilterStatus(status);
    if (onFilterChange) {
      onFilterChange(status === 'All' ? '' : status);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    // Remove local filtering and just pass the query to parent
    onSearch(query);
  };

  // Add the getStatusStyle function
  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Table Header with Search, Filter, and Actions */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex flex-col md:flex-row w-full gap-4 md:items-center">
          {/* Delete Selected Button */}
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="text-red-600 hover:text-red-900"
            >
              <Trash2 size={16} className="md:w-[1vw] md:h-[1vw]" />
            </button>
          )}

          {/* Updated Filter Dropdown */}
          <div className="relative py-2 md:py-[0.2vw]">
            <select
              value={currentFilter || 'All'}
              onChange={handleFilterChange}
              className="pl-10 md:pl-[2vw] pr-4 md:pr-[1vw] py-2 md:py-[0.5vw] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6BA18] appearance-none w-full md:w-[12vw]"
            >
              <option value="">All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 md:pl-[0.5vw] flex items-center pointer-events-none">
              <Filter size={16} className="text-[#475569] md:w-[1vw] md:h-[1vw]" />
            </div>
          </div>

          {/* Updated Search Bar */}
          <div className="relative w-full md:w-auto py-2 md:py-[0.2vw]">
            <input
              type="text"
              placeholder="Search enrollees..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full md:w-[15vw] pl-10 md:pl-[2vw] pr-4 md:pr-[1vw] py-2 md:py-[0.5vw] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6BA18]"
            />
            <Search className="absolute left-3 md:left-[0.5vw] top-1/2 -translate-y-1/2 text-[#475569] w-5 h-5 md:w-[1vw] md:h-[1vw]" />
            {searchQuery && (
              <button
                onClick={onSearchCancel}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Generate Report Button */}
        <button 
          onClick={handleGenerateReport}
          className="flex items-center gap-2 md:gap-[0.3vw] px-4 md:px-[0.8vw] py-2 md:py-[0.4vw] bg-[#212529] text-white rounded-lg text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black"
        >
          <FileText size={16} className="md:w-[1vw] md:h-[1vw]" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Table */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {/* Checkbox for Select All */}
              <input
                type="checkbox"
                checked={selectedIds.length === filteredEnrollees.length}
                onChange={() => {
                  if (selectedIds.length === filteredEnrollees.length) {
                    setSelectedIds([]);
                  } else {
                    setSelectedIds(
                      filteredEnrollees.map((enrollee) => enrollee.id)
                    );
                  }
                }}
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Full Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Enrollment Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredEnrollees.map((enrollee) => (
            <tr
              key={enrollee.id}
              className="hover:bg-gray-50 transition-colors"
            >
              {/* Checkbox for Row Selection */}
              <td
                className="px-6 py-4 whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(enrollee.id)}
                  onChange={() => handleCheckboxChange(enrollee.id)}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {enrollee.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {enrollee.fullName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
                    enrollee.status
                  )}`}
                >
                  {enrollee.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {enrollee.enrollmentDate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={(e) => handleEditClick(enrollee, e)}
                  className="text-black hover:text-gray-700"
                  title="View Details"
                >
                  <SquarePen size={16} className="md:w-[1vw] md:h-[1vw]" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Updated Pagination Controls */}
      <div className="px-6 py-4 flex items-center justify-between border-t">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border bg-white text-gray-600 
                     hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-1 text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 rounded border bg-white text-gray-600 
                     hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Enrollee Details Modal */}
      {showDetailsModal && selectedEnrollee && (
        <EnrolleeDetailsModal
          enrollee={selectedEnrollee}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedEnrollee(null);
          }}
          onReject={handleReject}
        />
      )}

      {/* Reject Enrollee Modal */}
      {showRejectModal && (
        <RejectEnrolleeModal
          onClose={handleCancelReject}
          onConfirm={handleConfirmReject}
        />
      )}

      {/* Enrollee Status Modal */}
      {isModalOpen && selectedEnrollee && (
        <EnrolleeStatusModal
          enrolleeId={selectedEnrollee.id}
          onClose={handleCloseModal}
          onApprove={async () => {
            try {
              const result = await onApprove(selectedEnrollee.id);
              if (result?.message?.includes('approved') || result?.enrollment?.status === 'approved') {
                handleCloseModal(true);
              }
              return result;
            } catch (error) {
              console.error('Error in approval:', error);
              throw error;
            }
          }}
          onReject={async () => {
            try {
              const result = await onReject(selectedEnrollee.id);
              // Force refresh regardless of response format
              if (result) {
                handleCloseModal(true);
              }
              return result;
            } catch (error) {
              console.error('Error in rejection:', error);
              throw error;
            }
          }}
        />
      )}

      <ReportViewerModal
        isOpen={showReportModal}
        onClose={handleCloseReport}
        pdfUrl={reportUrl}
        onPrint={handlePrintReport}
        onDelete={handleDeleteReport}
        error={reportError}
        title="Enrollment Report"
      />
    </div>
  );
}

export default EnrolleeTable;
