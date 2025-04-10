import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import BlackHeader from "../../components/common/layout/BlackHeader";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import { useAuth } from "../../contexts/AuthContext";
import {
  ArrowLeft,
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
  GraduationCap,
} from "lucide-react";
import { useCourse } from "../../contexts/CourseContext";
import booksIcon from "../../assets/images/icons/books_icon.png";
import schoolIcon from "../../assets/images/icons/school_icon.png";

const announcements = [
  {
    id: "1",
    type: "Test Reminder",
    description: "Your test is scheduled for December 10.",
    fullText: "Make sure to prepare well for the upcoming test on December 10.",
    time: "10 minutes ago",
    userImage:
      "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg",
  },
  {
    id: "2",
    type: "Project Reminder",
    description: "Final project is due soon. Submit by December 15.",
    fullText:
      "Don't forget to submit your final project before the deadline on December 15.",
    time: "5 minutes ago",
    userImage:
      "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg",
  },
  {
    id: "3",
    type: "Tutoring Available",
    description: "Extra help sessions on Tuesday and Thursday at 3 PM.",
    fullText:
      "Tutoring sessions are available every Tuesday and Thursday at 3 PM.",
    time: "20 minutes ago",
    userImage:
      "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg",
  },
  {
    id: "4",
    type: "Tutoring Available",
    description:
      "Tutoring will be available in the following dates: December 12-14.",
    fullText:
      "Tutoring sessions will be held on December 12-14. Please check the schedule for details.",
    time: "1 hour ago",
    userImage:
      "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg",
  },
  {
    id: "5",
    type: "Project Reminder",
    description: "Project 2 is now deployed.",
    fullText:
      "We are excited to announce that Project 2 is now deployed. Please review it and provide your feedback.",
    time: "2 hours ago",
    userImage:
      "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg",
  },
];

const getAnnouncementIcon = (id) => {
  switch (id) {
    case "1":
      return booksIcon;
    case "2":
      return schoolIcon;
    case "3":
    case "4":
      return booksIcon;
    case "5":
      return schoolIcon;
    default:
      return "https://via.placeholder.com/48"; // Default placeholder icon
  }
};

const LearnerAnnouncementDetails = () => {
  const { id } = useParams();
  const { selectedCourse } = useCourse();
  const { logout } = useAuth();
  const navigate = useNavigate();

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
      route: `/Learner/AnnouncementDetails/${id}`, // Update this route to match current page
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
    }
  }, [selectedCourse, navigate]);

  const announcement = announcements.find((ann) => ann.id === id);

  if (!announcement) {
    return <div className="text-center mt-20">Announcement not found</div>;
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
              <span>{announcement.type}</span>
            </div>
          }
        />
        <MobileNavBar navItems={navItems} />

        {/* Updated Announcement Details Box */}
        <div className="bg-white p-10 rounded-lg shadow-md">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <img
                src={getAnnouncementIcon(announcement.id)} // Use specific icon based on ID
                alt="Announcement Icon"
                className="h-12 w-12 rounded-full border-2 border-gray-200"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      announcement.type.toLowerCase() === "test reminder"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : announcement.type.toLowerCase() === "project reminder"
                        ? "bg-purple-100 text-purple-800 border-purple-200"
                        : announcement.type.toLowerCase() ===
                          "tutoring available"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : announcement.type.toLowerCase() ===
                          "holiday announcement"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                        : announcement.type.toLowerCase() ===
                          "new course material"
                        ? "bg-gray-100 text-gray-800 border-gray-200"
                        : "bg-gray-50 text-gray-700 border-gray-100"
                    }`}
                  >
                    {announcement.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {announcement.time}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-gray-900 text-lg font-medium">
                  {announcement.description}
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {announcement.fullText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerAnnouncementDetails;
