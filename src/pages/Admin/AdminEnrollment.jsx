// src/pages/Admin/AdminEnrollment.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar, {
  SidebarItem,
} from "/src/components/common/layout/Sidebar.jsx";
import Header from "/src/components/common/layout/Header.jsx";
import EnrolleeStats from "/src/components/specific/enrollments/EnrolleeStats.jsx";
import EnrolleeTable from "/src/components/specific/enrollments/EnrolleeTable.jsx";
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

  // Fetch enrollments data
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllEnrollments(currentPage);

        console.log("API Response:", response);

        // Handle direct array response or object with enrollments property
        let enrollmentsList = [];
        if (Array.isArray(response)) {
          // Response is directly an array of enrollments
          enrollmentsList = response;
        } else if (response?.data && Array.isArray(response.data)) {
          // Response may be wrapped in data property (common with axios)
          enrollmentsList = response.data;
        } else if (
          response?.enrollments &&
          Array.isArray(response.enrollments)
        ) {
          // Response has an enrollments property
          enrollmentsList = response.enrollments;
        }

        // Transform the data to match the expected format for the components
        const transformedEnrollees = enrollmentsList.map((enrollment) => ({
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

        // Set pagination info - either from response or calculate based on data length
        setTotalItems(response?.totalItems || enrollmentsList.length);
        setTotalPages(
          response?.totalPages || Math.ceil(enrollmentsList.length / 10) || 1
        );
        setCurrentPage(response?.currentPage || currentPage);

        // Count approved, pending and rejected enrollments
        const approved = enrollmentsList.filter(
          (e) => e.status === "approved"
        ).length;
        const pending = enrollmentsList.filter(
          (e) => e.status === "pending"
        ).length;
        const rejected = enrollmentsList.filter(
          (e) => e.status === "rejected"
        ).length;

        setApprovedCount(approved);
        setPendingCount(pending);
        setRejectedCount(rejected);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
        setError(error.message || "Failed to fetch enrollments");
        setEnrollees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleApprove = async (enrolleeId) => {
    try {
      console.log("Attempting to approve enrollee:", enrolleeId);

      await approveEnrollment(enrolleeId);

      // After successful approval, refresh the data
      const updatedData = await getAllEnrollments();
      const enrollmentsList = Array.isArray(updatedData) ? updatedData : [];

      // Transform and update enrollees list
      const transformedEnrollees = enrollmentsList.map((enrollment) => ({
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

      // Update counts
      const approved = enrollmentsList.filter(
        (e) => e.status === "approved"
      ).length;
      const pending = enrollmentsList.filter(
        (e) => e.status === "pending"
      ).length;
      const rejected = enrollmentsList.filter(
        (e) => e.status === "rejected"
      ).length;

      setApprovedCount(approved);
      setPendingCount(pending);
      setRejectedCount(rejected);
    } catch (error) {
      console.error("Approval error:", error);
      alert("Failed to approve enrollment. Please try again.");
    }
  };

  const handleReject = async (enrolleeId) => {
    try {
      await rejectEnrollment(enrolleeId);
      // Use the same pattern as in handleApprove
      const updatedData = await getAllEnrollments(currentPage);
      const enrollmentsData = updatedData?.data || updatedData || [];
      const enrollmentsList = enrollmentsData.enrollments || [];

      const transformedEnrollees = enrollmentsList.map((enrollment) => ({
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
    } catch (error) {
      console.error("Error rejecting enrollment:", error);
    }
  };

  const handleEdit = (enrollee) => {
    // Handle edit logic here
    console.log("Editing enrollee:", enrollee);
  };

  const handleDeleteSelected = async (selectedIds) => {
    try {
      // Delete each selected enrollment
      for (const id of selectedIds) {
        await deleteEnrollment(id);
      }

      // Refresh the enrollments data after deletion
      const updatedData = await getAllEnrollments(currentPage);
      const enrollmentsData = updatedData?.data || updatedData || [];
      const enrollmentsList = enrollmentsData.enrollments || [];

      // Transform and update state
      const transformedEnrollees = enrollmentsList.map((enrollment) => ({
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

      // Update pagination and stats
      setTotalItems(updatedData?.totalItems || enrollmentsList.length);
      setTotalPages(
        updatedData?.totalPages || Math.ceil(enrollmentsList.length / 10) || 1
      );

      const approved = enrollmentsList.filter(
        (e) => e.status === "approved"
      ).length;
      const pending = enrollmentsList.filter(
        (e) => e.status === "pending"
      ).length;
      const rejected = enrollmentsList.filter(
        (e) => e.status === "rejected"
      ).length;

      setApprovedCount(approved);
      setPendingCount(pending);
      setRejectedCount(rejected);
    } catch (error) {
      console.error("Error deleting enrollment:", error);
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <InboxIcon size={64} className="text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No Enrollments Found
      </h3>
      <p className="text-gray-500 text-center max-w-md mb-4">
        There are currently no enrollments in the system. New enrollments will
        appear here once students begin the enrollment process.
      </p>
    </div>
  );

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
    <>
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />

        <div className="flex-1 p-[1vw] overflow-auto">
          <Header title="Manage Enrollments" />
          <div className="mt-4">
            <EnrolleeStats
              totalEnrollees={totalItems}
              approvedEnrollees={approvedCount}
              pendingEnrollees={pendingCount}
              rejectedEnrollees={rejectedCount}
            />
          </div>
          <div className="bg-white shadow rounded-lg overflow-hidden mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#212529]"></div>
              </div>
            ) : error ? (
              <ErrorState />
            ) : enrollees.length === 0 ? (
              <EmptyState />
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
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminEnrollment;
