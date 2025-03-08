import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "./common/layout/Sidebar";
import Header from "./common/layout/Header";
import BlackHeader from "./common/layout/BlackHeader";
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
import Modal from "./common/Button/Modal"; // Import the Modal component
import DeleteModal from "./common/Modals/Delete/DeleteModal"; // Import the DeleteModal component

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

const AnnouncementDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for delete modal
  const [editedType, setEditedType] = useState(""); // State for edited type
  const [editedFullText, setEditedFullText] = useState(""); // State for edited full text

  const announcement = announcements.find((ann) => ann.id === id);

  if (!announcement) {
    return <div className="text-center mt-20">Announcement not found</div>;
  }

  // Handle edit button click
  const handleEdit = () => {
    setEditedType(announcement.type); // Initialize with current type
    setEditedFullText(announcement.fullText); // Initialize with current full text
    setIsEditModalOpen(true); // Open the edit modal
  };

  // Handle save after editing
  const handleSave = () => {
    console.log("Updated Announcement:", {
      ...announcement,
      type: editedType,
      fullText: editedFullText,
    });
    setIsEditModalOpen(false); // Close the modal after saving
    // You can update the announcement in your state or API here
  };

  // Handle delete button click
  const handleDelete = () => {
    setIsDeleteModalOpen(true); // Open the delete modal
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    console.log("Deleted Announcement:", announcement);
    setIsDeleteModalOpen(false); // Close the modal after deletion
    navigate(-1); // Navigate back after deletion
    // You can delete the announcement from your state or API here
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Matches TeacherCoursePage */}
      <Sidebar
        navItems={[
          {
            text: "Home",
            icon: <Home size={20} />,
            route: "/Dashboard",
          },
          {
            text: "Announcements",
            icon: <Megaphone size={20} />,
            route: "/CourseAnnouncements",
          },
          {
            text: "Modules",
            icon: <BookOpen size={20} />,
            route: "/CourseModules",
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
        {/* Header (Same as TeacherCoursePage) */}
        <Header title="Announcement Details" subtitle="Details" />

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
          <button
            onClick={handleEdit} // Trigger edit modal
            className="p-2 rounded hover:bg-gray-700"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={handleDelete} // Trigger delete modal
            className="p-2 rounded hover:bg-gray-700"
          >
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

      {/* Edit Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <h2 className="text-xl font-semibold mb-4">Edit Announcement</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <label className="font-medium mb-2 text-gray-700">Type</label>
            <input
              type="text"
              value={editedType}
              onChange={(e) => setEditedType(e.target.value)}
              className="w-full px-3 mt-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              placeholder="Enter announcement type"
            />

            <label className="font-medium mt-4 block text-gray-700">
              Full Text
            </label>
            <textarea
              value={editedFullText}
              onChange={(e) => setEditedFullText(e.target.value)}
              className="w-full px-3 mt-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              rows="4"
              placeholder="Enter full text"
            />

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default AnnouncementDetails;
