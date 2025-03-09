import React, { useState } from "react";
import {
  Edit,
  Trash2,
  Filter,
  Search,
  FileText,
  SquarePen,
} from "lucide-react";
import EnrolleeStatusModal from "/src/components/common/Modals/Edit/EnrolleeStatusModal.jsx";

function EnrolleeTable({
  enrollees,
  onDeleteSelected,
  onApprove,
  onReject,
  onDetailsClick,
  currentPage,
  totalPages,
  onPageChange
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // State for modals
  const [selectedEnrollee, setSelectedEnrollee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEnrollee(null);
  };

  const ROWS_PER_PAGE = 10;
  
  // Filter enrollees by status and search query
  const filteredEnrollees = enrollees
    .filter((enrollee) => {
      if (filterStatus === "All") return true;
      return enrollee.status === filterStatus;
    })
    .filter((enrollee) =>
      enrollee.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Calculate pagination numbers
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const paginatedEnrollees = filteredEnrollees.slice(startIndex, endIndex);

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
        <div className="flex items-center space-x-4">
          {/* Delete Selected Button (Visible when checkboxes are selected) */}
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="text-red-600 hover:text-red-900"
            >
              <Trash2 size={20} />
            </button>
          )}

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6BA18]"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6BA18] appearance-none"
            >
              <option value="All">All</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={16} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Generate Report Button */}
        <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 flex items-center">
          <FileText size={16} className="mr-2" />
          Generate Report
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
          {paginatedEnrollees.map((enrollee) => (
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
                  className="text-blue-600 hover:text-blue-900"
                  title="View Details"
                >
                  <SquarePen size={20} color="black" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="px-6 py-4 flex items-center justify-between border-t">
        <div className="text-sm text-gray-700">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredEnrollees.length)} of{" "}
          {filteredEnrollees.length} entries
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
            Page {currentPage} of {Math.ceil(filteredEnrollees.length / ROWS_PER_PAGE)}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= Math.ceil(filteredEnrollees.length / ROWS_PER_PAGE)}
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
            await onApprove(selectedEnrollee.id);
            handleCloseModal();
          }}
          onReject={async () => {
            await onReject(selectedEnrollee.id);
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
}

export default EnrolleeTable;
