
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/common/layout/Sidebar";
import { Book, Bell, Hash, Image, AlertCircle, Clock } from "lucide-react";
import Header from "../../components/common/layout/Header";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import { useNavigate } from "react-router-dom";
import { getGlobalAnnouncements } from "../../services/announcementService";
import admin_icon from "/src/assets/images/icons/admin_icon.png";

const Notifications = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Fetch global announcements on component mount
  useEffect(() => {
    fetchGlobalAnnouncements();
  }, []);

  const fetchGlobalAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getGlobalAnnouncements();
      
      let announcementData = [];
      if (Array.isArray(response)) {
        console.log("Response is an array with length:", response.length);
        announcementData = response;
      } else if (response && typeof response === "object") {
        console.log("Response is an object with keys:", Object.keys(response));
        announcementData = response.announcements || response.data || [];
      } else {
        console.warn("Unexpected response format:", response);
        announcementData = [];
      }
      
      // Sort by creation date (newest first)
      announcementData.sort((a, b) => 
        new Date(b.createdAt || b.created_at || 0) - 
        new Date(a.createdAt || a.created_at || 0)
      );
      
      setAnnouncements(announcementData);
    } catch (err) {
      console.error("Failed to fetch global announcements:", err);
      setError(err.message || "Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = (announcement) => {
    navigate(`/Teacher/NotificationDetails/${announcement.announcement_id || announcement.id}`, {
      state: { notification: announcement },
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
        <Header title="Notifications" />

        <div className="bg-white shadow rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-12 h-12 border-4 border-[#F6BA18] border-t-[#212529] rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {error}
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-6 text-center">
              <Bell size={32} className="mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
              <p className="text-sm text-gray-500">You don't have any notifications at this time.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {announcements.map((announcement) => (
                <div
                  key={announcement.announcement_id || announcement.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  onClick={() => handleNotificationClick(announcement)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={announcement.userImage || admin_icon}
                        alt=""
                        className="h-12 w-12 rounded-full border-2 border-gray-200"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          {announcement.title}
                        </span>
                        <span className="flex items-center text-xs text-gray-500">
                          <Clock size={12} className="mr-1" />
                          {new Date(announcement.createdAt || announcement.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-900 font-medium line-clamp-2">
                        {announcement.message}
                      </p>
                      {announcement.user && (
                        <div className="mt-1 text-xs text-gray-500">
                          By: {announcement.user.first_name || ''} {announcement.user.last_name || ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavBar navItems={navItems} />
    </div>
  );
};

export default Notifications;