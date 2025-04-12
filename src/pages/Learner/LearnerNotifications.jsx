
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/common/layout/Sidebar";
import { Book, Bell, AlertCircle, Clock, BookOpen } from "lucide-react";
import Header from "../../components/common/layout/Header";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import { useNavigate } from "react-router-dom";
import { 
  getGlobalAnnouncements, 
  getAnnouncementsFromUserCourses 
} from "../../services/announcementService";
import admin_icon from "/src/assets/images/icons/admin_icon.png";
import books_icon from "/src/assets/images/icons/books_icon.png";

const Notifications = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [courseAnnouncements, setCourseAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // all, global, courses
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  const [error, setError] = useState(null);

  const navItems = [
    { text: "Courses", icon: <Book size={20} />, route: "/Learner/Dashboard" },
    {
      text: "Notifications",
      icon: <Bell size={20} />,
      route: "/Learner/Notifications",
    },
  ];

  // Fetch global announcements on component mount
  useEffect(() => {
    fetchGlobalAnnouncements();
    fetchCourseAnnouncements();
  }, []);

  const fetchGlobalAnnouncements = async () => {
    setIsLoadingGlobal(true);
    setError(null);
    
    try {
      const response = await getGlobalAnnouncements();
      
      let announcementData = [];
      if (Array.isArray(response)) {
        console.log("Global response is an array with length:", response.length);
        announcementData = response;
      } else if (response && typeof response === "object") {
        console.log("Global response is an object with keys:", Object.keys(response));
        announcementData = response.announcements || response.data || [];
      } else {
        console.warn("Unexpected response format:", response);
        announcementData = [];
      }
      
      // Mark these as global announcements
      announcementData = announcementData.map(announcement => ({
        ...announcement,
        isGlobal: true
      }));
      
      setAnnouncements(announcementData);
    } catch (err) {
      console.error("Failed to fetch global announcements:", err);
      setError(err.message || "Failed to load global announcements");
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  const fetchCourseAnnouncements = async () => {
    setIsLoadingCourse(true);
    
    try {
      const response = await getAnnouncementsFromUserCourses();
      
      let courseAnnouncementData = [];
      if (Array.isArray(response)) {
        console.log("Course response is an array with length:", response.length);
        courseAnnouncementData = response;
      } else if (response && typeof response === "object") {
        console.log("Course response is an object with keys:", Object.keys(response));
        courseAnnouncementData = response.announcements || response.data || [];
      } else {
        console.warn("Unexpected course response format:", response);
        courseAnnouncementData = [];
      }
      
      // Mark these as course announcements
      courseAnnouncementData = courseAnnouncementData.map(announcement => ({
        ...announcement,
        isCourse: true
      }));
      
      setCourseAnnouncements(courseAnnouncementData);
    } catch (err) {
      console.error("Failed to fetch course announcements:", err);
      // Don't set error here to still show global announcements if courses fail
    } finally {
      setIsLoadingCourse(false);
    }
  };

  const handleNotificationClick = (announcement) => {
    navigate(`/Learner/NotificationDetails/${announcement.announcement_id || announcement.id}`, {
      state: { notification: announcement },
    });
  };

  // Get announcements based on active tab
  const getFilteredAnnouncements = () => {
    switch (activeTab) {
      case "global":
        return announcements;
      case "courses":
        return courseAnnouncements;
      case "all":
      default:
        // Combine and sort all announcements
        const allAnnouncements = [...announcements, ...courseAnnouncements];
        return allAnnouncements.sort((a, b) => 
          new Date(b.createdAt || b.created_at || 0) - 
          new Date(a.createdAt || a.created_at || 0)
        );
    }
  };

  const isLoading = isLoadingGlobal || isLoadingCourse;
  const filteredAnnouncements = getFilteredAnnouncements();

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="hidden lg:flex">
        <Sidebar navItems={navItems} />
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <Header title="Notifications" />

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("all")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "all"
                  ? "border-yellow-500 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setActiveTab("global")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "global"
                  ? "border-yellow-500 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Global Announcements
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "courses"
                  ? "border-yellow-500 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Course Announcements
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-12 h-12 border-4 border-[#F6BA18] border-t-[#212529] rounded-full animate-spin"></div>
            </div>
          ) : error && activeTab !== "courses" ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {error}
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="p-6 text-center">
              <Bell size={32} className="mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
              <p className="text-sm text-gray-500">
                {activeTab === "global" 
                  ? "There are no global announcements at this time." 
                  : activeTab === "courses"
                    ? "There are no announcements from your courses."
                    : "You don't have any notifications at this time."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAnnouncements.map((announcement) => (
                <div
                  key={`${announcement.isCourse ? 'course' : 'global'}-${announcement.announcement_id || announcement.id}`}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  onClick={() => handleNotificationClick(announcement)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={announcement.isCourse ? books_icon : admin_icon}
                        alt=""
                        className="h-12 w-12 rounded-full border-2 border-gray-200"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          announcement.isCourse 
                            ? "bg-blue-100 text-blue-800 border border-blue-200" 
                            : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        }`}>
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
                      {announcement.course_name && (
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                          <BookOpen size={12} className="mr-1" />
                          {announcement.course_name}
                        </div>
                      )}
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

      <MobileNavBar navItems={navItems} />
    </div>
  );
};

export default Notifications;