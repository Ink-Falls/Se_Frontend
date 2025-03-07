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

function AdminDashboard() {
    const [courses, setCourses] = useState([]);
    const [expandedCourseId, setExpandedCourseId] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [learnerGroups, setLearnerGroups] = useState([]); //for dropdown
    const [studentTeacherGroups, setStudentTeacherGroups] = useState([]); //for dropdown
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({ //for add
        name: '',
        description: '',
        user_id: '', // Teacher ID,
        learner_group_id: '',
        student_teacher_group_id: '',
        image: ''
    });
    const [moduleToDelete, setModuleToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Add loading state

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

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No token found. User might not be logged in.");
                setIsLoading(false);
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            try {
                const [coursesResponse, teachersResponse, learnerGroupsResponse, studentTeacherGroupsResponse] =
                    await Promise.all([
                        fetch('http://localhost:4000/api/courses', { headers }),
                        fetch('http://localhost:4000/api/users', { headers }),
                        fetch('http://localhost:4000/api/groups?group_type=learner', { headers }),
                        fetch('http://localhost:4000/api/groups?group_type=student_teacher', { headers })
                    ]);

                if (!coursesResponse.ok) {
                    throw new Error(`HTTP error! status: ${coursesResponse.status}`);
                }
                const coursesData = await coursesResponse.json();
                setCourses(coursesData);

                if (!teachersResponse.ok) {
                    throw new Error(`HTTP error! status: ${teachersResponse.status}`);
                }
                const teachersData = await teachersResponse.json();
                if (Array.isArray(teachersData.rows)) {
                    const filteredTeachers = teachersData.rows.filter(user => user.role === 'teacher');
                    setTeachers(filteredTeachers);
                } else {
                    console.error("teachersData.rows is not an array:", teachersData);
                    setTeachers([]);
                }

                if (!learnerGroupsResponse.ok) {
                    throw new Error(`HTTP error! status: ${learnerGroupsResponse.status}`);
                }
                const learnerGroupsData = await learnerGroupsResponse.json();
                if (Array.isArray(learnerGroupsData)) {
                    setLearnerGroups(learnerGroupsData);
                } else if (learnerGroupsData && Array.isArray(learnerGroupsData.rows)) {
                    setLearnerGroups(learnerGroupsData.rows);
                } else {
                    console.error("Learner groups data is not an array:", learnerGroupsData);
                    setLearnerGroups([]);
                }

                if (!studentTeacherGroupsResponse.ok) {
                    throw new Error(`HTTP error! status: ${studentTeacherGroupsResponse.status}`);
                }
                const studentTeacherGroupsData = await studentTeacherGroupsResponse.json();
                if (Array.isArray(studentTeacherGroupsData)) {
                    setStudentTeacherGroups(studentTeacherGroupsData);
                } else if (studentTeacherGroupsData && Array.isArray(studentTeacherGroupsData.rows)) {
                    setStudentTeacherGroups(studentTeacherGroupsData.rows);
                } else {
                    console.error("Student teacher groups data is not an array:", studentTeacherGroupsData);
                    setStudentTeacherGroups([]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>; // Render loading indicator
    }

    return (
        <>
            <div className="flex h-screen bg-gray-100">
                <Sidebar navItems={navItems} />

                <div className="flex-1 p-6 overflow-auto">
                    {/* Render the Header only once at the top */}
                    <Header title="Users" />

                    {/* Main content */}
                    <div className="mt-4">
                        <div className="bg-white shadow rounded-lg">
                            {/* Your content here */}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mt-4 mb-4">
                        <div className="flex-1 bg-white shadow rounded-lg p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <Users className="w-7 h-7 text-green-500" />
                                </div>
                                <div>
                                    <h2 className="text-md text-[#64748b]">Users</h2>
                                    <h2 className="text-xl font-semibold text-[#475569]">0000</h2>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 bg-white shadow rounded-lg p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <Users className="w-7 h-7 text-green-500" />
                                </div>
                                <div>
                                    <h2 className="text-md text-[#64748b]">Learners</h2>
                                    <h2 className="text-xl font-semibold text-[#475569]">0000</h2>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 bg-white shadow rounded-lg p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <Users className="w-7 h-7 text-green-500" />
                                </div>
                                <div>
                                    <h2 className="text-md text-[#64748b]">Teachers</h2>
                                    <h2 className="text-xl font-semibold text-[#475569]">0000</h2>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 bg-white shadow rounded-lg p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <Users className="w-7 h-7 text-green-500" />
                                </div>
                                <div>
                                    <h2 className="text-md text-[#64748b]">Admins</h2>
                                    <h2 className="text-xl font-semibold text-[#475569]">0000</h2>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 bg-white shadow rounded-lg p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <Users className="w-7 h-7 text-green-500" />
                                </div>
                                <div>
                                    <h2 className="text-md text-[#64748b]">Groups</h2>
                                    <h2 className="text-xl font-semibold text-[#475569]">0000</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 bg-white shadow rounded-lg p-6">
                        {/* Filter and Action Buttons */}
                        <div className="flex items-center gap-4 mb-6">
                            {/* Filter button (left side) */}
                            <button
                                onClick={() => console.log("Filter By: All")}
                                className="flex text-sm items-center gap-2 py-2 text-[#64748b] rounded-lg"
                            >
                                <span>Filter By: All</span>
                            </button>

                            {/* Buttons on the right side */}
                            <div className="flex items-center gap-4 ml-auto">
                                <button
                                    className="flex items-center gap-2 py-2 rounded-lg"
                                >
                                    <Plus className="text-[#475569]" size={22} />
                                </button>
                                <button
                                    className="flex items-center gap-2 py-2 rounded-lg"
                                >
                                    <Search className="text-[#475569]" size={20} />
                                </button>
                                <button
                                    onClick={() => console.log("Create Group")}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#212529] text-white rounded-lg text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black"
                                >
                                    <Users size={16} />
                                    <span>Create Group</span>
                                </button>
                                <button
                                    onClick={() => console.log("Generate Report")}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#212529] text-white rounded-lg text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black"
                                >
                                    <FileText size={16} />
                                    <span>Generate Report</span>
                                </button>
                            </div>
                        </div>

                        {/* Dynamic Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            {/* Checkbox for header */}
                                            <input type="checkbox" className="ml-4 form-checkbox h-4 w-4 text-[#212529] rounded" />
                                        </th>
                                        <th className="pr-10 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Example row with checkbox */}
                                    <tr className="border-b">
                                        <td className="py-4 text-sm text-gray-900">
                                            {/* Checkbox for row */}
                                            <input type="checkbox" className="ml-4 form-checkbox h-4 w-4 text-[#212529] rounded" />
                                        </td>
                                        <td className="pr-10 py-4 text-sm text-gray-900">1</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">Bau bau</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">Admin</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">wawawa</td>
                                    </tr>
                                    {/* Add more rows as needed */}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminDashboard;