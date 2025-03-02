import React from "react";
import Sidebar, { SidebarItem } from "./Sidebar";
import Header from "./Header";
import EnrolleeStats from "./EnrolleeStats";
import EnrolleeTable from "./EnrolleeTable";
import { Users, Book, Bell, FileText, Pencil } from "lucide-react";

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
    { text: "Users", icon: <Users size={20} />, route: "/AdminUser" },
    { text: "Courses", icon: <Book size={20} />, route: "/AdminModules" },
    {
      text: "Enrollments",
      icon: <Pencil size={20} />,
      route: "/AdminEnrollment",
    },
    {
      text: "Announcements",
      icon: <FileText size={20} />,
      route: "/AdminAnnouncements",
    },
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
