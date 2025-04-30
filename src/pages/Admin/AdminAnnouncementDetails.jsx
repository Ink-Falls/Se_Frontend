import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "/src/components/common/layout/Sidebar.jsx";
import Header from "/src/components/common/layout/Header.jsx";
import BlackHeader from "../../components/common/layout/BlackHeader";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import Modal from "../../components/common/Button/Modal";
import DeleteModal from "/src/components/common/Modals/Delete/DeleteModal.jsx";
import {
  Edit,
  Trash2,
  ArrowLeft,
  Home,
  Book,
  Bell,
  FileText,
  AlertCircle,
  Clock
} from "lucide-react";
import admin_icon from "/src/assets/images/icons/admin_icon.png";
import {
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement
} from "../../services/announcementService";

function AdminAnnouncementDetails() {
  const { id } = useParams();
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
    { text: "Users", icon: <Home size={20} />, route: "/Admin/Dashboard" },
    { text: "Courses", icon: <Book size={20} />, route: "/Admin/Courses" },
    {
      text: "Enrollments",
      icon: <Bell size={20} />,
      route: "/Admin/Enrollments",
    },
    {
      text: "Announcements",
      icon: <FileText size={20} />,
      route: "/Admin/Announcements",
    },
  ];

  useEffect(() => {
    fetchAnnouncementDetails();
  }, [id]);

  const fetchAnnouncementDetails = async () => {
    if (!id) {
      setError("Announcement ID not found");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
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

  const handleEdit = () => {
    if (!announcement) return;
    setIsEditModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!announcement) return;

    setIsLoading(true);
    setError(null);

    try {
      const updateData = {
        title: editedTitle,
        message: editedMessage,
      };

      const response = await updateAnnouncement(
        announcement.announcement_id || announcement.id,
        updateData
      );

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
    if (!announcement) return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteAnnouncement(announcement.announcement_id || announcement.id);
      setIsDeleteModalOpen(false);
      setSuccessMessage("Announcement deleted successfully!");
      
      // Navigate back to announcements list after a brief delay
      setTimeout(() => {
        navigate('/Admin/Announcements');
      }, 1500);
    } catch (err) {
      console.error("Failed to delete announcement:", err);
      setError(err.message || "Failed to delete announcement");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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
          <Header title="Announcement Details" />
          <div className="bg-white p-10 rounded-lg shadow-md text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-medium mb-2 text-gray-900">Error Loading Announcement</h2>
            <p className="text-gray-600 mb-6">{error || "Announcement not found"}</p>
            <button
              onClick={() => navigate("/Admin/Announcements")}
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
      <div className="flex-1 p-6 overflow-y-auto pb-20 md:pb-32 lg:pb-6">
        <Header title={<span className="text-xl md:text-2xl">Announcement Details</span>} />
        
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        
        <BlackHeader
          title={
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/Admin/Announcements")}
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

        <div className="bg-white rounded-lg shadow-md mt-6">
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={admin_icon}
                  alt="Admin"
                  className="h-12 w-12 rounded-full border-2 border-gray-200"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {announcement.title}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    By:{" "}
                    {announcement.user
                      ? `${announcement.user.first_name} ${announcement.user.last_name}`
                      : "Unknown"}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center">
                    <Clock size={12} className="mr-1" />
                    Created:{" "}
                    {new Date(announcement.createdAt).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Type:{" "}
                    {announcement.course_id
                      ? "Course Specific"
                      : "Global"}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {announcement.message}
                  </p>
                </div>

                {announcement.course && (
                  <div className="text-xs text-gray-500">
                    Course:{" "}
                    {announcement.course.name ||
                      `ID: ${announcement.course_id}`}
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-2 flex items-center">
                  <Clock size={12} className="mr-1" />
                  Last Updated:{" "}
                  {new Date(
                    announcement.updatedAt ||
                      announcement.createdAt
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Edit Announcement</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center">
                  <AlertCircle size={18} className="mr-2" />
                  <span>{error}</span>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveChanges();
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
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 bg-white text-gray-900"
                    placeholder="Enter announcement title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={editedMessage}
                    onChange={(e) => setEditedMessage(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 bg-white text-gray-900"
                    placeholder="Enter announcement content"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
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
        )}

        {/* Delete Modal */}
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
      <MobileNavBar navItems={navItems} />
    </div>
  );
}

export default AdminAnnouncementDetails;