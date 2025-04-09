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

      console.log("PDF URL created:", pdfUrl);
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
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b space-y-4">
        <div className="flex flex-col md:flex-row w-full gap-4 md:items-center md:justify-between">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 size={16} className="md:w-[1vw] md:h-[1vw]" />
              </button>
            )}

            <div className="relative py-2 md:py-[0.2vw]">
              <select
                value={currentFilter || "All"}
                onChange={handleFilterChange}
                className="pl-10 md:pl-[2vw] pr-4 md:pr-[1vw] py-2 md:py-[0.5vw] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6BA18] appearance-none w-full md:w-[12vw]"
              >
                <option value="">All</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 md:pl-[0.5vw] flex items-center pointer-events-none">
                <Filter
                  size={16}
                  className="text-[#475569] md:w-[1vw] md:h-[1vw]"
                />
              </div>
            </div>

            <div className="relative w-full md:w-[15vw]">
              <input
                type="text"
                placeholder="Search enrollees..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 md:pl-[2vw] pr-4 md:pr-[1vw] py-2 md:py-[0.5vw] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6BA18]"
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

          <button
            onClick={handleGenerateReport}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#212529] text-white rounded-lg text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black whitespace-nowrap"
          >
            <FileText size={16} className="md:w-[1vw] md:h-[1vw]" />
            <span>Generate Report</span>
          </button>
        </div>

        <button
          onClick={handleGenerateReport}
          className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#212529] text-white rounded-lg text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black"
        >
          <FileText size={16} />
          <span>Generate Report</span>
        </button>
      </div>

      {showEmptyState && enrollees.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <InboxIcon size={64} className="text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? "No Enrollments Found" : "No Enrollments Available"}
          </h3>
          <p className="text-gray-500 text-center max-w-md mb-4">
            {getEmptyStateMessage()}
          </p>
        </div>
      )}

      {(!showEmptyState || enrollees.length > 0) && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
        </div>
      )}

      <div className="px-6 py-4 flex items-center justify-start md:justify-end border-t">
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 items-start md:items-center text-sm md:text-base">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || enrollees.length === 0}
            className="w-full md:w-auto px-2 md:px-3 py-0.5 md:py-1 rounded border bg-white text-gray-600 
                     hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            Previous
          </button>
          <span className="px-2 md:px-4 py-0.5 md:py-1 text-gray-600 whitespace-nowrap text-sm md:text-base">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || enrollees.length === 0}
            className="w-full md:w-auto px-2 md:px-3 py-0.5 md:py-1 rounded border bg-white text-gray-600 
                     hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
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
