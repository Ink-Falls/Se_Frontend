import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import BlackHeader from "../../components/common/layout/BlackHeader";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import booksIcon from "../../assets/images/icons/books_icon.png";
import schoolIcon from "../../assets/images/icons/school_icon.png";
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
  AlertCircle
} from "lucide-react";
import Modal from "../../components/common/Button/Modal";
import DeleteModal from "../../components/common/Modals/Delete/DeleteModal";
import { useCourse } from "../../contexts/CourseContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementsByCourse
} from "../../services/announcementService";

const TeacherAnnouncementDetails = () => {
  const { id } = useParams();
  const { selectedCourse } = useCourse();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedMessage, setEditedMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const navItems = [
    {
      text: "Home",
      icon: <Home size={20} />,
      route: "/Teacher/Dashboard",
    },
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
      route: "/Teacher/Attendance", // Fixed: added "Teacher/" prefix
    },
    {
      text: "Progress Tracker",
      icon: <LineChart size={20} />,
      route: "/Teacher/ProgressTracker", // Fixed: updated to match TeacherAttendance.jsx
    },
  ];

  const getUserIdFromLocalStorage = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      return tokenPayload?.id || null;
    } catch (err) {
      console.error("Error parsing user ID from token:", err);
      return null;
    }
  };

  useEffect(() => {
    const fetchAnnouncement = async () => {
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
        setEditedTitle(announcementData.title);
        setEditedMessage(announcementData.message);
      } catch (err) {
        console.error("Failed to fetch announcement details:", err);
        setError(err.message || "Failed to load announcement details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  useEffect(() => {
    if (!selectedCourse?.id && !isLoading) {
      navigate("/Teacher/Dashboard");
    }
  }, [selectedCourse, navigate, isLoading]);

  const handleEdit = () => {
    if (!announcement) return;
    
    setEditedTitle(announcement.title);
    setEditedMessage(announcement.message);
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!announcement?.announcement_id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updateData = {
        title: editedTitle,
        message: editedMessage,
        course_id: announcement.course_id || selectedCourse?.id,
      };
      
      const response = await updateAnnouncement(announcement.announcement_id, updateData);
      
      // Update the local announcement data with the response
      const updatedAnnouncement = response.announcement || response;
      setAnnouncement(updatedAnnouncement);
      
      setIsEditModalOpen(false);
      setSuccessMessage("Announcement updated successfully!");
    } catch (err) {
      console.error("Failed to update announcement:", err);
      setError(err.message || "Failed to update announcement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!announcement) return;
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!announcement?.announcement_id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteAnnouncement(announcement.announcement_id);
      setIsDeleteModalOpen(false);
      setSuccessMessage("Announcement deleted successfully!");
      
      // Navigate back to announcements list after a brief delay
      setTimeout(() => {
        navigate('/Teacher/CourseAnnouncements');
      }, 1500);
    } catch (err) {
      console.error("Failed to delete announcement:", err);
      setError(err.message || "Failed to delete announcement");
      setIsLoading(false);
    }
  };

  const renderEditModal = () => {
    if (!isEditModalOpen) return null;
    
    return (
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Edit Announcement</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500"
                placeholder="Enter announcement title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500"
                placeholder="Enter announcement message"
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    );
  };

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
          <Header
            title="Announcement Details"
            subtitle={selectedCourse?.code}
          />
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
      {/* Sidebar */}
      <Sidebar navItems={navItems} />

      <div className="flex-1 p-6">
        {/* Header */}
        <Header
          title={selectedCourse?.name || "Announcement Details"}
          subtitle={selectedCourse?.code}
        />
        <MobileNavBar navItems={navItems} />

        {/* BlackHeader with Back Button before Title */}
        <BlackHeader
          title={
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded hover:bg-gray-700"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
              <span>Announcement Details</span>
            </div>
          }
        >
          <button
            onClick={handleEdit}
            className="p-2 rounded hover:bg-gray-700"
            data-testid="edit-button"
            aria-label="Edit"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded hover:bg-gray-700"
            data-testid="delete-button"
            aria-label="Delete"
          >
            <Trash2 size={20} />
          </button>
        </BlackHeader>

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

      {/* Modals */}
      {renderEditModal()}
      
      {isDeleteModalOpen && (
        <DeleteModal
          title="Delete Announcement"
          message={`Are you sure you want to delete "${announcement.title}"? This action cannot be undone.`}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default TeacherAnnouncementDetails;