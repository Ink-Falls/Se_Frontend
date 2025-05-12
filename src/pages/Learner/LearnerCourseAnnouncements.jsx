import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import BlackHeader from "../../components/common/layout/BlackHeader";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import {
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
  ArrowUpDown,
  GraduationCap,
  AlertCircle,
  Clock,
  Filter,
  FileText,
  Calendar,
} from "lucide-react";
import { useCourse } from "../../contexts/CourseContext";
import { useAuth } from "../../contexts/AuthContext";
import { getAnnouncementsByCourse } from "../../services/announcementService";
import { getModulesByCourseId } from "../../services/moduleService";
import { getCourseAssessments } from "../../services/assessmentService";
import booksIcon from "../../assets/images/icons/books_icon.png";
import schoolIcon from "../../assets/images/icons/school_icon.png";

const LearnerCourseAnnouncements = () => {
  const navigate = useNavigate();
  const { selectedCourse } = useCourse();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [moduleNotifications, setModuleNotifications] = useState([]);
  const [assessmentNotifications, setAssessmentNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSorted, setIsSorted] = useState(false);
  const [showContentUpdates, setShowContentUpdates] = useState(true);
  const [contentFilter, setContentFilter] = useState("all"); // all, modules, assessments, announcements

  const navItems = [
    { text: "Home", icon: <Home size={20} />, route: "/Learner/Dashboard" },
    {
      text: "Modules",
      icon: <BookOpen size={20} />,
      route: "/Learner/CourseModules",
    },
    {
      text: "Announcements",
      icon: <Megaphone size={20} />,
      route: "/Learner/CourseAnnouncements",
    },
    {
      text: "Assessments",
      icon: <ClipboardList size={20} />,
      route: "/Learner/Assessment",
    },
    {
      text: "Grades",
      icon: <GraduationCap size={20} />,
      route: "/Learner/Grades",
    },
  ];

  useEffect(() => {
    if (!selectedCourse?.id) {
      navigate("/Learner/Dashboard");
      return;
    }
    
    fetchData();
  }, [selectedCourse, navigate]);

  const fetchData = async () => {
    if (!selectedCourse?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch announcements first
      await fetchAnnouncements();
      
      // Fetch modules and assessments for notifications
      await Promise.all([
        fetchModuleNotifications(),
        fetchAssessmentNotifications()
      ]);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err.message || "Failed to load announcements and updates");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await getAnnouncementsByCourse(selectedCourse.id);
      
      let announcementData = [];
      if (Array.isArray(response)) {
        console.log("Announcements response length:", response.length);
        announcementData = response;
      } else if (response && typeof response === "object") {
        console.log("Announcements response keys:", Object.keys(response));
        announcementData = response.announcements || response.data || [];
      } else {
        console.warn("Unexpected announcements response format:", response);
        announcementData = [];
      }
      
      // Format as notifications and add type
      const formattedAnnouncements = announcementData.map(announcement => ({
        ...announcement,
        type: "announcement",
        createdAt: announcement.createdAt || announcement.created_at,
        icon: <Megaphone className="h-5 w-5" />
      }));
      
      // Sort by creation date (newest first)
      formattedAnnouncements.sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      
      setAnnouncements(formattedAnnouncements);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    }
  };

  const fetchModuleNotifications = async () => {
    try {
      const modulesResponse = await getModulesByCourseId(selectedCourse.id);
      
      if (!modulesResponse || !Array.isArray(modulesResponse)) {
        setModuleNotifications([]);
        return;
      }
      
      // Format modules as notifications
      const moduleNotifications = modulesResponse.map(module => ({
        id: `module-${module.module_id || module.id}`,
        title: "New Learning Module",
        message: `A new module "${module.name}" has been added to your course. ${module.description || ''}`,
        createdAt: module.createdAt || module.created_at || new Date().toISOString(),
        module_id: module.module_id || module.id,
        type: "module",
        moduleData: module,
        icon: <BookOpen className="h-5 w-5" />
      }));
      
      // Sort by creation date (newest first)
      moduleNotifications.sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      
      setModuleNotifications(moduleNotifications);
    } catch (err) {
      console.error("Failed to fetch modules for notifications:", err);
      setModuleNotifications([]);
    }
  };

  const fetchAssessmentNotifications = async () => {
    try {
      // First get all modules
      const modulesResponse = await getModulesByCourseId(selectedCourse.id);
      if (!modulesResponse || !Array.isArray(modulesResponse)) {
        setAssessmentNotifications([]);
        return;
      }
      
      let allAssessmentNotifications = [];
      
      // For each module, get its assessments
      for (const module of modulesResponse) {
        try {
          const moduleId = module.module_id || module.id;
          const assessmentsResponse = await getCourseAssessments(moduleId, true);
          
          if (assessmentsResponse.success && assessmentsResponse.assessments) {
            // Filter published assessments
            const publishedAssessments = assessmentsResponse.assessments
              .filter(assessment => assessment.is_published);
              
            // Convert to notifications format
            const assessmentNotifs = publishedAssessments.map(assessment => ({
              id: `assessment-${assessment.id}`,
              title: `New ${assessment.type || "Assessment"}`,
              message: `A new assessment "${assessment.title}" has been added to module "${module.name}". Due: ${new Date(assessment.due_date).toLocaleDateString()}.`,
              createdAt: assessment.createdAt || assessment.created_at || new Date().toISOString(),
              module_id: moduleId,
              assessment_id: assessment.id,
              type: "assessment",
              assessmentData: assessment,
              icon: <ClipboardList className="h-5 w-5" />
            }));
            
            allAssessmentNotifications = [...allAssessmentNotifications, ...assessmentNotifs];
          }
        } catch (err) {
          console.error(`Failed to fetch assessments for module ${module.module_id}:`, err);
        }
      }
      
      // Sort by creation date (newest first)
      allAssessmentNotifications.sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      
      setAssessmentNotifications(allAssessmentNotifications);
    } catch (err) {
      console.error("Failed to fetch assessments for notifications:", err);
      setAssessmentNotifications([]);
    }
  };
  
  const handleSort = () => {
    // Function that sorts all items
    const sortAllItems = (items, ascending) => {
      return [...items].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0);
        const dateB = new Date(b.createdAt || b.created_at || 0);
        return ascending ? dateA - dateB : dateB - dateA;
      });
    };
    
    // Sort all notification types
    setAnnouncements(sortAllItems(announcements, isSorted));
    setModuleNotifications(sortAllItems(moduleNotifications, isSorted));
    setAssessmentNotifications(sortAllItems(assessmentNotifications, isSorted));
    setIsSorted(!isSorted);
  };

  const handleContentFilterChange = (filter) => {
    setContentFilter(filter);
  };
  
  // Function to navigate based on notification type
  const handleNotificationClick = (notification) => {
    // Only navigate for announcement notifications
    if (notification.type === "announcement") {
      navigate(`/Learner/AnnouncementDetails/${notification.announcement_id || notification.id}`);
    }
    // No navigation for module and assessment notifications
  };
  
  // Get notification badge style based on type
  const getNotificationBadgeStyle = (type) => {
    switch (type) {
      case "module":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "assessment":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "announcement":
      default:
        return "bg-amber-100 text-amber-800 border border-amber-200";
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (notification) => {
    switch (notification.type) {
      case "module":
        return <BookOpen className="h-5 w-5 text-emerald-600" />;
      case "assessment":
        return <ClipboardList className="h-5 w-5 text-purple-600" />;
      case "announcement":
      default:
        return <Megaphone className="h-5 w-5 text-amber-600" />;
    }
  };

  // New helper function to get notification tag text
  const getNotificationTag = (notification) => {
    switch (notification.type) {
      case "module":
        return "Module";
      case "assessment":
        return "Assessment";
      case "announcement":
      default:
        return "Announcement";
    }
  };

  // New helper function to get notification title
  const getNotificationTitle = (notification) => {
    if (notification.type === "announcement") {
      return notification.title || "Course Announcement";
    }
    if (notification.type === "module") {
      return notification.title || "New Learning Module";
    }
    if (notification.type === "assessment") {
      return notification.assessmentData?.title || notification.title || "New Assessment";
    }
    return notification.title || "Notification";
  };

  // New helper function to get notification message
  const getNotificationMessage = (notification) => {
    return notification.message || notification.description || "No additional details";
  };

  // Combined and filtered notifications
  const getAllNotifications = () => {
    // Start with an empty array
    let allItems = [];
    
    // Add items based on filter
    if (contentFilter === "all" || contentFilter === "announcements") {
      allItems = [...allItems, ...announcements];
    }
    
    if (showContentUpdates) {
      if (contentFilter === "all" || contentFilter === "modules") {
        allItems = [...allItems, ...moduleNotifications];
      }
      
      if (contentFilter === "all" || contentFilter === "assessments") {
        allItems = [...allItems, ...assessmentNotifications];
      }
    }
    
    // Sort by date
    return allItems.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || 0);
      const dateB = new Date(b.createdAt || b.created_at || 0);
      return isSorted ? dateA - dateB : dateB - dateA;
    });
  };

  const renderNotificationItems = () => {
    const notifications = getAllNotifications();
    
    return notifications.map((notification) => {
      const isContentNotification = notification.type === "module" || notification.type === "assessment";
      const isClickable = notification.type === "announcement";
      
      return (
        <div
          key={notification.id || notification.announcement_id}
          className={`group p-6 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-200 last:border-b-0 ${
            notification.type === "module" ? "border-l-4 border-l-emerald-300" :
            notification.type === "assessment" ? "border-l-4 border-l-purple-300" :
            "border-l-4 border-l-amber-300"
          } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={() => isClickable ? handleNotificationClick(notification) : null}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                notification.type === "module" 
                  ? "bg-emerald-100 text-emerald-600" 
                  : notification.type === "assessment"
                    ? "bg-purple-100 text-purple-600"
                    : "bg-amber-100 text-amber-600"
              }`}>
                {getNotificationIcon(notification)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNotificationBadgeStyle(notification.type)}`}>
                  {getNotificationTag(notification)}
                </span>
                <span className="flex items-center text-xs text-gray-500">
                  <Clock size={12} className="mr-1" />
                  {new Date(notification.createdAt || notification.created_at).toLocaleDateString()}
                </span>
                {notification.type === "assessment" && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    Due Soon
                  </span>
                )}
                {!isClickable && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                    Info Only
                  </span>
                )}
              </div>
              
              {/* Title displayed as heading */}
              <h3 className={`mt-2 text-base font-medium ${
                notification.type === "module" 
                  ? "text-emerald-900" 
                  : notification.type === "assessment"
                    ? "text-purple-900"
                    : "text-amber-900"
              }`}>
                {getNotificationTitle(notification)}
              </h3>
              
              {/* Message displayed as regular paragraph */}
              <p className="mt-1 text-sm text-gray-700 line-clamp-2">
                {getNotificationMessage(notification)}
              </p>
              
              {notification.type === "assessment" && (
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <Calendar size={12} className="mr-1" />
                  <span>Due: {new Date(notification.assessmentData.due_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />

      <div className="flex-1 p-6 overflow-auto">
        <Header
          title={selectedCourse?.name || "Course"}
          subtitle={selectedCourse?.code}
        />

        <div className="bg-white rounded-lg shadow-md flex flex-col">
          <BlackHeader title="Announcements" count={getAllNotifications().length}>
            <div className="flex items-center gap-2">
              <button
                aria-label="Toggle content updates"
                onClick={() => setShowContentUpdates(!showContentUpdates)}
                className={`p-2 rounded hover:bg-gray-700 ${showContentUpdates ? 'text-[#F6BA18]' : ''}`}
                title={showContentUpdates ? "Hide content updates" : "Show content updates"}
              >
                <Filter size={20} />
              </button>
              <button
                aria-label="Sort announcements"
                onClick={handleSort}
                className="p-2 rounded hover:bg-gray-700"
                title={isSorted ? "Sort newest first" : "Sort oldest first"}
              >
                <ArrowUpDown size={20} />
              </button>
            </div>
          </BlackHeader>
          <MobileNavBar navItems={navItems} />

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {error}
            </div>
          )}
          
          {/* Filter tabs */}
          <div className="px-4 md:px-6 pt-4 pb-2 border-b border-gray-200">
            <div className="flex space-x-2 overflow-x-auto">
              <button
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  contentFilter === "all" 
                    ? "bg-gray-100 text-gray-800" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleContentFilterChange("all")}
              >
                All Updates
              </button>
              <button
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  contentFilter === "announcements" 
                    ? "bg-gray-100 text-gray-800" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleContentFilterChange("announcements")}
              >
                Announcements
              </button>
              <button
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  contentFilter === "modules" 
                    ? "bg-emerald-100 text-emerald-800" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleContentFilterChange("modules")}
              >
                Modules
              </button>
              <button
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  contentFilter === "assessments" 
                    ? "bg-purple-100 text-purple-800" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleContentFilterChange("assessments")}
              >
                Assessments
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            {isLoading ? (
              <div className="flex items-center justify-center h-40 flex-1">
                <div className="w-12 h-12 border-4 border-[#F6BA18] border-t-[#212529] rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {getAllNotifications().length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center flex-1">
                    <div className="rounded-full bg-gray-100 p-3 mb-4">
                      {contentFilter === "modules" ? (
                        <BookOpen size={32} className="text-gray-400" />
                      ) : contentFilter === "assessments" ? (
                        <ClipboardList size={32} className="text-gray-400" />
                      ) : (
                        <Megaphone size={32} className="text-gray-400" />
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No updates found</h3>
                    <p className="text-sm text-gray-500 max-w-md">
                      {contentFilter === "modules" 
                        ? "There are no module updates for this course."
                        : contentFilter === "assessments"
                          ? "There are no assessment updates for this course."
                          : contentFilter === "announcements"
                            ? "There are no announcements for this course."
                            : "There are no updates or announcements for this course yet."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 overflow-y-auto flex-1 max-h-[calc(100vh-250px)]">
                    {renderNotificationItems()}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerCourseAnnouncements;