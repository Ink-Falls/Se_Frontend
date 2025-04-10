import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import { ArrowLeft, Book, Bell, Hash, Image } from "lucide-react";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import admin_icon from "/src/assets/images/icons/admin_icon.png";
import learner_icon from "/src/assets/images/icons/learner_icon.png";

const NotificationPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const notification = location.state?.notification;

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

  if (!notification) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-4 md:p-6">
          <Header title="Notification" />
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 p-6 text-center">
              <p className="text-gray-500">Notification not found.</p>
              <button
                className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                onClick={() => navigate("/Teacher/Notifications")}
              >
                <ArrowLeft size={18} className="mr-2" />
                Back to Notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-4 md:p-6">
        <Header title="Notification" />

        <div className="max-w-full mt-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-gray-50 py-4 px-6 flex items-center justify-between border-b">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-gray-800">Details</h2>
              </div>
              <button
                onClick={() => navigate("/Teacher/Notifications")}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={
                      notification.id === 1
                        ? learner_icon
                        : notification.id === 2
                        ? admin_icon
                        : notification.type.toLowerCase().includes("admin")
                        ? admin_icon
                        : learner_icon
                    }
                    alt=""
                    className="h-12 w-12 rounded-full border-2 border-gray-200"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        notification.type.toLowerCase().includes("submission")
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }`}
                    >
                      {notification.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {notification.time}
                    </span>
                  </div>
                  <div className="mt-4 prose max-w-none">
                    <p className="text-gray-900 text-lg font-medium">
                      {notification.description}
                    </p>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {notification.details ||
                          "No additional details are available for this notification."}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileNavBar navItems={navItems} />
    </div>
  );
};

export default NotificationPage;
