import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import BlackHeader from "../../components/common/layout/BlackHeader";
import admin_icon from "/src/assets/images/icons/admin_icon.png";
import { useTheme } from "../../contexts/ThemeContext"; // Import useTheme

function AdminAnnouncements() {
  const { isDarkMode } = useTheme(); // Get theme state
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Class Cancellation",
      content:
        "Due to unforeseen circumstances, the class scheduled for October 5th has been canceled. Please check your email for further details.",
      date: "2023-10-01",
      poster: {
        name: "Dr. John Doe",
        profilePicture: "https://i.imgur.com/RTMTvNB.png",
      },
    },
    {
      id: 2,
      title: "Holiday Schedule",
      content:
        "Please note that the office will be closed from December 24th to January 1st for the holiday season. We will resume operations on January 2nd.",
      date: "2023-12-15",
      poster: {
        name: "Dr. Jane Smith",
        profilePicture: "https://i.imgur.com/RTMTvNB.png",
      },
    },
  ]);

  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    poster: {
      name: "",
      profilePicture: "",
    },
  });
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);

  const toggleDropdown = (id, event) => {
    event.stopPropagation();
    setDropdownOpen(dropdownOpen === id ? null : id);
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

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (!announcements) return;

    const filtered = announcements.filter(
      (announcement) =>
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.poster.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
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

  const mobileNavItems = [
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

  const saveAnnouncementChanges = (updatedAnnouncement) => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === updatedAnnouncement.id ? updatedAnnouncement : a
      )
    );
    setEditingAnnouncement(null);
    setSuccessMessage("Announcement updated successfully!");
  };

  const confirmDelete = () => {
    setAnnouncements((prev) =>
      prev.filter((a) => a.id !== announcementToDelete.id)
    );
    setAnnouncementToDelete(null);
    setSuccessMessage("Announcement deleted successfully!");
  };

  const handleAddAnnouncement = () => {
    if (newAnnouncement.title.trim() && newAnnouncement.content.trim()) {
      const newId = announcements.length + 1;
      const currentDate = new Date().toISOString().split("T")[0];
      setAnnouncements([
        ...announcements,
        {
          id: newId,
          ...newAnnouncement,
          date: currentDate,
          poster: {
            name: "Admin",
            profilePicture: "https://i.imgur.com/RTMTvNB.png",
          },
        },
      ]);
      setIsAddAnnouncementOpen(false);
      setNewAnnouncement({
        title: "",
        content: "",
        poster: {
          name: "",
          profilePicture: "",
        },
      });
      setSuccessMessage("Announcement added successfully!");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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
            count={filteredAnnouncements.length}
          >
            <button
              onClick={() => setIsAddAnnouncementOpen(true)}
              className="p-2 rounded hover:bg-gray-700"
              title="Add Announcement"
            >
              <Plus size={20} />
            </button>
            <button className="p-2 rounded hover:bg-gray-700">
              <ArrowUpDown size={20} />
            </button>
          </BlackHeader>

          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg">
              {successMessage}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <div className="w-16 h-16 border-4 border-[#F6BA18] border-t-[#212529] rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="group p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 cursor-pointer"
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
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {announcement.date}
                          </span>
                        </div>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(announcement)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                            title="Edit Announcement"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() =>
                              setAnnouncementToDelete(announcement)
                            }
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                            title="Delete Announcement"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {announcement.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Content
                  </label>
                  <textarea
                    value={newAnnouncement.content}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        content: e.target.value,
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
                      !newAnnouncement.title || !newAnnouncement.content
                    }
                  >
                    Add Announcement
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveAnnouncementChanges(editingAnnouncement);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Content
                  </label>
                  <textarea
                    value={editingAnnouncement?.content || ""}
                    onChange={(e) =>
                      setEditingAnnouncement((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 focus:border-yellow-500 dark:focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 dark:focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter announcement content"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingAnnouncement(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 transition-colors"
                  >
                    Save Changes
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
          />
        )}
      </div>
      <MobileNavBar navItems={navItems} />
    </div>
  );
}

export default AdminAnnouncements;
