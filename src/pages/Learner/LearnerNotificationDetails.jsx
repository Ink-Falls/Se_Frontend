import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import { ArrowLeft, Book, Bell, Clock, AlertCircle, BookOpen } from "lucide-react";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import admin_icon from "/src/assets/images/icons/admin_icon.png";
import books_icon from "/src/assets/images/icons/books_icon.png";
import { getAnnouncementById, getCoursesByUserId } from "../../services/announcementService";

const NotificationDetails = () => {
  const navigate = useNavigate(); 
  const { id } = useParams();
  const location = useLocation();
  const notificationFromState = location.state?.notification;
  
  const [notification, setNotification] = useState(notificationFromState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userCourses, setUserCourses] = useState([]);

  const navItems = [
    { text: "Courses", icon: <Book size={20} />, route: "/Learner/Dashboard" },
    {
      text: "Notifications", 
      icon: <Bell size={20} />,
      route: "/Learner/Notifications",
    },
  ];

  // Fetch the notification data if not provided in location state
  useEffect(() => {
    if (!notificationFromState && id) {
      fetchAnnouncementData();
    }
  }, [id, notificationFromState]);

  // Fetch user courses to check for redirection options
  useEffect(() => {
    const fetchUserCourses = async () => {
      try {
        const courses = await getCoursesByUserId();
        setUserCourses(courses);
      } catch (err) {
        console.error("Failed to fetch user courses:", err);
      }
    };
    
    fetchUserCourses();
  }, []);

  // Fetch announcement data using announcement ID
  const fetchAnnouncementData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to get the announcement directly by ID
      const response = await getAnnouncementById(id);
      const announcementData = response.announcement || response;
      
      if (announcementData && (announcementData.title || announcementData.message)) {
        // If the announcement has a course_id, determine if it belongs to user's courses
        if (announcementData.course_id) {
          // Add isCourse flag for styling
          announcementData.isCourse = true;
          
          // Fetch courses to get course name if not already in the data
          if (!announcementData.course_name) {
            try {
              const courses = await getCoursesByUserId();
              const course = courses.find(c => c.id === announcementData.course_id);
              if (course) {
                announcementData.course_name = course.name;
              }
            } catch (err) {
              console.error("Error fetching course details:", err);
            }
          }
        } else {
          // This is a global announcement
          announcementData.isGlobal = true;
        }
        
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
                onClick={() => navigate("/Learner/Notifications")}
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
                onClick={() => navigate("/Learner/Notifications")}
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
                    src={notification.isCourse ? books_icon : admin_icon}
                    alt=""
                    className="h-12 w-12 rounded-full border-2 border-gray-200"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        notification.isCourse
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }`}
                    >
                      {notification.type || notification.title}
                    </span>
                    <span className="flex items-center text-xs text-gray-500">
                      <Clock size={12} className="mr-1" />
                      {notification.time || new Date(notification.createdAt || notification.created_at || Date.now()).toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Course information if present */}
                  {(notification.course_name || notification.course_id) && (
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <BookOpen size={16} className="mr-2" />
                      <span>
                        Course: {notification.course_name || `Course ID: ${notification.course_id}`}
                      </span>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    {/* Display the title as a heading */}
                    <h1 className="text-xl font-bold text-gray-900 mb-4">
                      {notification.title || notification.type || "Notification"}
                    </h1>
                    
                    {/* Display the message content - ensuring no duplication */}
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed">
                        {notification.message || notification.details || "No details available for this notification."}
                      </p>
                    </div>
                    
                    {/* Author information if available */}
                    {notification.user && (
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-600">
                          Posted by: <span className="font-medium">{notification.user.first_name} {notification.user.last_name}</span>
                        </div>
                        {notification.updated_at && notification.updated_at !== notification.created_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            Last updated: {new Date(notification.updated_at).toLocaleString()}
                          </div>
                        )}
                      </div>
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