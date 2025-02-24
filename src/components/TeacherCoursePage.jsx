import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BlackHeader from "./BlackHeader";
import Announcements from "./Announcements";
import Modal from "./Modal";
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

const TeacherCoursePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const courseTitle = location.state?.courseTitle || "Course Name";
  const courseCode = location.state?.courseCode || "COURSE 101";

  const [isModalOpen, setIsModalOpen] = useState(false);
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
      <Sidebar
        navItems={[
          {
            text: "Home",
            icon: <Home size={20} />,
            route: "/TeacherDashboard",
          },
          {
            text: "Announcements",
            icon: <Megaphone size={20} />,
            route: "/TeacherCoursePage",
          },
          {
            text: "Modules",
            icon: <BookOpen size={20} />,
            route: "/TeacherModules",
          },
          {
            text: "Assessments",
            icon: <ClipboardList size={20} />,
            route: "/TeacherAssessments",
          },
          {
            text: "Attendance",
            icon: <User size={20} />,
            route: "/TeacherAttendance",
          },
          {
            text: "Progress Tracker",
            icon: <LineChart size={20} />,
            route: "/TeacherProgress",
          },
        ]}
      />

      <div className="flex-1 p-6">
        <Header title={courseTitle} subtitle={courseCode} />

        {/* Announcements Section */}
        <div className="bg-white rounded-lg shadow-md">
          <BlackHeader title="Announcements" count={announcements.length}>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 rounded hover:bg-gray-700"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={handleSort}
              className="p-2 rounded hover:bg-gray-700"
            >
              <ArrowUpDown size={20} />
            </button>
          </BlackHeader>

          <Announcements
            announcements={announcements}
            onAnnouncementClick={(id) => navigate(`/AnnouncementPage/${id}`)}
          />
        </div>
      </div>

      {/* Modal for Adding Announcement */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form className="flex flex-col">
          <label className="font-semibold mb-2">Announcement Title</label>
          <input
            type="text"
            placeholder="Enter title"
            className="border p-2 rounded mb-4"
          />

          <label className="font-semibold mb-2">Description</label>
          <textarea
            placeholder="Enter description"
            className="border p-2 rounded mb-4 h-32"
          ></textarea>

          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded self-end"
          >
            Add
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherCoursePage;
