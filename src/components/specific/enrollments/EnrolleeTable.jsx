import React, { useState } from "react";
import { Edit, Trash2, Filter, Search, FileText } from "lucide-react";
import EnrolleeDetailsModal from "../../EnrolleeDetailsModal"; // Import the details modal
import RejectEnrolleeModal from "../../RejectEnrolleeModal"; // Import the reject modal

function EnrolleeTable({ enrollees, onDeleteSelected }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // State for modals
  const [selectedEnrollee, setSelectedEnrollee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

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
  const handleConfirmReject = (reason) => {
    console.log("Rejected with reason:", reason);
    setShowRejectModal(false); // Close reject modal
    setSelectedEnrollee(null); // Clear selected enrollee
  };

  // Handle cancel reject in reject modal
  const handleCancelReject = () => {
    setShowRejectModal(false); // Close reject modal
    setShowDetailsModal(true); // Reopen details modal
  };

  // Filter enrollees by status and search query
  const filteredEnrollees = enrollees
    .filter((enrollee) => {
      if (filterStatus === "All") return true;
      return enrollee.status === filterStatus;
    })
    .filter((enrollee) =>
      enrollee.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
          {filteredEnrollees.map((enrollee) => (
            <tr
              key={enrollee.id}
              onClick={() => handleRowClick(enrollee)} // Open details modal on row click
              className="hover:bg-gray-50 transition-colors cursor-pointer"
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
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    enrollee.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {enrollee.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {enrollee.enrollmentDate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click from triggering
                    handleRowClick(enrollee);
                  }}
                  className="text-gray-800 hover:text-gray-900"
                >
                  <Edit size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
    </div>
  );
}

export default EnrolleeTable;
