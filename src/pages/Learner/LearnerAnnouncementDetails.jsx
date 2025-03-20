import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import BlackHeader from "../../components/common/layout/BlackHeader";
import {
  ArrowLeft,
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
} from "lucide-react";

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
];

const LearnerAnnouncementDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const announcement = announcements.find((ann) => ann.id === id);

  if (!announcement) {
    return <div className="text-center mt-20">Announcement not found</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        navItems={[
          {
            text: "Home",
            icon: <Home size={20} />,
            route: "/Learner/Dashboard",
          },
          {
            text: "Modules",
            icon: <BookOpen size={20} />,
            route: "/Learner/CourseModules", // Fixed route
          },
          {
            text: "Announcements",
            icon: <Megaphone size={20} />,
            route: "/Learner/CourseAnnouncements", // Fixed route
          },
          {
            text: "Assessments",
            icon: <ClipboardList size={20} />,
            route: "/Learner/Assessment", // Fixed route
          },
        ]}
      />

      <div className="flex-1 p-6">
        <Header title="Announcement Details" subtitle="Details" />

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

        {/* Updated Announcement Details Box */}
        <div className="bg-white p-10 rounded-lg shadow-md">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <img
                src={announcement.userImage}
                alt="Author"
                className="h-12 w-12 rounded-full border-2 border-gray-200"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      announcement.type.toLowerCase().includes("test")
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : announcement.type.toLowerCase().includes("project")
                        ? "bg-purple-100 text-purple-800 border-purple-200"
                        : "bg-green-100 text-green-800 border-green-200"
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
