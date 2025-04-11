import React, { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Filter,
  Search,
  FileText,
  SquarePen,
  X,
  InboxIcon, // Add InboxIcon import
} from "lucide-react";
import EnrolleeStatusModal from "/src/components/common/Modals/Edit/EnrolleeStatusModal.jsx";
import ReportViewerModal from "../../common/Modals/View/ReportViewerModal";
import { generateEnrollmentReport } from "../../../services/reportService";
import { getAllEnrollments } from "../../../services/enrollmentService";
import { useTheme } from "../../../contexts/ThemeContext"; // Import useTheme

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
  showEmptyState = false, // Add default prop
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [error, setError] = useState(null);
  const [pageInput, setPageInput] = useState(currentPage.toString());
  const { isDarkMode } = useTheme(); // Get theme state

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e) => {
    if (e.key === "Enter") {
      const newPage = parseInt(pageInput);
      if (
        !isNaN(newPage) &&
        newPage >= 1 &&
        newPage <= Math.ceil(filteredEnrollees.length / ROWS_PER_PAGE)
      ) {
        onPageChange(newPage);
      } else {
        setPageInput(currentPage.toString());
      }
    }
  };

  const handlePageInputBlur = () => {
    setPageInput(currentPage.toString());
  };

  const [selectedEnrollee, setSelectedEnrollee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportUrl, setReportUrl] = useState(null);
  const [reportError, setReportError] = useState(null);

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    onDeleteSelected(selectedIds);
    setSelectedIds([]);
  };

  const handleRowClick = (enrollee) => {
    setSelectedEnrollee(enrollee);
    setShowDetailsModal(true);
  };

  const handleReject = () => {
    setShowDetailsModal(false);
    setShowRejectModal(true);
  };

  const handleConfirmReject = async (reason) => {
    try {
      await onReject(selectedEnrollee.id, reason);
      setShowRejectModal(false);
      setSelectedEnrollee(null);
      if (onReject) {
        await onReject(selectedEnrollee.id);
      }
    } catch (error) {
      console.error("Error rejecting enrollment:", error);
    }
  };

  const handleCancelReject = () => {
    setShowRejectModal(false);
    setShowDetailsModal(true);
  };

  const handleEditClick = (enrollee, e) => {
    e.stopPropagation();
    setSelectedEnrollee(enrollee);
    setIsModalOpen(true);
  };

  const handleCloseModal = async (wasActionTaken = false) => {
    setIsModalOpen(false);
    setSelectedEnrollee(null);
    if (wasActionTaken) {
      onFilterChange(currentFilter || "");
    }
  };

  const handleGenerateReport = async () => {
    try {
      setError(null);
      setReportError(null);
      setShowReportModal(true);

      const formattedEnrollments = enrollees.map((enrollee) => ({
        id: enrollee.id,
        fullName: enrollee.fullName,
        status: enrollee.status,
        enrollmentDate: enrollee.enrollmentDate,
      }));

      const doc = await generateEnrollmentReport(formattedEnrollments);
      if (!doc) {
        throw new Error("Failed to generate PDF document");
      }

      const pdfBlob = doc.output("blob");
      if (!pdfBlob) {
        throw new Error("Failed to generate PDF blob");
      }

      const pdfUrl = URL.createObjectURL(pdfBlob);
      if (!pdfUrl) {
        throw new Error("Failed to create blob URL");
      }

      setReportUrl(pdfUrl);
    } catch (error) {
      console.error("Error details:", error);
      setError("Failed to generate enrollment report");
      setReportError("Failed to generate enrollment report");
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
      window.open(reportUrl, "_blank");
    }
  };

  const handleDeleteReport = () => {
    if (reportUrl) {
      URL.revokeObjectURL(reportUrl);
      setReportUrl(null);
      setShowReportModal(false);
    }
  };

  const filteredEnrollees = enrollees;

  const handleFilterChange = (e) => {
    const status = e.target.value;
    setFilterStatus(status);
    if (onFilterChange) {
      onFilterChange(status === "All" ? "" : status);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    onSearch(query);
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        // Add dark mode styles
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "rejected":
        // Add dark mode styles
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "pending":
        // Add dark mode styles
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        // Add dark mode styles
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getEmptyStateMessage = () => {
    if (searchQuery) {
      return `No enrollments found matching "${searchQuery}".`;
    }
    if (currentFilter) {
      return `No ${currentFilter.toLowerCase()} enrollments found.`;
    }
    return "There are currently no enrollments in the system. New enrollments will appear here once students begin the enrollment process.";
  };

  return (
    // Add dark mode background and shadow
    <div className="bg-white dark:bg-gray-800 shadow dark:shadow-dark-md rounded-lg overflow-hidden">
      {/* Add dark mode border */}
      <div className="p-4 border-b dark:border-gray-700 space-y-4">
        <div className="flex flex-col md:flex-row w-full gap-4 md:items-center md:justify-between">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                // Add dark mode text color
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 size={16} className="md:w-[1vw] md:h-[1vw]" />
              </button>
            )}

            <div className="relative py-2 md:py-[0.2vw]">
              <select
                value={currentFilter || "All"}
                onChange={handleFilterChange}
                // Add dark mode styles for select
                className="pl-10 md:pl-[2vw] pr-4 md:pr-[1vw] py-2 md:py-[0.5vw] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6BA18] dark:focus:ring-yellow-500 appearance-none w-full md:w-[12vw] bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <option value="">All</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 md:pl-[0.5vw] flex items-center pointer-events-none">
                {/* Add dark mode text color for icon */}
                <Filter
                  size={16}
                  className="text-[#475569] dark:text-gray-400 md:w-[1vw] md:h-[1vw]"
                />
              </div>
            </div>

            <div className="relative w-full md:w-[15vw]">
              <input
                type="text"
                placeholder="Search enrollees..."
                value={searchQuery}
                onChange={handleSearchChange}
                // Add dark mode styles for input
                className="w-full pl-10 md:pl-[2vw] pr-10 md:pr-[2.5vw] py-2 md:py-[0.5vw] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6BA18] dark:focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              {/* Add dark mode text color for icon */}
              <Search className="absolute left-3 md:left-[0.5vw] top-1/2 -translate-y-1/2 text-[#475569] dark:text-gray-400 w-5 h-5 md:w-[1vw] md:h-[1vw]" />
              {searchQuery && (
                <button
                  onClick={onSearchCancel}
                  // Add dark mode text color for cancel button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleGenerateReport}
            // Add dark mode styles for button
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#212529] dark:bg-gray-700 text-white dark:text-gray-200 rounded-lg text-sm transition duration-300 hover:bg-[#F6BA18] dark:hover:bg-[#F6BA18] hover:text-black dark:hover:text-black whitespace-nowrap"
          >
            <FileText size={16} className="md:w-[1vw] md:h-[1vw]" />
            <span>Generate Report</span>
          </button>
        </div>

        <button
          onClick={handleGenerateReport}
          // Add dark mode styles for mobile button
          className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#212529] dark:bg-gray-700 text-white dark:text-gray-200 rounded-lg text-sm transition duration-300 hover:bg-[#F6BA18] dark:hover:bg-[#F6BA18] hover:text-black dark:hover:text-black"
        >
          <FileText size={16} />
          <span>Generate Report</span>
        </button>
      </div>

      {showEmptyState && enrollees.length === 0 && (
        // Add dark mode styles for empty state
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-800">
          <InboxIcon size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {searchQuery ? "No Enrollments Found" : "No Enrollments Available"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
            {getEmptyStateMessage()}
          </p>
        </div>
      )}

      {(!showEmptyState || enrollees.length > 0) && (
        // Add dark mode background and shadow
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-dark-md">
          {/* Add dark mode border */}
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            {/* Add dark mode background and text color */}
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {/* Add dark mode text color */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    // Add dark mode styles for checkbox
                    className="rounded border-gray-300 dark:border-gray-600 text-[#F6BA18] focus:ring-[#F6BA18] dark:bg-gray-700 dark:focus:ring-yellow-500 dark:checked:bg-yellow-500"
                    checked={selectedIds.length === filteredEnrollees.length && filteredEnrollees.length > 0}
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
                {/* Add dark mode text color */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                {/* Add dark mode text color */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Full Name
                </th>
                {/* Add dark mode text color */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                {/* Add dark mode text color */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Enrollment Date
                </th>
                {/* Add dark mode text color */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            {/* Add dark mode background and border */}
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEnrollees.map((enrollee) => (
                <tr
                  key={enrollee.id}
                  // Add dark mode hover background
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      // Add dark mode styles for checkbox
                      className="rounded border-gray-300 dark:border-gray-600 text-[#F6BA18] focus:ring-[#F6BA18] dark:bg-gray-700 dark:focus:ring-yellow-500 dark:checked:bg-yellow-500"
                      checked={selectedIds.includes(enrollee.id)}
                      onChange={() => handleCheckboxChange(enrollee.id)}
                    />
                  </td>
                  {/* Add dark mode text color */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {enrollee.id}
                  </td>
                  {/* Add dark mode text color */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {enrollee.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      // Use updated getStatusStyle function
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
                        enrollee.status
                      )}`}
                    >
                      {enrollee.status}
                    </span>
                  </td>
                  {/* Add dark mode text color */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {enrollee.enrollmentDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={(e) => handleEditClick(enrollee, e)}
                      // Add dark mode text color
                      className="text-black dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
                      title="View Details"
                    >
                      <SquarePen size={16} className="md:w-[1vw] md:h-[1vw]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add dark mode border and background */}
      <div className="px-6 py-4 flex items-center justify-start md:justify-end border-t dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 items-start md:items-center text-sm md:text-base">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || enrollees.length === 0}
            // Add dark mode styles for pagination button
            className="w-full md:w-auto px-2 md:px-3 py-0.5 md:py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300
                     hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            Previous
          </button>
          {/* Add dark mode text color */}
          <span className="px-2 md:px-4 py-0.5 md:py-1 text-gray-600 dark:text-gray-400 whitespace-nowrap text-sm md:text-base">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || enrollees.length === 0}
            // Add dark mode styles for pagination button
            className="w-full md:w-auto px-2 md:px-3 py-0.5 md:py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300
                     hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            Next
          </button>
        </div>
      </div>

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

      {showRejectModal && (
        <RejectEnrolleeModal
          onClose={handleCancelReject}
          onConfirm={handleConfirmReject}
        />
      )}

      {isModalOpen && selectedEnrollee && (
        <EnrolleeStatusModal
          enrolleeId={selectedEnrollee.id}
          onClose={handleCloseModal}
          onApprove={async () => {
            try {
              const result = await onApprove(selectedEnrollee.id);
              if (
                result?.message?.includes("approved") ||
                result?.enrollment?.status === "approved"
              ) {
                handleCloseModal(true);
              }
              return result;
            } catch (error) {
              console.error("Error in approval:", error);
              throw error;
            }
          }}
          onReject={async () => {
            try {
              const result = await onReject(selectedEnrollee.id);
              if (result) {
                handleCloseModal(true);
              }
              return result;
            } catch (error) {
              console.error("Error in rejection:", error);
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
