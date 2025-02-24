import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Book, Bell } from "lucide-react";

const NotificationPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const notification = location.state?.notification; // Get notification data

  const navItems = [
    { text: "Courses", icon: <Book size={20} />, route: "/TeacherDashboard" },
    {
      text: "Notifications",
      icon: <Bell size={20} />,
      route: "/TeacherNotification",
    },
  ];

  // If no notification data is found, show error
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
      {/* Sidebar */}
      <Sidebar navItems={navItems} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Header title="Notification" />

        {/* Notification Card */}
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-10">
          {/* Back Button */}
          <button
            className="flex items-center text-gray-500 text-sm mb-6"
            onClick={() => navigate("/TeacherNotification")}
          >
            ↩ Back
          </button>

          {/* User Info */}
          <div className="flex items-center">
            <img
              src={notification.userImage}
              alt="User Avatar"
              className="w-14 h-14 rounded-full mr-4"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                {notification.type}
              </h3>
              <p className="text-sm text-gray-600">Learner’s Name</p>
              <p className="text-xs text-gray-500">{notification.time}</p>
            </div>
          </div>

          {/* Notification Text */}
          <p className="text-gray-700 mt-5 text-md">
            {notification.description}
          </p>

          {/* Action Button */}
          <div className="flex justify-end mt-10">
            <button className="bg-gray-900 text-white px-4 py-3 rounded-md hover:bg-gray-800">
              Go to submission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
