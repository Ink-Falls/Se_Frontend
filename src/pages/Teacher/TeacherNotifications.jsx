import React, { useState, useEffect } from "react";
import Sidebar from "../../components/common/layout/Sidebar";
import { Book, Bell, Hash, Image, AlertCircle, Clock, Settings, MoreVertical, X } from "lucide-react";
import Header from "../../components/common/layout/Header";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import { useNavigate } from "react-router-dom";
import { getGlobalAnnouncements, getCoursesByUserId, getAnnouncementsFromUserCourses, getAnnouncementsByCourse } from "../../services/announcementService";
import admin_icon from "/src/assets/images/icons/admin_icon.png";
import books_icon from "/src/assets/images/icons/books_icon.png";

const Notifications = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [courseAnnouncements, setCourseAnnouncements] = useState([]);
  const [userCourses, setUserCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // all, global, courses
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    persistDays: -1, // Default to "None"
    showTimeLabels: true, 
    seenNotifications: {}
  });
  const [notificationDots, setNotificationDots] = useState({
    announcements: 0,
    globalTotal: 0,
    courseTotal: 0
  });

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

  useEffect(() => {
    const savedSettings = localStorage.getItem("teacher_notification_settings");
    if (savedSettings) {
      setNotificationSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("teacher_notification_settings", JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  useEffect(() => {
    fetchUserCourses();
    fetchGlobalAnnouncements();
  }, []);

  useEffect(() => {
    if (userCourses && userCourses.length > 0) {
      fetchCourseAnnouncements();
    }
  }, [userCourses]);

  useEffect(() => {
    const { seenNotifications, persistDays } = notificationSettings;
    const now = new Date().getTime();
    
    const getFilteredNotificationCounts = (notifications, type) => {
      let ageFilteredItems = [...notifications];
      
      if (persistDays > 0) {
        ageFilteredItems = notifications.filter(item => {
          const creationDate = item.createdAt || item.created_at;
          if (!creationDate) return true;
          
          const createdAt = new Date(creationDate).getTime();
          if (isNaN(createdAt)) return true;
          
          const diffInMs = now - createdAt;
          const diffInDays = diffInMs / (24 * 60 * 60 * 1000);
          
          return diffInDays <= persistDays;
        });
      }
      
      const totalCount = ageFilteredItems.length;
      
      const unseenCount = ageFilteredItems.filter(item => {
        if (persistDays === -1) return false;
        
        let notificationId;
        if (type === "global") {
          notificationId = `global_${item.announcement_id || item.id}`;
        } else if (type === "course") {
          notificationId = `course_${item.announcement_id || item.id}`;
        }
        
        const lastSeen = seenNotifications[notificationId] || 0;
        const createdAt = new Date(item.createdAt || item.created_at).getTime();
        
        return !lastSeen || createdAt > lastSeen;
      }).length;
      
      return { total: totalCount, unseen: unseenCount };
    };

    const globalCounts = getFilteredNotificationCounts(announcements, "global");
    const courseCounts = getFilteredNotificationCounts(courseAnnouncements, "course");

    setNotificationDots({
      announcements: globalCounts.unseen + courseCounts.unseen,
      globalTotal: globalCounts.total,
      courseTotal: courseCounts.total
    });
  }, [announcements, courseAnnouncements, notificationSettings]);

  const fetchUserCourses = async () => {
    try {
      setIsLoadingCourse(true);
      const courses = await getCoursesByUserId();
      if (courses && Array.isArray(courses)) {
        setUserCourses(courses);
      } else {
        setUserCourses([]);
      }
    } catch (err) {
      setUserCourses([]);
    } finally {
      setIsLoadingCourse(false);
    }
  };

  const fetchGlobalAnnouncements = async () => {
    setIsLoadingGlobal(true);
    setError(null);
    
    try {
      const response = await getGlobalAnnouncements();
      
      let announcementData = [];
      if (Array.isArray(response)) {
        announcementData = response;
      } else if (response && typeof response === "object") {
        announcementData = response.announcements || response.data || [];
      } else {
        announcementData = [];
      }
      
      announcementData = announcementData.map(announcement => ({
        ...announcement,
        isGlobal: true
      }));
      
      setAnnouncements(announcementData);
    } catch (err) {
      setError(err.message || "Failed to load global announcements");
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  const fetchCourseAnnouncements = async () => {
    if (!userCourses || userCourses.length === 0) {
      return;
    }

    setIsLoadingCourse(true);
    
    try {
      const response = await getAnnouncementsFromUserCourses();
      
      let courseAnnouncementData = [];
      
      if (Array.isArray(response)) {
        courseAnnouncementData = response;
      } else if (response && typeof response === "object") {
        courseAnnouncementData = response.announcements || response.data || [];
      } else {
        courseAnnouncementData = [];
      }
      
      if (courseAnnouncementData.length === 0) {
        const allAnnouncements = [];
        
        for (const course of userCourses) {
          try {
            const courseId = course.id || course.course_id;
            if (!courseId) continue;
            
            const courseAnnouncements = await getAnnouncementsByCourse(courseId);
            
            let announcements = [];
            if (Array.isArray(courseAnnouncements)) {
              announcements = courseAnnouncements;
            } else if (courseAnnouncements && typeof courseAnnouncements === "object") {
              announcements = courseAnnouncements.announcements || courseAnnouncements.data || [];
            }
            
            announcements = announcements.map(announcement => ({
              ...announcement,
              course_id: courseId,
              course_name: course.name || `Course ${courseId}`,
              isCourse: true,
              type: "announcement",
              createdAt: announcement.createdAt || announcement.created_at || new Date().toISOString(),
            }));
            
            allAnnouncements.push(...announcements);
          } catch (err) {}
        }
        
        courseAnnouncementData = allAnnouncements;
      } else {
        courseAnnouncementData = courseAnnouncementData.map(announcement => {
          const course = userCourses.find(c => c.id === announcement.course_id);
          return {
            ...announcement,
            course_name: course?.name || `Course ${announcement.course_id}`,
            isCourse: true,
            type: "announcement",
            createdAt: announcement.createdAt || announcement.created_at || new Date().toISOString(),
          };
        });
      }
      
      setCourseAnnouncements(courseAnnouncementData);
    } catch (err) {} finally {
      setIsLoadingCourse(false);
    }
  };

  const handleNotificationClick = (notification) => {
    const now = new Date().getTime();
    const notificationType = notification.isCourse ? "course" : "global";
    let notificationId;
    
    switch (notificationType) {
      case "course":
        notificationId = `course_${notification.announcement_id || notification.id}`;
        break;
      default:
        notificationId = `global_${notification.announcement_id || notification.id}`;
    }
    
    setNotificationSettings(prev => ({
      ...prev,
      seenNotifications: {
        ...prev.seenNotifications,
        [notificationId]: now
      }
    }));
    
    navigate(`/Teacher/NotificationDetails/${notification.announcement_id || notification.id}`, {
      state: { 
        notification: notification,
        courseId: notification.course_id 
      },
    });
  };

  const getFilteredNotifications = () => {
    const filterByAge = (notifs) => {
      if (notificationSettings.persistDays === -1) return notifs;
      
      if (!notifs || notifs.length === 0) return [];
      
      const now = new Date().getTime();
      
      return notifs.filter(notification => {
        if (!notification) return false;
        
        try {
          const creationDate = notification.createdAt || notification.created_at;
          if (!creationDate) return true;
          
          const createdAtMillis = new Date(creationDate).getTime();
          if (isNaN(createdAtMillis)) return true;
          
          const diffInMs = now - createdAtMillis;
          const diffInDays = diffInMs / (24 * 60 * 60 * 1000);
          
          return diffInDays <= notificationSettings.persistDays;
        } catch (err) {
          console.error("Error filtering notification:", err);
          return true;
        }
      });
    };

    let result = [];
    
    switch (activeTab) {
      case "global":
        result = filterByAge(announcements);
        break;
      case "courses":
        result = filterByAge(courseAnnouncements);
        break;
      case "all":
      default:
        const filteredAnnouncements = filterByAge(announcements);
        const filteredCourseAnnouncements = filterByAge(courseAnnouncements);
        
        result = [...filteredAnnouncements, ...filteredCourseAnnouncements];
        break;
    }
    
    return result.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
      const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
      return dateB - dateA;
    });
  };

  const handleRefreshNotifications = () => {
    fetchGlobalAnnouncements();
    fetchUserCourses();
  };

  const isLoading = isLoadingGlobal || isLoadingCourse;
  const filteredNotifications = getFilteredNotifications();
  
  const getNotificationBadgeStyle = (notification) => {
    if (notification.isCourse) {
      return "bg-blue-100 text-blue-800 border border-blue-200";
    }
    return "bg-yellow-100 text-yellow-800 border border-yellow-200";
  };
  
  const getNotificationIcon = (notification) => {
    return <Bell size={20} className={notification.isCourse ? "text-blue-600" : "text-yellow-600"} />;
  };

  const getNotificationTag = (notification) => {
    return notification.isCourse ? "Course Announcement" : "Global Announcement";
  };

  const getRelativeTimeString = (timestamp) => {
    const now = new Date().getTime();
    const date = new Date(timestamp).getTime();
    const diffInMs = now - date;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInDays = diffInSeconds / 86400; // exact days with decimal precision
    
    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays < 1.5) {
      return "1 day ago";
    } else if (diffInDays < 2.5) {
      return "2 days ago";
    } else if (diffInDays < 3.5) {
      return "3 days ago";
    } else if (diffInDays < 4.5) {
      return "4 days ago";
    } else if (diffInDays < 5.5) {
      return "5 days ago";
    } else if (diffInDays < 6.5) { 
      return "6 days ago";
    } else if (diffInDays < 7.5) {
      return "7 days ago";
    } else if (diffInDays < 14) {
      return `${Math.floor(diffInDays)} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
  };

  const isNewNotification = (notification) => {
    const { seenNotifications, persistDays } = notificationSettings;
    
    if (persistDays === -1) return false;
    
    let notificationId = "";
    
    if (notification.isCourse) {
      notificationId = `course_${notification.announcement_id || notification.id}`;
    } else {
      notificationId = `global_${notification.announcement_id || notification.id}`;
    }
    
    const lastSeen = seenNotifications[notificationId] || 0;
    const creationDate = notification.createdAt || notification.created_at;
    if (!creationDate) return true;
    
    const createdAt = new Date(creationDate).getTime();
    if (isNaN(createdAt)) return true;
    
    if (persistDays > 0) {
      const now = new Date().getTime();
      const ageInMillis = now - createdAt;
      const ageInDays = ageInMillis / (24 * 60 * 60 * 1000);
      
      if (ageInDays > persistDays) {
        return false;
      }
    }

    return !lastSeen || (createdAt > lastSeen);
  };

  const renderSettingsPanel = () => (
    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">Notification Settings</h3>
          <button 
            onClick={() => setShowSettings(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Show "New" indicator for
          </label>
          <select 
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
            value={notificationSettings.persistDays}
            onChange={(e) => {
              const newPersistDays = parseInt(e.target.value);
              setNotificationSettings(prev => ({
                ...prev,
                persistDays: newPersistDays
              }));
            }}
          >
            <option value={-1}>None</option>
            <option value={2}>Notifications up to 2 days old</option>
            <option value={5}>Notifications up to 5 days old</option>
            <option value={7}>Notifications up to 7 days old</option>
            <option value={14}>Notifications up to 14 days old</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Choose how long notifications should be marked as "New" after they're created
          </p>
        </div>
        
        <div className="mb-4 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Show time labels
          </label>
          <div className="relative inline-block w-10 align-middle select-none">
            <input 
              type="checkbox"
              checked={notificationSettings.showTimeLabels}
              onChange={() => setNotificationSettings(prev => ({
                ...prev,
                showTimeLabels: !prev.showTimeLabels
              }))}
              className="sr-only"
              id="toggle-time-labels"
            />
            <label 
              htmlFor="toggle-time-labels" 
              className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                notificationSettings.showTimeLabels ? 'bg-yellow-500' : 'bg-gray-300'
              }`}
            >
              <span 
                className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                  notificationSettings.showTimeLabels ? 'translate-x-4' : 'translate-x-0'
                }`} 
              />
            </label>
          </div>
        </div>
        
        <button 
          onClick={() => setNotificationSettings(prev => ({
            ...prev,
            persistDays: -1,
            seenNotifications: {}
          }))}
          className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm font-medium transition-colors"
        >
          Reset All Indicators
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="hidden lg:flex">
        <Sidebar navItems={navItems} />
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <Header title="Notifications" />

        <div className="mb-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab("all")}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                  activeTab === "all"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All Notifications
                {notificationSettings.persistDays === -1 && (notificationDots.announcements) > 0 && (
                  <span className="flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-xs">
                    {notificationDots.announcements}
                  </span>
                )}
                <span className="ml-1 text-xs text-gray-500">
                  ({notificationDots.globalTotal + notificationDots.courseTotal})
                </span>
              </button>
              <button
                onClick={() => setActiveTab("global")}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                  activeTab === "global"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Global Announcements
                {notificationSettings.persistDays === -1 && notificationDots.announcements > 0 && (
                  <span className="flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-amber-500 text-white text-xs">
                    {notificationDots.announcements}
                  </span>
                )}
                <span className="ml-1 text-xs text-gray-500">
                  ({notificationDots.globalTotal})
                </span>
              </button>
              <button
                onClick={() => setActiveTab("courses")}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                  activeTab === "courses"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Course Announcements
                {notificationSettings.persistDays === -1 && notificationDots.announcements > 0 && (
                  <span className="flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-amber-500 text-white text-xs">
                    {notificationDots.announcements}
                  </span>
                )}
                <span className="ml-1 text-xs text-gray-500">
                  ({notificationDots.courseTotal})
                </span>
              </button>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 my-1"
              >
                <Settings size={18} className="text-gray-600" />
              </button>
              {showSettings && renderSettingsPanel()}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg flex flex-col h-[calc(100vh-160px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 flex-1">
              <div className="w-12 h-12 border-4 border-[#F6BA18] border-t-[#212529] rounded-full animate-spin"></div>
            </div>
          ) : error && activeTab !== "courses" ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {error}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-6 text-center flex-1 flex flex-col items-center justify-center">
              <Bell size={32} className="mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
              <p className="text-sm text-gray-500">
                {activeTab === "global" 
                  ? "There are no global announcements at this time." 
                  : activeTab === "courses"
                    ? "There are no announcements from your courses."
                    : "You don't have any notifications at this time."}
              </p>
              
              <button 
                onClick={handleRefreshNotifications}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
              >
                Refresh notifications
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 overflow-y-auto flex-1">
              {filteredNotifications.map((notification) => {
                const notificationId = notification.id || `${notification.type}-${notification.announcement_id || Math.random()}`;
                const isNewItem = isNewNotification(notification);
                
                const creationTime = new Date(notification.createdAt || notification.created_at).getTime();
                const relativeTime = getRelativeTimeString(creationTime);
                
                return (
                  <div
                    key={notificationId}
                    className={`p-6 hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${
                      notification.isCourse ? "border-l-4 border-l-amber-300" : "border-l-4 border-l-yellow-300"
                    } ${isNewItem ? 'bg-gray-50' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full relative">
                        <img
                          src={notification.isCourse ? books_icon : admin_icon}
                          alt=""
                          className="h-12 w-12 rounded-full border-2 border-gray-200"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNotificationBadgeStyle(notification)}`}>
                            {getNotificationTag(notification)}
                          </span>
                          <span className="flex items-center text-xs text-gray-500">
                            <Clock size={12} className="mr-1" />
                            {notificationSettings.showTimeLabels 
                              ? relativeTime 
                              : new Date(notification.createdAt || notification.created_at).toLocaleString()}
                          </span>
                          
                          {isNewItem && notificationSettings.persistDays !== -1 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                              New
                            </span>
                          )}
                        </div>
                        
                        {notification.title && (
                          <h4 className="mt-2 font-medium text-gray-900">
                            {notification.title}
                          </h4>
                        )}
                        
                        <p className={`${notification.title ? 'mt-1' : 'mt-2'} text-sm text-gray-700 font-medium line-clamp-2`}>
                          {notification.message || notification.description}
                        </p>
                        
                        {(notification.course_name || notification.course_id) && (
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <Book size={12} className="mr-1" />
                            {notification.course_name || `Course ID: ${notification.course_id}`}
                          </div>
                        )}
                        
                        {notification.user && (
                          <div className="mt-1 text-xs text-gray-500">
                            By: {notification.user.first_name || ''} {notification.user.last_name || ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <MobileNavBar navItems={navItems} />
    </div>
  );
};

export default Notifications;