import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import BlackHeader from "../../components/common/layout/BlackHeader";
import AnnouncementsComponent from "../Teacher/AnnouncementsComponent";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import {
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
  ArrowUpDown,
  GraduationCap,
  AlertCircle
} from "lucide-react";
import { useCourse } from "../../contexts/CourseContext";
import { useAuth } from "../../contexts/AuthContext";
import { getAnnouncementsByCourse } from "../../services/announcementService";

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
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      setError(err.message || "Failed to load announcements");
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

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {error}
            </div>
          )}
          
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
                <AnnouncementsComponent
                  announcements={announcements}
                  onAnnouncementClick={(id) => {
                    navigate(`/Learner/AnnouncementDetails/${id}`);
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearnerCourseAnnouncements;
