// src/pages/Admin/AdminEnrollment.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar, {
  SidebarItem,
} from "/src/components/common/layout/Sidebar.jsx";
import Header from "/src/components/common/layout/Header.jsx";
import EnrolleeStats from "/src/components/specific/enrollments/EnrolleeStats.jsx";
import EnrolleeTable from "/src/components/specific/enrollments/EnrolleeTable.jsx";
import { Users, Book, Bell, FileText, Home } from "lucide-react";
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

        // Count approved and pending enrollments
        const approved = enrollmentsList.filter(
          (e) => e.status === "approved"
        ).length;
        const pending = enrollmentsList.filter(
          (e) => e.status === "pending"
        ).length;
        setApprovedCount(approved);
        setPendingCount(pending);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
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
      await approveEnrollment(enrolleeId);
      // Refresh the enrollments data after approval
      const updatedData = await getAllEnrollments(currentPage);

      // Handle the response using the same structure as in fetchEnrollments
      const enrollmentsData = updatedData?.data || updatedData || [];
      const enrollmentsList = enrollmentsData.enrollments || [];

      // Update state with transformed data
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
      console.error("Error approving enrollment:", error);
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
      setApprovedCount(approved);
      setPendingCount(pending);
    } catch (error) {
      console.error("Error deleting enrollment:", error);
    }
  };

  return (
    <>
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />

        <div className="flex-1 p-6 overflow-auto">
          <Header title="Admin: Manage Enrollments" />
          <div className="mt-4">
            <EnrolleeStats
              totalEnrollees={totalItems}
              approvedEnrollees={approvedCount}
              pendingEnrollees={pendingCount}
            />
          </div>
          <div className="bg-white shadow rounded-lg overflow-x-auto mt-4 p-4">
            {loading ? (
              <div className="text-center py-4">Loading enrollments...</div>
            ) : (
              <>
                <EnrolleeTable
                  enrollees={enrollees}
                  onEdit={handleEdit}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDeleteSelected={handleDeleteSelected}
                />
                <div className="flex justify-between items-center mt-4">
                  <div>
                    Showing page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminEnrollment;
