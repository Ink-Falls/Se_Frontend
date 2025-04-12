import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "/src/components/common/layout/Sidebar.jsx";
import Header from "/src/components/common/layout/Header.jsx";
import Modal from "../../components/common/Button/Modal";
import DeleteModal from "/src/components/common/Modals/Delete/DeleteModal.jsx";
import {
  Edit,
  Trash2,
  Plus,
  Home,
  Book,
  Bell,
  FileText,
  ArrowUpDown,
  AlertCircle,
  Clock
} from "lucide-react";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import BlackHeader from "../../components/common/layout/BlackHeader";
import admin_icon from "/src/assets/images/icons/admin_icon.png";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  createAnnouncement,
  getAnnouncementsByUser,
  updateAnnouncement,
  deleteAnnouncement
} from "../../services/announcementService";

function AdminAnnouncements() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    course_id: 0,
  });
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);

  const toggleDropdown = (id, event) => {
    event.stopPropagation();
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const fetchAnnouncements = async () => {
    let userId;
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      userId = storedUser.id;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }

    if (!userId) {
      console.warn("No user ID available, cannot fetch announcements");
      setIsLoading(false);
      setError("User ID not found. Please try logging in again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getAnnouncementsByUser(userId);
      const announcementData = Array.isArray(response) ? response : [];

      if (announcementData.length > 0) {
        console.log("Successfully fetched announcements:", announcementData.length);
      } else {
        console.log("No announcements found or invalid response format");
      }

      announcementData.sort(
        (a, b) =>
          new Date(b.createdAt || b.created_at || 0) -
          new Date(a.createdAt || a.created_at || 0)
      );
      setAnnouncements(announcementData);
      setFilteredAnnouncements(announcementData);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      setError(err.message || "Failed to load announcements");
      setAnnouncements([]);
      setFilteredAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const refreshAnnouncements = async () => {
    let userId;
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      userId = storedUser.id;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }

    if (!userId) {
      setError("User ID not found. Please try logging in again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getAnnouncementsByUser(userId);
      const announcementData = Array.isArray(response) ? response : [];

      announcementData.sort(
        (a, b) =>
          new Date(b.createdAt || b.created_at || 0) -
          new Date(a.createdAt || a.created_at || 0)
      );
      setAnnouncements(announcementData);
      setFilteredAnnouncements(announcementData);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      setError(err.message || "Failed to load announcements");
      setAnnouncements([]);
      setFilteredAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".dropdown-menu") &&
        !event.target.closest(".menu-btn")
      ) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (!announcements || !Array.isArray(announcements)) {
      setFilteredAnnouncements([]);
      return;
    }

    const filtered = announcements.filter(
      (announcement) =>
        announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAnnouncements(filtered);
  }, [searchTerm, announcements]);

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

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setDropdownOpen(null);
  };

  const viewAnnouncementById = (announcementId) => {
    navigate(`/Admin/AnnouncementDetails/${announcementId}`);
  };

  const saveAnnouncementChanges = async () => {
    if (!editingAnnouncement) return;

    setIsLoading(true);
    setError(null);

    try {
      const updateData = {
        title: editingAnnouncement.title,
        message: editingAnnouncement.message,
      };

      const response = await updateAnnouncement(
        editingAnnouncement.announcement_id,
        updateData
      );

      const updatedAnnouncement = response.announcement || response;

      setAnnouncements((prev) =>
        prev.map((a) =>
          a.announcement_id === editingAnnouncement.announcement_id
            ? updatedAnnouncement
            : a
        )
      );

      setEditingAnnouncement(null);
      setSuccessMessage("Announcement updated successfully!");

      refreshAnnouncements();
    } catch (err) {
      console.error("Failed to update announcement:", err);
      setError(err.message || "Failed to update announcement");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!announcementToDelete) return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteAnnouncement(announcementToDelete.announcement_id);

      setAnnouncements((prev) =>
        prev.filter(
          (a) => a.announcement_id !== announcementToDelete.announcement_id
        )
      );

      setAnnouncementToDelete(null);
      setSuccessMessage("Announcement deleted successfully!");

      refreshAnnouncements();
    } catch (err) {
      console.error("Failed to delete announcement:", err);
      setError(err.message || "Failed to delete announcement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.message.trim())
      return;

    setIsLoading(true);
    setError(null);

    try {
      let userId;
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        userId = storedUser.id;
        console.log("User ID retrieved from localStorage:", userId);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }

      const announcementData = {
        title: newAnnouncement.title,
        message: newAnnouncement.message,
      };

      const response = await createAnnouncement(announcementData);
      const createdAnnouncement = response.announcement || response;

      setIsAddAnnouncementOpen(false);
      setNewAnnouncement({
        title: "",
        message: "",
        course_id: 0,
      });

      setSuccessMessage("Announcement created successfully!");

      refreshAnnouncements();
    } catch (err) {
      console.error("Failed to create announcement:", err);
      setError(err.message || "Failed to create announcement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const renderAnnouncementItems = () => {
    return filteredAnnouncements.map((announcement) => (
      <div
        key={announcement.announcement_id || announcement.id}
        className="group p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 cursor-pointer"
        onClick={() => viewAnnouncementById(announcement.announcement_id || announcement.id)}
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <img
              src={admin_icon}
              alt="Admin"
              className="h-12 w-12 rounded-full border-2 border-gray-200 dark:border-gray-600"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                  {announcement.title}
                </span>
                <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Clock size={12} className="mr-1" />
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(announcement);
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                  title="Edit Announcement"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAnnouncementToDelete(announcement);
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  title="Delete Announcement"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-900 dark:text-gray-100 font-medium line-clamp-2">
              {announcement.message}
            </p>
            {announcement.course_id > 0 && (
              <div className="mt-2">
                <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                  Course Specific
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-dark-bg-primary relative ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-y-auto pb-20 md:pb-32 lg:pb-6 bg-gray-100 dark:bg-dark-bg-primary">
        <Header
          title={<span className="text-xl md:text-2xl dark:text-gray-100">Announcements</span>}
        />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-dark-md">
          <BlackHeader
            title="Announcements"
            count={filteredAnnouncements?.length || 0}
          >
            <button
              onClick={() => setIsAddAnnouncementOpen(true)}
              className="p-2 rounded hover:bg-gray-700"
              title="Add Announcement"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={refreshAnnouncements}
              className="p-2 rounded hover:bg-gray-700"
              title="Refresh Announcements"
            >
              <ArrowUpDown size={20} />
            </button>
          </BlackHeader>

          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {error}
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center h-[calc(100vh-300px)]">
              <div className="w-16 h-16 border-4 border-[#F6BA18] border-t-[#212529] rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {renderAnnouncementItems()}
            </div>
          )}

          {!isLoading && filteredAnnouncements.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-3 mb-4">
                <FileText size={32} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                No announcements found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                {searchTerm 
                  ? "No announcements match your search criteria. Try using different keywords."
                  : "There are no announcements yet. Click the '+' button to create your first announcement."}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsAddAnnouncementOpen(true)}
                  className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <Plus size={16} className="mr-2" />
                  Add New Announcement
                </button>
              )}
            </div>
          )}
        </div>

        {isAddAnnouncementOpen && (
          <Modal
            isOpen={isAddAnnouncementOpen}
            onClose={() => setIsAddAnnouncementOpen(false)}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Add New Announcement</h2>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        title: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 focus:border-yellow-500 dark:focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 dark:focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter announcement title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Content
                  </label>
                  <textarea
                    value={newAnnouncement.message}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        message: e.target.value,
                      })
                    }
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 focus:border-yellow-500 dark:focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 dark:focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter announcement content"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddAnnouncementOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddAnnouncement}
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                    disabled={
                      !newAnnouncement.title.trim() ||
                      !newAnnouncement.message.trim() ||
                      isLoading
                    }
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      "Add Announcement"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        )}

        {editingAnnouncement && (
          <Modal
            isOpen={!!editingAnnouncement}
            onClose={() => setEditingAnnouncement(null)}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Edit Announcement</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-lg flex items-center">
                  <AlertCircle size={18} className="mr-2" />
                  <span>{error}</span>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveAnnouncementChanges();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingAnnouncement?.title || ""}
                    onChange={(e) =>
                      setEditingAnnouncement((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 focus:border-yellow-500 dark:focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 dark:focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter announcement title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={editingAnnouncement?.message || ""}
                    onChange={(e) =>
                      setEditingAnnouncement((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 focus:border-yellow-500 dark:focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 dark:focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter announcement content"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingAnnouncement(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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

        {announcementToDelete && (
          <DeleteModal
            title="Delete Announcement"
            message={`Are you sure you want to delete "${announcementToDelete.title}"? This action cannot be undone.`}
            onClose={() => setAnnouncementToDelete(null)}
            onConfirm={confirmDelete}
            isLoading={isLoading}
          />
        )}
      </div>
      <MobileNavBar navItems={navItems} />
    </div>
  );
}

export default AdminAnnouncements;
