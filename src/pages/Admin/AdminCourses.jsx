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
import { getAllCourses, getCourseById, updateCourse, deleteCourse } from "../../services/courseService";
import { getTeachers } from "../../services/userService";
import { getGroupsByType } from "../../services/groupService";
import AddCourse from "../../components/common/Modals/Add/AddCourse";

function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
        learner_group_id: '',
        student_teacher_group_id: ''
    });
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // Set to false since we're using hardcoded data
    const [availableTeachers, setAvailableTeachers] = useState([]);
    const [learnerGroups, setLearnerGroups] = useState([]);
    const [studentTeacherGroups, setStudentTeacherGroups] = useState([]);

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
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const coursesData = await getAllCourses(); // Changed from getCoursesWithGroups to getAllCourses
                if (Array.isArray(coursesData)) {
                    setCourses(coursesData);
                } else {
                    console.error('Courses data is not an array:', coursesData);
                    setCourses([]);
                }
            } catch (err) {
                setError(err.message || 'Failed to load courses');
                console.error('Error loading courses:', err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        console.log('Current courses:', courses);
        console.log('Loading state:', loading);
        console.log('Error state:', error);
    }, [courses, loading, error]);

    useEffect(() => {
        const fetchEditData = async () => {
            if (editingCourse) {
                try {
                    const [teachers, learners, studentTeachers] = await Promise.all([
                        getTeachers(),
                        getGroupsByType('learner'),
                        getGroupsByType('student_teacher')
                    ]);
                    
                    setAvailableTeachers(teachers);
                    setLearnerGroups(learners);
                    setStudentTeacherGroups(studentTeachers);
                } catch (error) {
                    console.error('Error fetching edit data:', error);
                    setError('Failed to load edit data');
                }
            }
        };

        fetchEditData();
    }, [editingCourse]);

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-100">
                <Sidebar navItems={navItems} />
                <div className="flex-1 p-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen bg-gray-100">
                <Sidebar navItems={navItems} />
                <div className="flex-1 p-6">
                    <div className="text-red-500 text-center">
                        Error: {error}
                        <button 
                            onClick={() => window.location.reload()}
                            className="ml-4 px-4 py-2 bg-yellow-500 text-white rounded-lg"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleEdit = (course) => {
        // Log the course data being edited
        console.log('Course being edited:', course);
        
        const editData = {
            ...course,
            user_id: course.user_id || course.teacher_id || '', // Try both possible fields
            learner_group_id: course.learner_group_id || '',
            student_teacher_group_id: course.student_teacher_group_id || ''
        };
        
        console.log('Formatted edit data:', editData); // For debugging
        setEditingCourse(editData);
        setDropdownOpen(null);
    };

    const saveCourseChanges = async (updatedCourse) => {
        try {
            const result = await updateCourse(updatedCourse.id, {
                name: updatedCourse.name,
                description: updatedCourse.description,
                user_id: parseInt(updatedCourse.user_id),
                learner_group_id: parseInt(updatedCourse.learner_group_id),
                student_teacher_group_id: parseInt(updatedCourse.student_teacher_group_id)
            });

            // Refresh the courses list
            const allCourses = await getAllCourses();
            setCourses(allCourses);
            setEditingCourse(null);
        } catch (error) {
            console.error('Error updating course:', error);
            // Handle error (you might want to show an error message to the user)
        }
    };

    const confirmDelete = async () => {
        try {
            await deleteCourse(courseToDelete.id);
            setCourses(prev => prev.filter((c) => c.id !== courseToDelete.id));
            setCourseToDelete(null);
        } catch (error) {
            console.error('Error deleting course:', error);
            setError('Failed to delete course');
        }
    };

    const handleCourseAdded = async (newCourse) => {
        try {
            // Refresh the entire course list immediately
            const allCourses = await getAllCourses();
            setCourses(allCourses);
            setIsAddCourseOpen(false);
        } catch (error) {
            console.error('Error refreshing courses:', error);
            // If the immediate refresh fails, at least add the new course
            setCourses(prev => [...prev, newCourse]);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 relative">
            <Sidebar navItems={navItems} />
            <div className="flex-1 p-[2vw] md:p-[1vw] overflow-auto">
                <Header title="Courses" />

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center p-4">
                        <p>{error}</p>
                        <button 
                            onClick={fetchCourses}
                            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                        >
                            Retry
                        </button>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center p-8">
                        <p className="text-gray-500 mb-4">No courses available</p>
                        <button
                            onClick={() => setIsAddCourseOpen(true)}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                        >
                            Add Your First Course
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 mt-4">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="relative bg-white rounded-lg p-5 border-l-4 border-yellow-500 transition-all shadow-sm hover:shadow-lg"
                            >
                                <div className="flex justify-between items-center cursor-pointer">
                                    <div className="w-full" onClick={() => setExpandedCourseId(expandedCourseId === course.id ? null : course.id)}>
                                        <p className="text-xs text-gray-500">COURSE {course.id}</p>
                                        <h3 className="font-bold text-lg text-gray-800">
                                            {course.name}
                                        </h3>
                                    </div>

                                    <div className="relative flex items-center space-x-2">
                                        <ChevronDown
                                            size={20}
                                            className={`cursor-pointer transition-transform ${expandedCourseId === course.id ? "rotate-180" : ""
                                                }`}
                                            onClick={() => setExpandedCourseId(expandedCourseId === course.id ? null : course.id)}
                                        />
                                        <button
                                            onClick={(e) => toggleDropdown(course.id, e)}
                                            className="menu-btn relative z-20"
                                        >
                                            <MoreVertical size={20} className="cursor-pointer" />
                                        </button>
                                        {dropdownOpen === course.id && (
                                            <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg w-28 z-30 dropdown-menu">
                                                <button
                                                    className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full"
                                                    onClick={() => handleEdit(course)}
                                                >
                                                    <Edit size={16} className="mr-2" /> Edit
                                                </button>
                                                <button
                                                    className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full"
                                                    onClick={() => setCourseToDelete(course)}
                                                >
                                                    <Trash2 size={16} className="mr-2" /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {expandedCourseId === course.id && (
                                    <div className="mt-4 border-t pt-4">
                                        <div className="space-y-3">
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
                                                <strong>Learner Group:</strong> {course.learner_group}
                                                {course.learner_group_id && <span className="text-xs text-gray-400"> (ID: {course.learner_group_id})</span>}
                                            </p>
                                            <p className="text-gray-600">
                                                <strong>Student Teacher Group:</strong> {course.student_teacher_group}
                                                {course.student_teacher_group_id && <span className="text-xs text-gray-400"> (ID: {course.student_teacher_group_id})</span>}
                                            </p>
                                            {course.image && (
                                                <div className="mt-4">
                                                    <img
                                                        src={course.image}
                                                        alt={course.name}
                                                        className="w-[300px] h-[200px] object-cover rounded-lg shadow-sm"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={() => setIsAddCourseOpen(true)}
                    className="fixed bottom-8 right-8 bg-yellow-500 text-white rounded-full p-4 shadow-lg hover:bg-yellow-600 transition-colors z-50 flex items-center justify-center"
                >
                    <Plus size={24} />
                </button>

                {editingCourse && (
                    <Modal
                        isOpen={!!editingCourse}
                        onClose={() => setEditingCourse(null)}
                    >
                        <h2 className="text-xl font-semibold mb-4">Edit Course</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                saveCourseChanges(editingCourse);
                            }}
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        value={editingCourse.name}
                                        onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={editingCourse.description}
                                        onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Teacher</label>
                                    <select
                                        value={editingCourse.user_id}
                                        onChange={(e) => setEditingCourse({ ...editingCourse, user_id: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        required
                                    >
                                        <option value="">Select a teacher</option>
                                        {availableTeachers?.map((teacher) => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {`${teacher.first_name} ${teacher.last_name}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Learner Group</label>
                                    <select
                                        value={editingCourse.learner_group_id}
                                        onChange={(e) => setEditingCourse({ ...editingCourse, learner_group_id: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        required
                                    >
                                        <option value="">Select a learner group</option>
                                        {learnerGroups?.map((group) => (
                                            <option key={group.id} value={group.id}>
                                                {group.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Student Teacher Group</label>
                                    <select
                                        value={editingCourse.student_teacher_group_id}
                                        onChange={(e) => setEditingCourse({ ...editingCourse, student_teacher_group_id: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        required
                                    >
                                        <option value="">Select a student teacher group</option>
                                        {studentTeacherGroups?.map((group) => (
                                            <option key={group.id} value={group.id}>
                                                {group.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingCourse(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
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

                <AddCourse 
                    isOpen={isAddCourseOpen}
                    onClose={() => setIsAddCourseOpen(false)}
                    onCourseAdded={handleCourseAdded}
                />
            </div>
        </div>
    );
}

export default AdminCourses;