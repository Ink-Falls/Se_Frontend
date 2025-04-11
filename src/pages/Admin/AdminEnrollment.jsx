// src/pages/Admin/AdminEnrollment.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar, {
  SidebarItem,
} from "/src/components/common/layout/Sidebar.jsx";
import Header from "/src/components/common/layout/Header.jsx";
import EnrolleeStats from "/src/components/specific/enrollments/EnrolleeStats.jsx";
import EnrolleeTable from "/src/components/specific/enrollments/EnrolleeTable.jsx";
import LoadingSpinner from "/src/components/common/LoadingSpinner.jsx";
import {
  Users,
  Book,
  Bell,
  FileText,
  Home,
  AlertTriangle,
  InboxIcon,
} from "lucide-react";
import {
  getAllEnrollments,
  approveEnrollment,
  rejectEnrollment,
  deleteEnrollment,
} from "/src/services/enrollmentService.js";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import DeleteModal from "../../components/common/Modals/Delete/DeleteModal";

function AdminEnrollment() {
  const [enrollees, setEnrollees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [itemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState("");
  const [overallStats, setOverallStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [allEnrolleesData, setAllEnrolleesData] = useState([]);
  const [enrollmentsToDelete, setEnrollmentsToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navItems = [
    { text: "Users", icon: <Home size={20} />, route: "/Admin/Dashboard" },
    { text: "Courses", icon: <Book size={20} />, route: "/Admin/Courses" },
    {
      text: "Enrollments",
      icon: <Bell size={20} />,
      route: "/Admin/Enrollments",
    },
    {
      text: "Announcements",
      icon: <FileText size={20} />,
      route: "/Admin/Announcements",
    },
  ];

  // Fetch overall stats
  useEffect(() => {
    fetchOverallStats();
  }, [filterStatus]); // Only re-fetch when filter changes

  // Fetch enrollments data
  useEffect(() => {
    fetchEnrollments();
  }, [currentPage, itemsPerPage, filterStatus]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Update handleFilterChange to accept search parameter
  const handleFilterChange = (status, search = "") => {
    setFilterStatus(status);
    setCurrentPage(1);
    fetchEnrollments(1, itemsPerPage, status, search);
  };

  const handleApprove = async (enrolleeId) => {
    try {
      const response = await approveEnrollment(enrolleeId);

      if (response.message === "Enrollment approved successfully") {
        setSuccessMessage("Enrollment successfully approved!");
        // Refresh both paginated data and overall stats
        await Promise.all([fetchEnrollments(), fetchOverallStats()]);
      }

      return response; // Return response so modal knows operation succeeded
    } catch (error) {
      console.error("Approval error:", error);
      // Remove setting error state here and just rethrow
      throw error; // Let modal handle the error display
    }
  };

  const handleReject = async (enrolleeId) => {
    try {
      await rejectEnrollment(enrolleeId);
      // Always set success message and refresh data if no error was thrown
      setSuccessMessage("Enrollment has been rejected successfully");

      // Refresh both paginated data and overall stats
      await Promise.all([fetchEnrollments(), fetchOverallStats()]);

      return { success: true }; // Return simplified response for modal
    } catch (error) {
      console.error("Error rejecting enrollment:", error);
      setError(error.message || "Failed to reject enrollment");
      throw error;
    }
  };

  // Extract fetch functions to be reusable
  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await getAllEnrollments(
        currentPage,
        itemsPerPage,
        filterStatus
      );

      const enrollmentsData = response.data || response.enrollments || response;
      if (!enrollmentsData || !Array.isArray(enrollmentsData)) {
        throw new Error("Invalid response format: enrollments data not found");
      }

      const transformedEnrollees = enrollmentsData.map((enrollment) => ({
        id: enrollment.enrollment_id,
        fullName: `${enrollment.first_name} ${
          enrollment.middle_initial || ""
        } ${enrollment.last_name}`,
        status:
          enrollment.status.charAt(0).toUpperCase() +
          enrollment.status.slice(1),
        enrollmentDate: new Date(enrollment.createdAt).toLocaleDateString(),
        email: enrollment.email,
        contactNo: enrollment.contact_no,
        birthDate: enrollment.birth_date,
        schoolId: enrollment.school_id,
        yearLevel: enrollment.year_level,
      }));

      setEnrollees(transformedEnrollees);
      setTotalItems(response.totalItems || enrollmentsData.length);
      setTotalPages(
        response.totalPages || Math.ceil(enrollmentsData.length / itemsPerPage)
      );
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      setError(error.message || "Failed to fetch enrollments");
    } finally {
      setLoading(false);
    }
  };

  const fetchOverallStats = async () => {
    try {
      const response = await getAllEnrollments(1, 999999);
      const allEnrollments = response.data || response.enrollments || response;

      if (Array.isArray(allEnrollments)) {
        setOverallStats({
          total: allEnrollments.length,
          approved: allEnrollments.filter((e) => e.status === "approved")
            .length,
          pending: allEnrollments.filter((e) => e.status === "pending").length,
          rejected: allEnrollments.filter((e) => e.status === "rejected")
            .length,
        });
      }
    } catch (error) {
      console.error("Error fetching overall stats:", error);
    }
  };

  const handleEdit = (enrollee) => {
    // Handle edit logic here
    // console.log("Editing enrollee:", enrollee);
  };

  const handleDeleteSelected = async (selectedIds) => {
    setEnrollmentsToDelete(selectedIds);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      // Delete each selected enrollment
      for (const id of enrollmentsToDelete) {
        await deleteEnrollment(id);
      }

      setSuccessMessage(
        `Successfully deleted ${enrollmentsToDelete.length} enrollment${
          enrollmentsToDelete.length > 1 ? "s" : ""
        }`
      );

      // Reset states
      setFilterStatus("");
      setSearchQuery("");
      setCurrentPage(1);
      setShowDeleteModal(false);
      setEnrollmentsToDelete(null);

      // Refresh the page to fetch latest data
      window.location.reload();
    } catch (error) {
      console.error("Error deleting enrollments:", error);
      setError(error.message || "Failed to delete selected enrollments");
    }
  };

  // Add this function to fetch all enrollees for search
  const fetchAllEnrollees = async () => {
    try {
      const response = await getAllEnrollments(1, 999999); // Fetch all enrollees
      const enrollmentsData = response.data || response.enrollments || response;
      if (Array.isArray(enrollmentsData)) {
        const transformedEnrollees = enrollmentsData.map((enrollment) => ({
          id: enrollment.enrollment_id,
          fullName: `${enrollment.first_name} ${
            enrollment.middle_initial || ""
          } ${enrollment.last_name}`,
          status:
            enrollment.status.charAt(0).toUpperCase() +
            enrollment.status.slice(1),
          enrollmentDate: new Date(enrollment.createdAt).toLocaleDateString(),
          email: enrollment.email,
          contactNo: enrollment.contact_no,
          birthDate: enrollment.birth_date,
          schoolId: enrollment.school_id,
          yearLevel: enrollment.year_level,
        }));
        setAllEnrolleesData(transformedEnrollees);
      }
    } catch (error) {
      console.error("Error fetching all enrollees:", error);
    }
  };

  // Add useEffect to fetch all enrollees on component mount
  useEffect(() => {
    fetchAllEnrollees();
  }, []);

  // Modify handleSearch to use allEnrolleesData
  const handleSearch = async (query, filtered) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      await fetchEnrollments(); // Reset to original paginated data
    } else {
      // Filter from all enrollees data
      const allFiltered = allEnrolleesData.filter((enrollee) => {
        const searchTerm = query.toLowerCase();
        const firstName = enrollee.fullName.split(" ")[0].toLowerCase();
        const lastName = enrollee.fullName.split(" ").pop().toLowerCase();
        return firstName.includes(searchTerm) || lastName.includes(searchTerm);
      });

      setEnrollees(allFiltered.slice(0, itemsPerPage));
      setTotalItems(allFiltered.length);
      setTotalPages(Math.ceil(allFiltered.length / itemsPerPage));
      setCurrentPage(1);
    }
  };

  const handleSearchCancel = () => {
    setSearchQuery("");
    setCurrentPage(1);
    if (allEnrolleesData.length > 0) {
      const totalItems = allEnrolleesData.length;
      const totalPagesCount = Math.ceil(totalItems / 10);
      setTotalPages(totalPagesCount);
      setTotalItems(totalItems);
      setEnrollees(allEnrolleesData.slice(0, 10));
    }
  };

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <AlertTriangle size={64} className="text-red-500 mb-4" />
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">
        Failed to Load Enrollments
      </h3>
      <p className="text-gray-600 text-center max-w-md mb-8">
        We encountered an error while trying to fetch the enrollment data. This
        could be due to network issues or server unavailability.
      </p>
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 flex items-center gap-2"
        >
          Refresh Page
        </button>
        <span className="text-sm text-gray-500 mt-2">
          You can try refreshing the page or contact support if the issue
          persists
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 relative pb-16">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-[2vw] md:p-[1vw] overflow-auto pb-16">
        <Header title="Manage Enrollments" />
        {/* Add success/error message display */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {/* EnrolleeStats section */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg shadow animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded-full w-20 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded-full w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EnrolleeStats
              totalEnrollees={overallStats.total}
              approvedEnrollees={overallStats.approved}
              pendingEnrollees={overallStats.pending}
              rejectedEnrollees={overallStats.rejected}
            />
          </div>
        )}
        <div className="bg-white shadow rounded-lg p-6">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorState />
          ) : (
            <EnrolleeTable
              enrollees={enrollees}
              onEdit={handleEdit}
              onApprove={handleApprove}
              onReject={handleReject}
              onDeleteSelected={handleDeleteSelected}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onFilterChange={handleFilterChange}
              currentFilter={filterStatus}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onSearch={handleSearch}
              onSearchCancel={handleSearchCancel}
              searchQuery={searchQuery}
              showEmptyState={true} // Add this prop
            />
          )}
        </div>
      </div>
      {/* Add Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteModal
          onClose={() => {
            setShowDeleteModal(false);
            setEnrollmentsToDelete(null);
          }}
          onConfirm={confirmDelete}
          message={`Are you sure you want to delete ${
            enrollmentsToDelete?.length || 0
          } selected enrollment(s)? This action cannot be undone.`}
        />
      )}
      <MobileNavBar navItems={navItems} />
    </div>
  );
}

export default AdminEnrollment;
