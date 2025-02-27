import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Book, Bell } from "lucide-react";
import Header from "./Header";
import Notifications from "./Notifications";
import MobileNavBar from "./MobileNavbar"; // Import the bottom nav bar

const TeacherNotifications = () => {
  // Sidebar Navigation Items (Only for large screens)
  const navItems = [
    { text: "Courses", icon: <Book size={20} />, route: "/TeacherDashboard" },
    {
      text: "Notifications",
      icon: <Bell size={20} />,
      route: "/TeacherNotification",
    },
  ];

  // Placeholder data for notifications
  const notificationsData = [
    {
      id: 1,
      type: "New Submission",
      description: "New Submission for Activity 1 - Environmental Science",
      time: "10 minutes ago",
      userImage:
        "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg",
    },
    {
      id: 2,
      type: "New Announcement",
      description:
        "A new announcement regarding upcoming events has been posted.",
      time: "30 minutes ago",
      userImage:
        "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (Large Screens Only) */}
      <div className="hidden lg:flex">
        <Sidebar navItems={navItems} />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <Header title="Notifications" />
        <Notifications notifications={notificationsData} />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavBar />
    </div>
  );
};

export default TeacherNotifications;
