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
  AlertCircle
} from "lucide-react";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import BlackHeader from "../../components/common/layout/BlackHeader";
import admin_icon from "/src/assets/images/icons/admin_icon.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  createAnnouncement,
  getAnnouncementsByUser,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementById
} from "../../services/announcementService";

function AdminAnnouncements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    course_id: 0, // 0 for global announcements
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

  const fetchAnnouncements = async () => {
    const userId = user?.id || getUserIdFromLocalStorage();

    if (!userId) {
      console.warn(
        "No user ID available from context or localStorage, cannot fetch announcements"
      );
      setIsLoading(false);
      setError("User ID not found. Please try logging in again.");
      return;
    }

    console.log("Using user ID for announcements:", userId);
    setIsLoading(true);
    setError(null);

    try {
      const response = await getAnnouncementsByUser(userId);

      let announcementData = [];
      if (Array.isArray(response)) {
        console.log("Response is an array with length:", response.length);
        announcementData = response;
      } else if (response && typeof response === "object") {
        console.log("Response is an object with keys:", Object.keys(response));
        announcementData = response.announcements || response.data || [];
        console.log("Extracted data array length:", announcementData.length);
      } else {
        console.warn("Unexpected response format:", response);
        announcementData = [];
      }

      console.log(
        "First announcement object (if exists):",
        announcementData.length > 0
          ? JSON.stringify(announcementData[0])
          : "No announcements"
      );

      if (announcementData.length > 0) {
        console.log("Sample announcement ID:", announcementData[0].announcement_id);
        console.log("Sample announcement title:", announcementData[0].title);
      }

      announcementData.sort(
        (a, b) =>
          new Date(b.createdAt || b.created_at || 0) -
          new Date(a.createdAt || a.created_at || 0)
      );

      console.log(
        "Setting announcements state with data count:",
        announcementData.length
      );
      setAnnouncements(announcementData);
      setFilteredAnnouncements(announcementData);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      console.error("Error details:", err.stack);
      setError(err.message || "Failed to load announcements");
      setAnnouncements([]);
      setFilteredAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userId = user?.id || getUserIdFromLocalStorage();

    console.log("User context ID:", user?.id);
    console.log("localStorage user ID:", getUserIdFromLocalStorage());
    console.log("Using user ID:", userId);

    if (userId) {
      fetchAnnouncements();
    }
  }, [user?.id]);

  const refreshAnnouncements = async () => {
    const userId = user?.id || getUserIdFromLocalStorage();

    if (!userId) {
      setError("User ID not found. Please try logging in again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getAnnouncementsByUser(userId);

      let announcementData = [];
      if (Array.isArray(response)) {
        console.log("Response is an array with length:", response.length);
        announcementData = response;
      } else if (response && typeof response === "object") {
        console.log("Response is an object with keys:", Object.keys(response));
        announcementData = response.announcements || response.data || [];
        console.log("Extracted data array length:", announcementData.length);
      } else {
        console.warn("Unexpected response format:", response);
        announcementData = [];
      }

      console.log(
        "First announcement object (if exists):",
        announcementData.length > 0
          ? JSON.stringify(announcementData[0])
          : "No announcements"
      );

      if (announcementData.length > 0) {
        console.log("Sample announcement ID:", announcementData[0].announcement_id);
        console.log("Sample announcement title:", announcementData[0].title);
      }

      announcementData.sort(
        (a, b) =>
          new Date(b.createdAt || b.created_at || 0) -
          new Date(a.createdAt || a.created_at || 0)
      );

      console.log(
        "Setting announcements state with data count:",
        announcementData.length
      );
      setAnnouncements(announcementData);
      setFilteredAnnouncements(announcementData);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      console.error("Error details:", err.stack);
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
    viewAnnouncementById(announcement.announcement_id, true);
    setDropdownOpen(null);
  };

  const viewAnnouncementDetails = async (announcementId) => {
    try {
      setIsLoading(true);
      const response = await getAnnouncementById(announcementId);

      const announcementData = response.announcement || response;

      if (
        !announcementData ||
        (!announcementData.title && !announcementData.message)
      ) {
        throw new Error("Invalid announcement data received");
      }

      setViewingAnnouncement(announcementData);
    } catch (err) {
      console.error("Failed to fetch announcement details:", err);
      setError(err.message || "Failed to load announcement details");
    } finally {
      setIsLoading(false);
    }
  };

  const viewAnnouncementById = async (announcementId, forEditing = false) => {
    try {
      setIsLoading(true);
      const response = await getAnnouncementById(announcementId);

      const announcementData = response.announcement || response;

      if (
        !announcementData ||
        (!announcementData.title && !announcementData.message)
      ) {
        throw new Error("Invalid announcement data received");
      }

      if (forEditing) {
        setEditingAnnouncement(announcementData);
      } else {
        setViewingAnnouncement(announcementData);
      }
    } catch (err) {
      console.error("Failed to fetch announcement details:", err);
      setError(err.message || "Failed to load announcement details");
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnnouncementChanges = async () => {
    if (!editingAnnouncement) return;

    setIsLoading(true);
    setError(null);

    try {
      const updateData = {
        title: editingAnnouncement.title,
        message: editingAnnouncement.message,
        course_id: editingAnnouncement.course_id || 0,
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
      const announcementData = {
        title: newAnnouncement.title,
        message: newAnnouncement.message,
      };

      if (newAnnouncement.course_id > 0) {
        announcementData.course_id = newAnnouncement.course_id;
      }

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

  const getCreatorName = (announcement) => {
    if (!announcement.user) return "Unknown";

    return `${announcement.user.first_name || ""} ${
      announcement.user.last_name || ""
    }`.trim() || "Unknown";
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-y-auto pb-20 md:pb-32 lg:pb-6">
        <Header
          title={<span className="text-xl md:text-2xl">Announcements</span>}
        />
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md">
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
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
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
            <>
              {(!filteredAnnouncements || filteredAnnouncements.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="rounded-full bg-gray-100 p-3 mb-4">
                    <FileText size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No announcements found
                  </h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    {searchTerm
                      ? "No announcements match your search criteria. Try using different keywords."
                      : "There are no announcements yet. Click the '+' button above to create your first announcement."}
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
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredAnnouncements.map((announcement) => (
                    <div
                      key={
                        announcement.announcement_id ||
                        `announcement-${Math.random()}`
                      }
                      className="group p-5 hover:bg-gray-50 transition-colors duration-150 cursor-pointer border-l-4 border-transparent hover:border-yellow-500"
                      onClick={() =>
                        viewAnnouncementDetails(announcement.announcement_id)
                      }
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            src={admin_icon}
                            alt="Admin"
                            className="h-12 w-12 rounded-full border-2 border-gray-200"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <h3 className="font-medium text-gray-900">
                                {announcement.title}
                              </h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-500 flex items-center">
                                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                                  {getCreatorName(announcement)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(
                                    announcement.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(announcement);
                                }}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Edit Announcement"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAnnouncementToDelete(announcement);
                                }}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete Announcement"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {announcement.message}
                          </p>
                          <div className="mt-2 flex items-center">
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md">
                              {announcement.course
                                ? `Course: ${
                                    announcement.course.name ||
                                    announcement.course.code ||
                                    announcement.course_id
                                  }`
                                : "Global Announcement"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {isAddAnnouncementOpen && (
          <Modal
            isOpen={isAddAnnouncementOpen}
            onClose={() => setIsAddAnnouncementOpen(false)}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Add New Announcement</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
                  <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddAnnouncement();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
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
                    value={newAnnouncement.message}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        message: e.target.value,
                      })
                    }
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500"
                    placeholder="Enter announcement message"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Course (Optional)
                  </label>
                  <select
                    value={newAnnouncement.course_id}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        course_id: Number(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500"
                  >
                    <option value={0}>Global (All Courses)</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddAnnouncementOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
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

        {viewingAnnouncement && (
          <Modal
            isOpen={!!viewingAnnouncement}
            onClose={() => setViewingAnnouncement(null)}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Announcement Details</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingAnnouncement(viewingAnnouncement);
                      setViewingAnnouncement(null);
                    }}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Edit Announcement"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setAnnouncementToDelete(viewingAnnouncement);
                      setViewingAnnouncement(null);
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete Announcement"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
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
                        {viewingAnnouncement.title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        By:{" "}
                        {viewingAnnouncement.user
                          ? `${viewingAnnouncement.user.first_name} ${viewingAnnouncement.user.last_name}`
                          : "Unknown"}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Created:{" "}
                        {new Date(viewingAnnouncement.createdAt).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Type:{" "}
                        {viewingAnnouncement.course_id
                          ? "Course Specific"
                          : "Global"}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {viewingAnnouncement.message}
                      </p>
                    </div>

                    {viewingAnnouncement.course && (
                      <div className="text-xs text-gray-500">
                        Course:{" "}
                        {viewingAnnouncement.course.name ||
                          `ID: ${viewingAnnouncement.course_id}`}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 mt-2">
                      Last Updated:{" "}
                      {new Date(
                        viewingAnnouncement.updatedAt ||
                          viewingAnnouncement.createdAt
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingAnnouncement(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}

        {editingAnnouncement && (
          <Modal
            isOpen={!!editingAnnouncement}
            onClose={() => setEditingAnnouncement(null)}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Edit Announcement</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveAnnouncementChanges();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500"
                    placeholder="Enter announcement title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Message
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
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500"
                    placeholder="Enter announcement message"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Course
                  </label>
                  <select
                    value={editingAnnouncement?.course_id || 0}
                    onChange={(e) =>
                      setEditingAnnouncement((prev) => ({
                        ...prev,
                        course_id: Number(e.target.value),
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500"
                  >
                    <option value={0}>Global (All Courses)</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingAnnouncement(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
                    disabled={isLoading}
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
            isLoading={isLoading}
          />
        )}
      </div>
      <MobileNavBar navItems={navItems} />
    </div>
  );
}

export default AdminAnnouncements;
