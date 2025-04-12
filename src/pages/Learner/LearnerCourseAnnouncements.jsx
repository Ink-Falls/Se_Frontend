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
  Clock
} from "lucide-react";
import { useCourse } from "../../contexts/CourseContext";
import { useAuth } from "../../contexts/AuthContext";
import { getAnnouncementsByCourse } from "../../services/announcementService";
import booksIcon from "../../assets/images/icons/books_icon.png";
import schoolIcon from "../../assets/images/icons/school_icon.png";

const LearnerCourseAnnouncements = () => {
  const navigate = useNavigate();
  const { selectedCourse } = useCourse();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSorted, setIsSorted] = useState(false);

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
    
    fetchAnnouncements();
  }, [selectedCourse, navigate]);

  const fetchAnnouncements = async () => {
    if (!selectedCourse?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getAnnouncementsByCourse(selectedCourse.id);
      
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
      // Only set error if there's an actual error, not for empty announcements
      setError(null);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      // Check if the error is due to no announcements found
      if (err.response?.status === 404) {
        setAnnouncements([]);
        setError(null);
      } else {
        setError(err.message || "Failed to load announcements");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = () => {
    const sortedAnnouncements = [...announcements].sort((a, b) => {
      return isSorted
        ? new Date(a.createdAt || a.created_at || 0) - new Date(b.createdAt || b.created_at || 0)
        : new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
    });
    setAnnouncements(sortedAnnouncements);
    setIsSorted(!isSorted);
  };

  const renderAnnouncementItems = () => {
    return announcements.map((announcement) => (
      <div
        key={announcement.announcement_id || announcement.id}
        className="group p-6 hover:bg-gray-50 transition-colors duration-150 cursor-pointer border-b border-gray-200 last:border-b-0"
        onClick={() => navigate(`/Learner/AnnouncementDetails/${announcement.announcement_id || announcement.id}`)}
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <img
              src={announcement.course_id ? booksIcon : schoolIcon}
              alt="Icon"
              className="h-12 w-12 rounded-full border-2 border-gray-200"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                {announcement.title}
              </span>
              <span className="flex items-center text-xs text-gray-500">
                <Clock size={12} className="mr-1" />
                {new Date(announcement.createdAt || announcement.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-900 font-medium line-clamp-2">
              {announcement.message}
            </p>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />

      <div className="flex-1 p-6">
        <Header
          title={selectedCourse?.name || "Course"}
          subtitle={selectedCourse?.code}
        />

        <div className="bg-white rounded-lg shadow-md">
          <BlackHeader title="Announcements" count={announcements.length}>
            <button
              aria-label="Sort announcements"
              onClick={handleSort}
              className="p-2 rounded hover:bg-gray-700"
              title={isSorted ? "Sort newest first" : "Sort oldest first"}
            >
              <ArrowUpDown size={20} />
            </button>
          </BlackHeader>
          <MobileNavBar navItems={navItems} />

          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-12 h-12 border-4 border-[#F6BA18] border-t-[#212529] rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {(!announcements || announcements.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="rounded-full bg-gray-100 p-3 mb-4">
                    <Megaphone size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No announcements found</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    There are no announcements yet for this course.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {renderAnnouncementItems()}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearnerCourseAnnouncements;