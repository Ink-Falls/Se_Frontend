import React, { useState, useEffect } from "react";
import Sidebar, { SidebarItem } from "/src/components/common/layout/Sidebar.jsx";
import Header from "/src/components/common/layout/Header.jsx";
import Modal from "../../components/common/Button/Modal";
import DeleteModal from "/src/components/common/Modals/Delete/DeleteModal.jsx";
import AddUserModal from "/src/components/common/Modals/Add/AddUserModal.jsx";
import CreateGroupModal from "/src/components/common/Modals/Create/CreateGroupModal.jsx";
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
import UserStats from "/src/components/specific/users/UserStats.jsx";
import UserTable from "/src/components/specific/users/UserTable.jsx";
import { getAllUsers } from "/src/services/userService.js";

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
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalLearners: 0,
        totalTeachers: 0,
        totalAdmins: 0
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

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

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const userData = await getAllUsers();
                setUsers(userData);

                // Calculate stats
                setStats({
                    totalUsers: userData.length,
                    totalLearners: userData.filter(u => u.role === 'learner').length,
                    totalTeachers: userData.filter(u => u.role === 'teacher').length,
                    totalAdmins: userData.filter(u => u.role === 'admin').length
                });
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    const handleAddClick = () => {
        setIsAddModalOpen(true);
    };

    const handleDeleteSelected = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            // Delete each selected user
            await Promise.all(selectedIds.map(id =>
                fetch(`http://localhost:4000/api/users/${id}`, {
                    method: 'DELETE',
                    headers
                })
            ));

            // Refresh users list after deletion
            const userData = await getAllUsers();
            setUsers(userData);
            setSelectedIds([]);
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error deleting users:', error);
        }
    };

    const handleCreateGroup = (groupData) => {
        console.log('Creating group:', groupData);
        setIsCreateGroupModalOpen(false);
    };

    const handleUserCreated = async (newUser) => {
        try {
            setUsers(prevUsers => [...prevUsers, newUser]);
            setStats(prevStats => ({
                ...prevStats,
                totalUsers: prevStats.totalUsers + 1,
                totalLearners: newUser.role === 'student' ? prevStats.totalLearners + 1 : prevStats.totalLearners,
                totalTeachers: newUser.role === 'teacher' ? prevStats.totalTeachers + 1 : prevStats.totalTeachers,
                totalAdmins: newUser.role === 'admin' ? prevStats.totalAdmins + 1 : prevStats.totalAdmins,
            }));
            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Error handling new user:', error);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>; // Render loading indicator
    }

    return (
        <>
            <div className="flex h-screen bg-gray-100">
                <Sidebar navItems={navItems} />

                <div className="flex-1 p-6 overflow-auto">
                    <Header title="Users" />

                    <UserStats
                        totalUsers={stats.totalUsers}
                        totalLearners={stats.totalLearners}
                        totalTeachers={stats.totalTeachers}
                        totalAdmins={stats.totalAdmins}
                    />

                    <div className="bg-white shadow rounded-lg p-6">
                        {/* User controls moved to UserTable component */}
                        <UserTable 
                            users={users}
                            onEdit={(user) => {
                                setSelectedUser(user);
                                setIsEditModalOpen(true);
                            }}
                            onAddUser={() => setIsAddModalOpen(true)}
                            onDelete={() => setShowDeleteModal(true)}
                            selectedIds={selectedIds}
                            setSelectedIds={setSelectedIds}
                            onCreateGroup={() => setIsCreateGroupModalOpen(true)}
                        />
                    </div>
                </div>
            </div>

            {isAddModalOpen && (
                <AddUserModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={handleUserCreated}
                />
            )}

            {showDeleteModal && (
                <DeleteModal
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteSelected}
                    message={`Are you sure you want to delete ${selectedIds.length} selected user${selectedIds.length > 1 ? 's' : ''}?`}
                />
            )}

            {isCreateGroupModalOpen && (
                <CreateGroupModal
                    onClose={() => setIsCreateGroupModalOpen(false)}
                    onSave={handleCreateGroup}
                />
            )}
        </>
    );
}

export default AdminDashboard;