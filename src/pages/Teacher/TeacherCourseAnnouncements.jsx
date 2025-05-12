import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import BlackHeader from "../../components/common/layout/BlackHeader";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import Modal from "../../components/common/Button/Modal";
import DeleteModal from "../../components/common/Modals/Delete/DeleteModal";
import {
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
  User,
  LineChart,
  Plus,
  ArrowUpDown,
  AlertCircle,
  Edit,
  Trash2,
  Clock,
  Filter
} from "lucide-react";
import { useCourse } from "../../contexts/CourseContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  createAnnouncement,
  getAnnouncementsByCourse,
  updateAnnouncement,
  deleteAnnouncement
} from "../../services/announcementService";
import booksIcon from "../../assets/images/icons/books_icon.png";

const TeacherCourseAnnouncements = () => {
  const navigate = useNavigate();
  const { selectedCourse } = useCourse();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    course_id: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSorted, setIsSorted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [contentFilter, setContentFilter] = useState("all"); // Only "all" and "announcements" are relevant for teacher

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
      route: "/Teacher/Attendance",
    },
    {
      text: "Progress Tracker",
      icon: <LineChart size={20} />,
      route: "/Teacher/ProgressTracker",
    },
  ];

  useEffect(() => {
    if (!selectedCourse?.id) {
      navigate("/Teacher/Dashboard");
      return;
    }

    fetchAnnouncements();
  }, [selectedCourse]);

  const fetchAnnouncements = async () => {
    if (!selectedCourse?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getAnnouncementsByCourse(selectedCourse.id);

      let announcementData = [];
      if (Array.isArray(response)) {
        announcementData = response;
      } else if (response && typeof response === "object") {
        announcementData = response.announcements || response.data || [];
      } else {
        announcementData = [];
      }

      // Format as notifications and add type
      const formattedAnnouncements = announcementData.map(announcement => ({
        ...announcement,
        type: "announcement",
        createdAt: announcement.createdAt || announcement.created_at,
        icon: <Megaphone className="h-5 w-5" />
      }));
      
      // Sort by creation date (newest first)
      formattedAnnouncements.sort((a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

      setAnnouncements(formattedAnnouncements);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      setError(err.message || "Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = () => {
    const sortedAnnouncements = [...announcements].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || 0);
      const dateB = new Date(b.createdAt || b.created_at || 0);
      return isSorted ? dateA - dateB : dateB - dateA;
    });
    setAnnouncements(sortedAnnouncements);
    setIsSorted(!isSorted);
  };

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.message.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // For teacher roles, include course_id
      const announcementData = {
        title: newAnnouncement.title,
        message: newAnnouncement.message,
        course_id: selectedCourse.id // Use the selected course ID
      };

      await createAnnouncement(announcementData);

      // Reset form and close modal
      setIsModalOpen(false);
      setNewAnnouncement({
        title: "",
        message: "",
        course_id: 0
      });

      setSuccessMessage("Announcement created successfully!");

      // Refresh the announcements list
      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to create announcement:", err);
      setError(err.message || "Failed to create announcement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
  };

  const saveAnnouncementChanges = async () => {
    if (!editingAnnouncement) return;

    setIsLoading(true);
    setError(null);

    try {
      const updateData = {
        title: editingAnnouncement.title,
        message: editingAnnouncement.message,
        course_id: selectedCourse.id
      };

      await updateAnnouncement(
        editingAnnouncement.announcement_id,
        updateData
      );

      setEditingAnnouncement(null);
      setSuccessMessage("Announcement updated successfully!");

      // Refresh announcements list
      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to update announcement:", err);
      setError(err.message || "Failed to update announcement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnnouncement = (announcement) => {
    setAnnouncementToDelete(announcement);
  };

  const confirmDelete = async () => {
    if (!announcementToDelete) return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteAnnouncement(announcementToDelete.announcement_id);
      setAnnouncementToDelete(null);
      setSuccessMessage("Announcement deleted successfully!");

      // Refresh announcements list
      fetchAnnouncements();
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
  
  // Handle announcement click
  const handleNotificationClick = (announcement) => {
    navigate(`/Teacher/AnnouncementDetails/${announcement.announcement_id || announcement.id}`);
  };
  
  // Get notification badge style based on type
  const getNotificationBadgeStyle = () => {
    return "bg-amber-100 text-amber-800 border border-amber-200";
  };
  
  // Get notification icon
  const getNotificationIcon = () => {
    return <Megaphone className="h-5 w-5 text-amber-600" />;
  };

  // Get all filtered announcements
  const getFilteredAnnouncements = () => {
    // For teachers, we only have announcements, no modules or assessments
    return announcements;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />

      <div className="flex-1 p-6 overflow-auto">
        <Header
          title={selectedCourse?.name || "Course"}
          subtitle={selectedCourse?.code}
        />

        <div className="bg-white rounded-lg shadow-md flex flex-col">
          <BlackHeader title="Announcements" count={getFilteredAnnouncements().length}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 rounded hover:bg-gray-700"
                title="Add Announcement"
              >
                <Plus size={20} />
              </button>
              <button
                onClick={handleSort}
                className="p-2 rounded hover:bg-gray-700"
                title={isSorted ? "Sort newest first" : "Sort oldest first"}
              >
                <ArrowUpDown size={20} />
              </button>
            </div>
          </BlackHeader>
          
          <MobileNavBar navItems={navItems} />

          {successMessage && (
            <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {error}
            </div>
          )}
          
          {/* Filter tabs */}
          <div className="px-4 md:px-6 pt-4 pb-2 border-b border-gray-200">
            <div className="flex space-x-2 overflow-x-auto">
              <button
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-800`}
                disabled
              >
                Announcements
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            {isLoading ? (
              <div className="flex items-center justify-center h-40 flex-1">
                <div className="w-12 h-12 border-4 border-[#F6BA18] border-t-[#212529] rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {getFilteredAnnouncements().length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center flex-1">
                    <div className="rounded-full bg-gray-100 p-3 mb-4">
                      <Megaphone size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No announcements found</h3>
                    <p className="text-sm text-gray-500 max-w-md">
                      There are no announcements yet for this course. Click the '+' button above to create your first announcement.
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      <Plus size={16} className="mr-2" />
                      Create Announcement
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 overflow-y-auto flex-1 max-h-[calc(100vh-250px)]">
                    {getFilteredAnnouncements().map((announcement) => (
                      <div
                        key={announcement.announcement_id || announcement.id}
                        className="group p-6 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-200 last:border-b-0 border-l-4 border-l-amber-300 cursor-pointer"
                        onClick={() => handleNotificationClick(announcement)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-amber-100 text-amber-600">
                              {getNotificationIcon()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNotificationBadgeStyle()}`}>
                                  Announcement
                                </span>
                                <span className="flex items-center text-xs text-gray-500">
                                  <Clock size={12} className="mr-1" />
                                  {new Date(announcement.createdAt || announcement.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditAnnouncement(announcement);
                                  }}
                                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                  title="Edit Announcement"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAnnouncement(announcement);
                                  }}
                                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                  title="Delete Announcement"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                            
                            {/* Title displayed as heading */}
                            <h3 className="mt-2 text-base font-medium text-amber-900">
                              {announcement.title}
                            </h3>
                            
                            {/* Message displayed as regular paragraph */}
                            <p className="mt-1 text-sm text-gray-700 line-clamp-2">
                              {announcement.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Add Announcement Modal */}
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Add New Announcement</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
                  <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddAnnouncement();
              }} className="space-y-4">
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
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${!newAnnouncement.title.trim() || !newAnnouncement.message.trim() || isLoading
                        ? "bg-yellow-300 cursor-not-allowed opacity-50"
                        : "bg-yellow-600 hover:bg-yellow-700"
                      }`}
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
                    ) : "Add Announcement"}
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        )}

        {/* Edit Announcement Modal */}
        {editingAnnouncement && (
          <Modal
            isOpen={!!editingAnnouncement}
            onClose={() => setEditingAnnouncement(null)}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Edit Announcement</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center">
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
                  <label className="block text-sm font-medium text-gray-700">
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
                    value={editingAnnouncement?.message || ""}
                    onChange={(e) =>
                      setEditingAnnouncement((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500"
                    placeholder="Enter announcement content"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingAnnouncement(null)}
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
        )}

        {/* Delete Confirmation Modal */}
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
    </div>
  );
};

export default TeacherCourseAnnouncements;