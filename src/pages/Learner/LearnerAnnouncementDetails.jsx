import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import BlackHeader from "../../components/common/layout/BlackHeader";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import {
  ArrowLeft,
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
  GraduationCap,
  AlertCircle
} from "lucide-react";
import { useCourse } from "../../contexts/CourseContext";
import { getAnnouncementById } from "../../services/announcementService";
import booksIcon from "../../assets/images/icons/books_icon.png";
import schoolIcon from "../../assets/images/icons/school_icon.png";

const LearnerAnnouncementDetails = () => {
  const { id } = useParams();
  const { selectedCourse } = useCourse();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navItems = [
    {
      text: "Home",
      icon: <Home size={20} />,
      route: "/Learner/Dashboard",
    },
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
      text: "Grades", // New Grades item
      icon: <GraduationCap size={20} />,
      route: "/Learner/Grades",
    },
  ];

  useEffect(() => {
    if (!selectedCourse?.id) {
      navigate("/Learner/Dashboard");
      return;
    }

    const fetchAnnouncementDetails = async () => {
      if (!id) {
        setError("Announcement ID not found");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await getAnnouncementById(id);
        
        const announcementData = response.announcement || response;
        
        if (!announcementData || (!announcementData.title && !announcementData.message)) {
          throw new Error("Invalid announcement data received");
        }
        
        setAnnouncement(announcementData);
      } catch (err) {
        console.error("Failed to fetch announcement details:", err);
        setError(err.message || "Failed to load announcement details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncementDetails();
  }, [id, selectedCourse, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-[#F6BA18] border-t-[#212529] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-6">
          <Header title="Announcement Details" subtitle={selectedCourse?.code} />
          <div className="bg-white p-10 rounded-lg shadow-md text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-medium mb-2">Error Loading Announcement</h2>
            <p className="text-gray-600 mb-6">{error || "Announcement not found"}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />

      <div className="flex-1 p-6">
        <Header
          title={selectedCourse?.name || "Announcement Details"}
          subtitle={selectedCourse?.code}
        />

        <BlackHeader
          title={
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded hover:bg-gray-700"
              >
                <ArrowLeft size={20} />
              </button>
              <span>Announcement Details</span>
            </div>
          }
        />
        <MobileNavBar navItems={navItems} />

        {/* Updated Announcement Details Box */}
        <div className="bg-white p-10 rounded-lg shadow-md">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <img
                src={announcement.course_id ? booksIcon : schoolIcon}
                alt="Author"
                className="h-12 w-12 rounded-full border-2 border-gray-200"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{announcement.title}</h2>
                <div className="flex items-center mt-1 space-x-2">
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    {announcement.course_id ? "Course Announcement" : "Global Announcement"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(announcement.createdAt).toLocaleString()}
                  </span>
                </div>
                
                {announcement.user && (
                  <span className="text-xs text-gray-500 mt-1">
                    By: {announcement.user.first_name} {announcement.user.last_name}
                  </span>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-gray-700 whitespace-pre-wrap">{announcement.message}</p>
              </div>
              
              {announcement.course && (
                <div className="mt-4 text-sm text-gray-600">
                  <span className="font-medium">Course:</span> {announcement.course.name || announcement.course_id}
                </div>
              )}
              
              <div className="mt-2 text-xs text-gray-500">
                Last Updated: {new Date(announcement.updatedAt || announcement.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerAnnouncementDetails;
