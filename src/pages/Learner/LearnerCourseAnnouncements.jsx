import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  User,
  LineChart,
  Plus,
  ArrowUpDown,
} from "lucide-react";
import { useCourse } from "../../contexts/CourseContext";
import { useAuth } from "../../contexts/AuthContext";

const LearnerCourseAnnouncements = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCourse } = useCourse();
  const { logout } = useAuth();
  const courseTitle = location.state?.courseTitle || "Course Name";
  const courseCode = location.state?.courseCode || "COURSE 101";

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
  ];

  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      type: "Test Reminder",
      description: "Your test is scheduled for December 10.",
      time: "10 minutes ago",
      userImage:
        "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg",
    },
    {
      id: 2,
      type: "Project Reminder",
      description: "Final project is due soon. Submit by December 15.",
      time: "5 minutes ago",
      userImage:
        "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg",
    },
    {
      id: 3,
      type: "Tutoring Available",
      description: "Extra help sessions on Tuesday and Thursday at 3 PM.",
      time: "20 minutes ago",
      userImage:
        "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg",
    },
  ]);

  const [isSorted, setIsSorted] = useState(false);

  const handleSort = () => {
    const sortedAnnouncements = [...announcements].sort((a, b) => {
      return isSorted ? a.id - b.id : b.id - a.id;
    });
    setAnnouncements(sortedAnnouncements);
    setIsSorted(!isSorted);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />

      <div className="flex-1 p-6">
        <Header title={selectedCourse?.name || "Course"} subtitle={selectedCourse?.code} />

        <div className="bg-white rounded-lg shadow-md">
          <BlackHeader title="Announcements" count={announcements.length}>
            <button
              onClick={handleSort}
              className="p-2 rounded hover:bg-gray-700"
            >
              <ArrowUpDown size={20} />
            </button>
          </BlackHeader>
          <MobileNavBar navItems={navItems} />

          <AnnouncementsComponent
            announcements={announcements}
            onAnnouncementClick={(id) =>
              navigate(`/Learner/AnnouncementDetails/${id}`)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default LearnerCourseAnnouncements;
