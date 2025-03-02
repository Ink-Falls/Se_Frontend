import React, { useState, useEffect } from "react";
import Sidebar, { SidebarItem } from "./Sidebar";
import Header from "./Header";
import Modal from "./Modal";
import DeleteModal from "./DeleteModal";
import {
    MoreVertical,
    ChevronDown,
    Edit,
    Trash2,
    Plus,
    Save,
    XCircle,
    Home,
    Book,
    Bell,
    FileText,
    Users,
    Search,
} from "lucide-react";

function AdminAnnouncements() {
    // Hardcoded data for testing
    const [announcements, setAnnouncements] = useState([
        {
            id: 1,
            title: "New Course Launch",
            content: "We are excited to announce the launch of our new course on Advanced Machine Learning. Enroll now to get early bird discounts!",
            date: "2023-10-01",
            poster: {
                name: "Dr. John Doe",
                profilePicture: "https://i.imgur.com/RTMTvNB.png"
            }
        },
        {
            id: 2,
            title: "Holiday Schedule",
            content: "Please note that the office will be closed from December 24th to January 1st for the holiday season. We will resume operations on January 2nd.",
            date: "2023-12-15",
            poster: {
                name: "Dr. Jane Smith",
                profilePicture: "https://i.imgur.com/RTMTvNB.png"
            }
        }
    ]);

    const [expandedAnnouncementId, setExpandedAnnouncementId] = useState(null);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        poster: {
            name: '',
            profilePicture: ''
        }
    });
    const [announcementToDelete, setAnnouncementToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // Set to false since we're using hardcoded data

    const toggleDropdown = (id, event) => {
        event.stopPropagation();
        setDropdownOpen(dropdownOpen === id ? null : id);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".dropdown-menu") && !event.target.closest(".menu-btn")) {
                setDropdownOpen(null);
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const navItems = [
        { text: "Users", icon: <Home size={20} />, route: "/Admin/Dashboard" },
        { text: "Courses", icon: <Book size={20} />, route: "/Admin/Courses" },
        { text: "Enrollments", icon: <Bell size={20} />, route: "/Admin/Enrollments" },
        { text: "Announcements", icon: <FileText size={20} />, route: "/Admin/Announcements" },
    ];

    const handleEdit = (announcement) => {
        setEditingAnnouncement(announcement);
        setDropdownOpen(null);
    };

    const saveAnnouncementChanges = (updatedAnnouncement) => {
        setAnnouncements((prev) =>
            prev.map((a) => (a.id === updatedAnnouncement.id ? updatedAnnouncement : a))
        );
        setEditingAnnouncement(null);
    };

    const confirmDelete = () => {
        setAnnouncements((prev) => prev.filter((a) => a.id !== announcementToDelete.id));
        setAnnouncementToDelete(null);
    };

    const handleAddAnnouncement = () => {
        if (newAnnouncement.title.trim() && newAnnouncement.content.trim()) {
            const newId = announcements.length + 1;
            setAnnouncements([...announcements, { id: newId, ...newAnnouncement }]);
            setIsAddAnnouncementOpen(false);
            setNewAnnouncement({
                title: '',
                content: '',
                poster: {
                    name: '',
                    profilePicture: ''
                }
            });
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 relative">
            <Sidebar navItems={navItems} />
            <div className="flex-1 p-6 overflow-auto">
                <Header title="Announcements" />

                {/* Announcement List */}
                <div className="flex flex-col gap-4 mt-4">
                    <div className="flex-1 bg-[#212529] shadow rounded-lg p-4 pl-6 pr-6">
                        {/* Filter and Action Buttons */}
                        <div className="flex items-center gap-4">
                            {/* Filter button (left side) */}
                            <button
                                onClick={() => console.log("Filter By: All")}
                                className="flex text-md font-semibold items-center gap-2 py-2 text-white rounded-lg"
                            >
                                <span>Announcements ({announcements.length})</span>
                            </button>

                            {/* Buttons on the right side */}
                            <div className="flex items-center gap-4 ml-auto">
                                <button
                                    className="flex items-center gap-2 py-2 rounded-lg"
                                >
                                    <Plus className="text-white" size={22} />
                                </button>
                                <button
                                    className="flex items-center gap-2 py-2 rounded-lg"
                                >
                                    <Search className="text-white" size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                    {announcements.map((announcement) => (
                        <div
                            key={announcement.id}
                            className="relative bg-white rounded-lg p-5 border-l-4 border-yellow-500 transition-all shadow-sm hover:shadow-lg"
                        >
                            {/* Announcement Header */}
                            <div className="flex justify-between items-center cursor-pointer">
                                <div className="w-full" onClick={() => setExpandedAnnouncementId(expandedAnnouncementId === announcement.id ? null : announcement.id)}>
                                    <div className="flex items-center">
                                        <img
                                            src={announcement.poster.profilePicture}
                                            alt={announcement.poster.name}
                                            className="w-10 h-10 rounded-full mr-4"
                                        />
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800">
                                                {announcement.title}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {announcement.content.substring(0, 100)}...
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Posted on: {announcement.date}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Edit and Delete Buttons */}
                                <div className="flex items-center gap-2 pr-6">
                                    <button
                                        onClick={() => setAnnouncementToDelete(announcement)}
                                        className="text-gray-500 hover:text-red-500 transition-colors mr-3"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(announcement)}
                                        className="text-gray-500 hover:text-yellow-500 transition-colors"
                                    >
                                        <Edit size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Announcement Details */}
                            {expandedAnnouncementId === announcement.id && (
                                <div className="mt-4 border-t pt-4">
                                    <div className="space-y-3">
                                        <p className="text-gray-600">
                                            {announcement.content}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AdminAnnouncements;