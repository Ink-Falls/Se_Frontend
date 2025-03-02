import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BlackHeader from "./BlackHeader";
import {
  ArrowLeft,
  Trash2,
  Edit,
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
  User,
  LineChart,
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
      "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWZnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg",
  },
  {
    id: "3",
    type: "Tutoring Available",
    description: "Extra help sessions on Tuesday and Thursday at 3 PM.",
    fullText:
      "Tutoring sessions are available every Tuesday and Thursday at 3 PM.",
    time: "20 minutes ago",
    userImage:
      "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWZnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg",
  },
];

const AnnouncementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const announcement = announcements.find((ann) => ann.id === id);

  if (!announcement) {
    return <div className="text-center mt-20">Announcement not found</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Matches TeacherCoursePage */}
      <Sidebar
        navItems={[
          {
            text: "Home",
            icon: <Home size={20} />,
            route: "/Teacher/Dashboard",
          },
          {
            text: "Announcements",
            icon: <Megaphone size={20} />,
            route: "/Teacher/Courses",
          },
          {
            text: "Modules",
            icon: <BookOpen size={20} />,
            route: "/Teacher/Modules",
          },
          {
            text: "Assessments",
            icon: <ClipboardList size={20} />,
            route: "/Teacher/Assessments",
          },
          {
            text: "Attendance",
            icon: <User size={20} />,
            route: "/Teacher/Attendance",
          },
          {
            text: "Progress Tracker",
            icon: <LineChart size={20} />,
            route: "/Teacher/Progress",
          },
        ]}
      />

      <div className="flex-1 p-6">
        {/* Header (Same as TeacherCoursePage) */}
        <Header title="Announcements" subtitle="Details" />

        {/* BlackHeader with Back Button before Title */}
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
        >
          <button className="p-2 rounded hover:bg-gray-700">
            <Edit size={20} />
          </button>
          <button className="p-2 rounded hover:bg-gray-700">
            <Trash2 size={20} />
          </button>
        </BlackHeader>

        {/* Announcement Details */}
        <div className="bg-white p-10 rounded-lg shadow-md">
          <div className="flex items-center space-x-4">
            <img
              src={announcement.userImage}
              alt="Author"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h2 className="text-xl font-semibold">{announcement.type}</h2>
              <p className="text-gray-500 text-sm">Author's name</p>
              <p className="text-gray-500 text-sm">{announcement.time}</p>
            </div>
          </div>
          <p className="mt-4 text-gray-700">{announcement.fullText}</p>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementPage;
