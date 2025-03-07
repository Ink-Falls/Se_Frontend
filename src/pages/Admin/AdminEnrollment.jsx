// src/pages/Admin/AdminEnrollment.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Sidebar, { SidebarItem } from "/src/components/common/layout/Sidebar.jsx";
import Header from "/src/components/common/layout/Header.jsx";
import EnrolleeStats from "/src/components/specific/enrollments/EnrolleeStats.jsx"; //Corrected import path and folder name
import EnrolleeTable from "/src/components/specific/enrollments/EnrolleeTable.jsx"; //Corrected import path and folder name
import { Users, Book, Bell, FileText, Home } from "lucide-react";
import { getAllEnrollments, approveEnrollment, rejectEnrollment } from '/src/services/enrollmentService.js'; // Import service functions


function AdminEnrollment() {
  // Static data for enrollees
  const enrollees = [
  {
  id: 1,
  fullName: "Ivan Delo Cruz",
  status: "Pending",
  enrollmentDate: "10/01/2023",
  },
  {
  id: 2,
  fullName: "Lora Santos",
  status: "Pending",
  enrollmentDate: "10/02/2023",
  },
  {
  id: 3,
  fullName: "Miguel Rivera",
  status: "Pending",
  enrollmentDate: "10/03/2023",
  },
  {
  id: 4,
  fullName: "Jasmine Cruz",
  status: "Approved",
  enrollmentDate: "10/04/2023",
  },
  {
  id: 5,
  fullName: "Andrei Boulista",
  status: "Approved",
  enrollmentDate: "10/05/2023",
  },
  {
  id: 6,
  fullName: "Carmen Villanueva",
  status: "Approved",
  enrollmentDate: "10/06/2023",
  },
  {
  id: 7,
  fullName: "Dylan Reyes",
  status: "Approved",
  enrollmentDate: "10/07/2023",
  },
  ];
  
  const navItems = [
  { text: "Users", icon: <Home size={20} />, route: "/Admin/Dashboard" },
  { text: "Courses", icon: <Book size={20} />, route: "/Admin/Courses" },
  { text: "Enrollments", icon: <Bell size={20} />, route: "/Admin/Enrollments" },
  { text: "Announcements", icon: <FileText size={20} />, route: "/Admin/Announcements" },
  ];
  
  const handleEdit = (enrollee) => {
  // Handle edit logic here
  console.log("Editing enrollee:", enrollee);
  };
  
  return (
  <>
  <div className="flex h-screen bg-gray-100">
  <Sidebar navItems={navItems} />
  
  <div className="flex-1 p-6 overflow-auto">
        <Header title="Admin: Manage Enrollments" />
        <div className="mt-4">
          <EnrolleeStats
            totalEnrollees={enrollees.length}
            approvedEnrollees={
              enrollees.filter((e) => e.status === "Approved").length
            }
            pendingEnrollees={
              enrollees.filter((e) => e.status === "Pending").length
            }
          />
        </div>
        <div className="bg-white shadow rounded-lg overflow-x-auto mt-4 p-4">
          <EnrolleeTable
            enrollees={enrollees} // Pass enrollees data
            onEdit={handleEdit}
          />
        </div>
      </div>
    </div>
  </>
  
  );
  }
  
  export default AdminEnrollment;