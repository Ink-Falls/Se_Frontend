import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import { ArrowLeft, Book, Bell } from "lucide-react";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import admin_icon from "/src/assets/images/icons/admin_icon.png";
import books_icon from "/src/assets/images/icons/books_icon.png";

const getNotificationStyles = (type) => {
  switch (type.toLowerCase()) {
    case "course update":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "assignment due":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const NotificationDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const notification = location.state?.notification;

  const navItems = [
    { text: "Courses", icon: <Book size={20} />, route: "/Learner/Dashboard" },
    {
      text: "Notifications",
      icon: <Bell size={20} />,
      route: "/Learner/Notifications", // Change this to match notifications
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
                aria-label="Back to Notifications"
                className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                onClick={() => navigate("/Learner/Notifications")}
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
          {" "}
          {/* Changed from max-w-3xl to max-w-full */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-gray-50 py-4 px-6 flex items-center justify-between border-b">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-gray-800">Details</h2>
              </div>
              <button
                onClick={() => navigate("/Learner/Notifications")}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={
                      notification.id === 1
                        ? admin_icon
                        : notification.id === 2
                        ? books_icon
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
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getNotificationStyles(
                        notification.type
                      )}`}
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
                    {notification.id === 1 && (
                      <button
                        onClick={() =>
                          (window.location.href = "/Learner/Assessment")
                        }
                        className="inline-flex items-center mt-5 px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        Go to Assessment
                      </button>
                    )}
                    {notification.id === 2 && (
                      <button
                        onClick={() =>
                          (window.location.href = "/Learner/Course")
                        }
                        className="inline-flex mt-5 items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        Go to Course
                      </button>
                    )}
                  </div>
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

export default NotificationDetails;
