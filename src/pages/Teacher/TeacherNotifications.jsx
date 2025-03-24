import React, { useState } from "react";
import Sidebar from "../../components/common/layout/Sidebar";
import { Book, Bell } from "lucide-react";
import Header from "../../components/common/layout/Header";
import NotificationsComponent from "./NotificationsComponent"; // Fix import path
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate();

  // Sidebar Navigation Items (Only for large screens)
  const navItems = [
    { text: "Courses", icon: <Book size={20} />, route: "/Teacher/Dashboard" },
    {
      text: "Notifications",
      icon: <Bell size={20} />,
      route: "/Teacher/Notifications",
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

  const handleNotificationClick = (notification) => {
    navigate(`/Teacher/NotificationDetails/${notification.id}`, {
      state: { notification },
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (Large Screens Only) */}
      <div className="hidden lg:flex">
        <Sidebar navItems={navItems} />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <Header title="All Notifications" />
        <NotificationsComponent notifications={notificationsData} />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavBar navItems={navItems} />
    </div>
  );
};

export default Notifications;
