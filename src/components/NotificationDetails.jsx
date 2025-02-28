import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { ArrowLeft, Book, Bell } from "lucide-react";
import MobileNavBar from "./MobileNavbar"; // Import the bottom nav bar

const NotificationPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const notification = location.state?.notification;

  // Sidebar Navigation (Same as TeacherNotification.jsx)
  const navItems = [
    { text: "Courses", icon: <Book size={20} />, route: "/TeacherDashboard" },
    {
      text: "Notifications",
      icon: <Bell size={20} />,
      route: "/TeacherNotification",
    },
  ];

  if (!notification) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-6">
          <Header title="Notification" />
          <p className="text-red-500">Notification not found.</p>
          <button
            className="mt-4 bg-gray-900 text-white px-4 py-2 rounded"
            onClick={() => navigate("/TeacherNotification")}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (Same as TeacherNotification) */}
      <Sidebar navItems={navItems} />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6">
        {/* Page Header */}
        <Header title="Notification Details" />

        {/* Notification Content (Styled like Announcements) */}
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-7 mt-[1vw]">
          {/* Back Button */}
          <button
            className="text-gray-500 text-sm mb-6 flex items-center"
            onClick={() => navigate("/Notifications")}
          >
            <ArrowLeft size={18} className="mr-2" /> Back
          </button>

          {/* Sender Info */}
          <div className="flex items-center space-x-4">
            <img
              src={notification.userImage}
              alt="Sender"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {notification.type}
              </h2>
              <p className="text-gray-500 text-sm">Sender's Name</p>
              <p className="text-gray-500 text-sm">{notification.time}</p>
            </div>
          </div>

          {/* Full Notification Message */}
          <p className="mt-4 text-gray-700">{notification.description}</p>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavBar />
    </div>
  );
};

export default NotificationPage;
