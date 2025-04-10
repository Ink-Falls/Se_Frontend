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
  ArrowUpDown,
  GraduationCap,
} from "lucide-react";
import { useCourse } from "../../contexts/CourseContext";
import { useAuth } from "../../contexts/AuthContext";
import booksIcon from "../../assets/images/icons/books_icon.png";
import schoolIcon from "../../assets/images/icons/school_icon.png";

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
    {
      text: "Grades",
      icon: <GraduationCap size={20} />,
      route: "/Learner/Grades",
    },
  ];

  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      type: "Test Reminder",
      description: "Your test is scheduled for December 10.",
      time: "10 minutes ago",
      userImage: booksIcon,
    },
    {
      id: 2,
      type: "Project Reminder",
      description: "Final project is due soon. Submit by December 15.",
      time: "5 minutes ago",
      userImage: schoolIcon,
    },
    {
      id: 3,
      type: "Tutoring Available",
      description: "Extra help sessions on Tuesday and Thursday at 3 PM.",
      time: "20 minutes ago",
      userImage: booksIcon,
    },
    {
      id: 4,
      type: "Tutoring Available",
      description:
        "Tutoring will be available in the following dates: December 12-14.",
      time: "1 hour ago",
      userImage: schoolIcon,
    },
    {
      id: 5,
      type: "Project Reminder",
      description: "Project 2 is now deployed.",
      time: "2 hours ago",
      userImage: booksIcon,
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
        <Header
          title={selectedCourse?.name || "Course"}
          subtitle={selectedCourse?.code}
        />

        <div className="bg-white rounded-lg shadow-md">
          <BlackHeader title="Announcements" count={announcements.length}>
            <button
              aria-label="Sort by newest first"
              onClick={handleSort}
              className="p-2 rounded hover:bg-gray-700"
            >
              <ArrowUpDown size={20} />
            </button>
          </BlackHeader>
          <MobileNavBar navItems={navItems} />

          <AnnouncementsComponent
            announcements={announcements}
            onAnnouncementClick={(id) => {
              navigate(`/Learner/AnnouncementDetails/${id}`);
            }}
            renderAnnouncement={(announcement) => (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  announcement.type.toLowerCase() === "test reminder"
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : announcement.type.toLowerCase() === "project reminder"
                    ? "bg-purple-100 text-purple-800 border-purple-200"
                    : announcement.type.toLowerCase() === "tutoring available"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : announcement.type.toLowerCase() === "holiday announcement"
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                    : announcement.type.toLowerCase() === "new course material"
                    ? "bg-gray-100 text-gray-800 border-gray-200"
                    : "bg-gray-50 text-gray-700 border-gray-100"
                }`}
              >
                {announcement.type}
              </span>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default LearnerCourseAnnouncements;
