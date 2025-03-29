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
  Megaphone,
  Clock,
} from "lucide-react";
import MobileNavBar from "../../components/common/layout/MobileNavbar"; // Add this import
import BlackHeader from "../../components/common/layout/BlackHeader";

function AdminAnnouncements() {
  // Hardcoded data for testing
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "New Course Launch",
      content:
        "We are excited to announce the launch of our new course on Advanced Machine Learning. Enroll now to get early bird discounts!",
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
  const [isLoading, setIsLoading] = useState(false); // Set to false since we're using hardcoded data
  const [successMessage, setSuccessMessage] = useState(""); // Add success message state

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
      setAnnouncements([...announcements, { id: newId, ...newAnnouncement }]);
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

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-auto">
        <Header title="Announcements" />
        <BlackHeader title="All Announcements" count={announcements.length}>
          <button
            onClick={() => setIsAddAnnouncementOpen(true)}
            className="p-2 rounded hover:bg-gray-700"
          >
            <Plus size={20} />
          </button>
          <button className="p-2 rounded hover:bg-gray-700">
            <ArrowUpDown size={20} />
          </button>
        </BlackHeader>

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg mt-3">
            {successMessage}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="w-16 h-16 border-4 border-[#F6BA18] border-t-[#212529] rounded-full animate-spin"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm mt-4">
            <div className="text-gray-400 mb-4">
              <Megaphone size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No Announcements Available
            </h3>
            <p className="text-gray-500 mt-2">
              There are no announcements posted yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="relative bg-white rounded-lg p-5 border-l-4 border-yellow-500 transition-all shadow-sm hover:shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <img
                      src={announcement.poster.profilePicture}
                      alt=""
                      className="h-12 w-12 rounded-full border-2 border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {announcement.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {announcement.content}
                      </p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <Clock className="mr-1.5 h-4 w-4" />
                        {announcement.date}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => setAnnouncementToDelete(announcement)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        {isAddAnnouncementOpen && (
          <Modal
            isOpen={isAddAnnouncementOpen}
            onClose={() => setIsAddAnnouncementOpen(false)}
          >
            {/* ...existing modal code... */}
          </Modal>
        )}

        {editingAnnouncement && (
          <Modal
            isOpen={!!editingAnnouncement}
            onClose={() => setEditingAnnouncement(null)}
          >
            {/* ...existing modal code... */}
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
