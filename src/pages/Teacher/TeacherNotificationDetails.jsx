import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import { ArrowLeft, Book, Bell, Hash, Image, Clock, AlertCircle } from "lucide-react";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import admin_icon from "/src/assets/images/icons/admin_icon.png";
import learner_icon from "/src/assets/images/icons/learner_icon.png";
import { getAnnouncementById } from "../../services/announcementService";

const NotificationPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const notificationFromState = location.state?.notification;
  
  const [notification, setNotification] = useState(notificationFromState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the notification data if not provided in location state
  useEffect(() => {
    if (!notificationFromState && id) {
      fetchAnnouncementData();
    }
  }, [id, notificationFromState]);

  // Fetch announcement data using announcement ID
  const fetchAnnouncementData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to get the announcement directly by ID
      const response = await getAnnouncementById(id);
      const announcementData = response.announcement || response;
      
      if (announcementData && (announcementData.title || announcementData.message)) {
        setNotification(announcementData);
        setIsLoading(false);
        return;
      } else {
        throw new Error("Announcement not found");
      }
    } catch (err) {
      console.error("Failed to fetch notification details:", err);
      setError(err.message || "Failed to load notification details");
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-4 md:p-6 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-[#F6BA18] border-t-[#212529] rounded-full animate-spin"></div>
        </div>
        <MobileNavBar navItems={navItems} />
      </div>
    );
  }

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
        <MobileNavBar navItems={navItems} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-4 md:p-6">
        <Header title="Notification" />
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}

        <div className="max-w-full mt-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            {/* Header with Back button */}
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
                      notification.userImage ||
                      (notification.type && notification.type.toLowerCase().includes("admin")
                        ? admin_icon
                        : learner_icon)
                    }
                    alt=""
                    className="h-12 w-12 rounded-full border-2 border-gray-200"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        notification.type && notification.type.toLowerCase().includes("submission")
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }`}
                    >
                      {notification.type || notification.title}
                    </span>
                    <span className="flex items-center text-xs text-gray-500">
                      <Clock size={12} className="mr-1" />
                      {notification.time || new Date(notification.createdAt || Date.now()).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-4 prose max-w-none">
                    <p className="text-gray-900 text-lg font-medium">
                      {notification.description || notification.message}
                    </p>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {notification.details ||
                          "No additional details are available for this notification."}
                      </p>
                    </div>
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

export default NotificationPage;
