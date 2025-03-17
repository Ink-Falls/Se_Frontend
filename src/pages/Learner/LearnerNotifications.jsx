import React from "react";
import Sidebar from "../../components/common/layout/Sidebar";
import { Book, Bell } from "lucide-react";
import Header from "../../components/common/layout/Header";
import NotificationsComponent from "./NotificationsComponent"; // Update this line
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate();

  const navItems = [
    { text: "Courses", icon: <Book size={20} />, route: "/Learner/Dashboard" },
    {
      text: "Notifications",
      icon: <Bell size={20} />,
      route: "/Learner/Notifications",
    },
  ];

  const notificationsData = [
    {
      id: 1,
      type: "Course Update",
      description: "Environmental Science class schedule updated",
      time: "10 minutes ago",
      userImage:
        "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg",
    },
    {
      id: 2,
      type: "Assignment Due",
      description: "New assignment posted in Computer Programming",
      time: "30 minutes ago",
      userImage:
        "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="hidden lg:flex">
        <Sidebar navItems={navItems} />
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <Header title="All Notifications" />
        <NotificationsComponent notifications={notificationsData} />
      </div>

      <MobileNavBar />
    </div>
  );
};

export default Notifications;
