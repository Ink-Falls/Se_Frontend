import React, { useState, useEffect } from "react";
import Sidebar, { SidebarItem } from "/src/components/common/layout/Sidebar.jsx";
import Header from "/src/components/common/layout/Header.jsx";
import Modal from "../../components/common/Button/Modal";
import DeleteModal from "/src/components/common/Modals/Delete/DeleteModal.jsx";
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

function AdminCourses() {
    // Hardcoded data for testing
    const [courses, setCourses] = useState([
        {
            id: 1,
            name: "Introduction to Environmental Science",
            description: "Learn the basics of environmental science and sustainability.",
            teacher: "Dr. Jane Smith",
            learner_group: "Group A",
            student_teacher_group: "Group B",
            image: "https://i.imgur.com/RTMTvNB.png",
        },
        {
            id: 2,
            name: "Advanced Machine Learning",
            description: "Explore advanced topics in machine learning and AI.",
            teacher: "Dr. John Doe",
            learner_group: "Group C",
            student_teacher_group: "Group D",
            image: "https://i.imgur.com/RTMTvNB.png",
        },
    ]);

    const [expandedCourseId, setExpandedCourseId] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({
        name: '',
        description: '',
        teacher: '',
        learner_group: '',
        student_teacher_group: '',
    });
    const [courseToDelete, setCourseToDelete] = useState(null);
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

    const handleEdit = (course) => {
        setEditingCourse(course);
        setDropdownOpen(null);
    };

    const saveCourseChanges = (updatedCourse) => {
        setCourses((prev) =>
            prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c))
        );
        setEditingCourse(null);
    };

    const confirmDelete = () => {
        setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
        setCourseToDelete(null);
    };

    const handleAddCourse = () => {
        if (newCourse.name.trim() && newCourse.description.trim()) {
            const newId = courses.length + 1;
            setCourses([...courses, { id: newId, ...newCourse }]);
            setIsAddCourseOpen(false);
            setNewCourse({
                name: '',
                description: '',
                teacher: '',
                learner_group: '',
                student_teacher_group: '',
            });
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 relative">
            <Sidebar navItems={navItems} />
            <div className="flex-1 p-[2vw] md:p-[1vw] overflow-auto">
                <Header title="Courses" />

                {/* Course List */}
                <div className="flex flex-col gap-[2vw] md:gap-[1vw] mt-[1vw]">
                    <div className="flex-1 bg-[#212529] shadow rounded-lg p-[0.5vw] pl-[1vw] pr-[1vw]">
                        {/* Filter and Action Buttons */}
                        <div className="flex items-center">
                            {/* Filter button (left side) */}
                            <button
                                onClick={() => console.log("Filter By: All")}
                                className="flex text-md font-semibold items-center py-[2vw] md:py-[0.2vw] ml-[3vw] md:ml-[0vw] text-white rounded-lg"
                            >
                                <span>Courses ({courses.length})</span>
                            </button>

                            {/* Buttons on the right side */}
                            <div className="flex items-center gap-[3vw] md:gap-[1vw] ml-auto">
                                <button
                                    onClick={() => setIsAddCourseOpen(true)}
                                    className="flex items-center rounded-lg"
                                >
                                    <Plus className="text-white" size={22} />
                                </button>
                                <button
                                    className="flex items-center rounded-lg mr-[3vw] md:mr-[0vw]"
                                >
                                    <Search className="text-white" size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="relative bg-white rounded-lg p-[2vw] md:p-[1vw] border-l-[2vw] md:border-l-[0.5vw] border-yellow-500 transition-all shadow-sm hover:shadow-lg"
                        >
                            {/* Course Header */}
                            <div className="flex justify-between items-center cursor-pointer">
                                <div className="w-full" onClick={() => setExpandedCourseId(expandedCourseId === course.id ? null : course.id)}>
                                    <p className="text-xs text-gray-500">COURSE {course.id}</p>
                                    <h3 className="font-bold text-lg text-gray-800">
                                        {course.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 text-justify">
                                        {course.description.substring(0, 100)}...
                                    </p>
                                </div>

                                {/* Expand Arrow and Menu */}
                                <div className="relative flex items-center space-x-[2vw] pl-[3vw] md:pl-[0vw] md:space-x-[1vw]">
                                    <ChevronDown
                                        size="20"
                                        className={`cursor-pointer transition-transform ${expandedCourseId === course.id ? "rotate-180" : ""
                                            }`}
                                        onClick={() => setExpandedCourseId(expandedCourseId === course.id ? null : course.id)}
                                    />
                                    <button
                                        onClick={(e) => toggleDropdown(course.id, e)}
                                        className="menu-btn relative z-20"
                                    >
                                        <MoreVertical size="20" className="cursor-pointer" />
                                    </button>
                                    {dropdownOpen === course.id && (
                                        <div className="absolute right-0 top-[4vw] md:top-[2vw] bg-white border rounded-lg shadow-lg w-[10vw] md:w-[7vw] z-30 dropdown-menu">
                                            <button
                                                className="flex items-center px-[1vw] py-[1vw] text-sm hover:bg-gray-100 w-full"
                                                onClick={() => handleEdit(course)}
                                            >
                                                <Edit size="1.5vw" className="mr-[0.5vw]" /> Edit
                                            </button>
                                            <button
                                                className="flex items-center px-[1vw] py-[1vw] text-sm hover:bg-gray-100 w-full"
                                                onClick={() => setCourseToDelete(course)}
                                            >
                                                <Trash2 size="1.5vw" className="mr-[0.5vw]" /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Course Details */}
                            {expandedCourseId === course.id && (
                                <div className="mt-[1vw] border-t pt-[2vw] p-[1vw] md:pt-[1vw] md:p-[0vw]">
                                    <div className="space-y-[1vw] md:space-y-[0.2vw]">
                                        <p className="text-gray-600">
                                            <strong>Description:</strong>
                                        </p>
                                        <p className="text-gray-600">
                                            {course.description || "Not assigned"}
                                        </p>
                                        <p className="text-gray-600">
                                            <strong>Teacher:</strong> {course.teacher || "Not assigned"}
                                        </p>
                                        <p className="text-gray-600">
                                            <strong>Learner Group:</strong> {course.learner_group || "Not assigned"}
                                        </p>
                                        <p className="text-gray-600">
                                            <strong>Student Teacher Group:</strong> {course.student_teacher_group || "Not assigned"}
                                        </p>
                                        {course.image && (
                                            <div className="mt-[1vw]">
                                                <img
                                                    src={course.image}
                                                    alt={course.name}
                                                    className="w-[60vw] h-[40vw] md:w-[15vw] md:h-[10vw] object-cover rounded-lg shadow-sm"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Modals */}
                {editingCourse && (
                    <Modal
                        isOpen={!!editingCourse}
                        onClose={() => setEditingCourse(null)}
                    >
                        <h2 className="text-xl font-semibold mb-[1vw]">Edit Course</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                saveCourseChanges(editingCourse);
                            }}
                        >
                            <div className="mb-[1vw]">
                                <label className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={editingCourse.name}
                                    onChange={(e) =>
                                        setEditingCourse({ ...editingCourse, name: e.target.value })
                                    }
                                    className="mt-1 block w-full px-[1vw] py-[0.5vw] border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                    required
                                />
                            </div>
                            <div className="mb-[1vw]">
                                <label className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    value={editingCourse.description}
                                    onChange={(e) =>
                                        setEditingCourse({ ...editingCourse, description: e.target.value })
                                    }
                                    className="mt-1 block w-full px-[1vw] py-[0.5vw] border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setEditingCourse(null)}
                                    className="mr-[1vw] px-[1vw] py-[0.5vw] text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-[1vw] py-[0.5vw] text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}

                {courseToDelete && (
                    <DeleteModal
                        module={courseToDelete}
                        onConfirm={confirmDelete}
                        onCancel={() => setCourseToDelete(null)}
                    />
                )}

                {isAddCourseOpen && (
                    <Modal
                        isOpen={isAddCourseOpen}
                        onClose={() => setIsAddCourseOpen(false)}
                    >
                        <h2 className="text-xl font-semibold mb-[1vw]">Add New Course</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleAddCourse();
                            }}
                        >
                            <div className="mb-[1vw]">
                                <label className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={newCourse.name}
                                    onChange={(e) =>
                                        setNewCourse({ ...newCourse, name: e.target.value })
                                    }
                                    className="mt-1 block w-full px-[1vw] py-[0.5vw] border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                    required
                                />
                            </div>
                            <div className="mb-[1vw]">
                                <label className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    value={newCourse.description}
                                    onChange={(e) =>
                                        setNewCourse({ ...newCourse, description: e.target.value })
                                    }
                                    className="mt-1 block w-full px-[1vw] py-[0.5vw] border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsAddCourseOpen(false)}
                                    className="mr-[1vw] px-[1vw] py-[0.5vw] text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-[1vw] py-[0.5vw] text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
                                >
                                    Add Course
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
            </div>
        </div>
    );
}

export default AdminCourses;