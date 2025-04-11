import React, { useState } from "react";
import Sidebar from "../../components/common/layout/Sidebar";
import { Book, Bell, Hash, Image } from "lucide-react";
import Header from "../../components/common/layout/Header";
import NotificationsComponent from "./NotificationsComponent"; // Fix import path
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import { useNavigate } from "react-router-dom";
import books_icon from "/src/assets/images/icons/books_icon.png";
import school_icon from "/src/assets/images/icons/school_icon.png";

const Notifications = () => {
  const navigate = useNavigate();

  // Updated navItems to match TeacherDashboard
  const navItems = [
    { text: "Courses", icon: <Book size={20} />, route: "/Teacher/Dashboard" },
    {
      text: "Notifications",
      icon: <Bell size={20} />,
      route: "/Teacher/Notifications",
    },
    {
      text: "Number Codes (4-6)",
      icon: <Hash size={20} />,
      route: "/Teacher/StudentCodeGenerator",
    },
    {
      text: "Picture Codes (1-3)",
      icon: <Image size={20} />,
      route: "/Teacher/PictureCodeGenerator",
    },
  ];

  // Placeholder data for notifications
  const notificationsData = [
    {
      id: 1,
      type: "New Submission",
      description: "New Submission for Activity 1 - Environmental Science",
      time: "10 minutes ago",
      userImage: books_icon,
    },
    {
      id: 2,
      type: "New Announcement",
      description: "Semesteral Break Starts on December 15",
      time: "30 minutes ago",
      userImage: school_icon,
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
