import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import BlackHeader from "../../components/common/layout/BlackHeader";
import AnnouncementsComponent from "./AnnouncementsComponent";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import Modal from "../../components/common/Button/Modal";
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
import booksIcon from "../../assets/images/icons/books_icon.png";
import schoolIcon from "../../assets/images/icons/school_icon.png";

const TeacherCourseAnnouncements = () => {
  const { selectedCourse } = useCourse();
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedCourse?.id) {
      navigate("/Teacher/Dashboard");
    }
  }, [selectedCourse, navigate]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      type: "Test Reminder",
      description: "Your test is scheduled for December 10.",
      time: "10 minutes ago",
      userImage: booksIcon, // Matches announcement details
    },
    {
      id: 2,
      type: "Project Reminder",
      description: "Final project is due soon. Submit by December 15.",
      time: "5 minutes ago",
      userImage: schoolIcon, // Matches announcement details
    },
    {
      id: 3,
      type: "Tutoring Available",
      description: "Extra help sessions on Tuesday and Thursday at 3 PM.",
      time: "20 minutes ago",
      userImage: booksIcon, // Matches announcement details
    },
    {
      id: 4,
      type: "Tutoring Available",
      description:
        "Tutoring will be available in the following dates: December 12-14.",
      time: "1 hour ago",
      userImage: booksIcon, // Matches announcement details
    },
    {
      id: 5,
      type: "Project Reminder",
      description: "Project 2 is now deployed.",
      time: "2 hours ago",
      userImage: schoolIcon, // Matches announcement details
    },
  ]);

  const [isSorted, setIsSorted] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null); // State for editing announcement
  const [announcementToDelete, setAnnouncementToDelete] = useState(null); // State for deleting announcement

  const handleSort = () => {
    const sortedAnnouncements = [...announcements].sort((a, b) => {
      return isSorted ? a.id - b.id : b.id - a.id;
    });
    setAnnouncements(sortedAnnouncements);
    setIsSorted(!isSorted);
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
  };

  const handleSaveAnnouncement = (updatedAnnouncement) => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === updatedAnnouncement.id ? updatedAnnouncement : a
      )
    );
    setEditingAnnouncement(null);
  };

  const handleDeleteAnnouncement = () => {
    setAnnouncements((prev) =>
      prev.filter((a) => a.id !== announcementToDelete.id)
    );
    setAnnouncementToDelete(null);
  };

  const navItems = [
    { text: "Home", icon: <Home size={20} />, route: "/Teacher/Dashboard" },
    {
      text: "Announcements",
      icon: <Megaphone size={20} />,
      route: "/Teacher/CourseAnnouncements",
    },
    {
      text: "Modules",
      icon: <BookOpen size={20} />,
      route: "/Teacher/CourseModules",
    },
    {
      text: "Assessments",
      icon: <ClipboardList size={20} />,
      route: "/Teacher/Assessment",
    },
    {
      text: "Attendance",
      icon: <User size={20} />,
      route: "/TeacherAttendance",
    },
    {
      text: "Progress Tracker",
      icon: <LineChart size={20} />,
      route: "/Teacher/ProgressTracker",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6">
        <Header
          data-testid="course-title"
          title={selectedCourse?.name || "Course"}
          subtitle={selectedCourse?.code}
        />
        <MobileNavBar navItems={navItems} />
        {/* Announcements Section */}
        <div className="bg-white rounded-lg shadow-md">
          <BlackHeader title="Announcements" count={announcements.length}>
            <button
              data-testid="open-add-announcement-modal"
              aria-label="Add Announcement"
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

          <AnnouncementsComponent
            announcements={announcements}
            onAnnouncementClick={(id) =>
              navigate(`/Teacher/AnnouncementDetails/${id}`, {
                state: {
                  notification: announcements.find((ann) => ann.id === id),
                },
              })
            }
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
            onEdit={handleEditAnnouncement} // Pass edit handler
            onDelete={setAnnouncementToDelete} // Pass delete handler
          />
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2 data-testid="modal-title" className="text-xl font-semibold mb-4">
            Add New Announcement
          </h2>
          <form className="flex flex-col">
            <label
              htmlFor="announcement_title"
              className="font-medium mb-2 text-gray-700"
            >
              Announcement Title
            </label>
            <input
              id="announcement_title"
              name="announcement_title"
              type="text"
              placeholder="Enter title"
              className="border p-2 rounded mb-4"
            />

            <label
              htmlFor="description"
              className="font-medium mb-2 text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Enter description"
              className="border p-2 rounded mb-4 h-32"
            ></textarea>

            <div className="flex justify-end">
              <button
                aria-label="Cancel"
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                data-testid="add-announcement-button"
                aria-label="Add Announcement"
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
              >
                Add Announcement
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TeacherCourseAnnouncements;
