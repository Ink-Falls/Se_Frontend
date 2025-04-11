import React, { useState, useEffect } from "react";
import Sidebar, {
  SidebarItem,
} from "/src/components/common/layout/Sidebar.jsx";
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
  Users,
  Search,
  AlertTriangle,
  InboxIcon,
} from "lucide-react";
import {
  getAllCourses,
  updateCourse,
  deleteCourse,
} from "../../services/courseService";
import { getTeachers } from "../../services/userService";
import { getGroupsByType } from "../../services/groupService";
import AddCourse from "../../components/common/Modals/Add/AddCourse";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EditCourseModal from "../../components/common/Modals/Edit/EditCourseModal";
import { useTheme } from "../../contexts/ThemeContext"; // Import useTheme

function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    //never read
    name: "",
    description: "",
    teacher: "",
    learner_group: "",
    student_teacher_group: "",
    learner_group_id: "",
    student_teacher_group_id: "",
  });
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [learnerGroups, setLearnerGroups] = useState([]);
  const [studentTeacherGroups, setStudentTeacherGroups] = useState([]);
  const { isDarkMode } = useTheme(); // Get theme state

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

  // Add cache-related state
  const [cache, setCache] = useState({});
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (fixed multiplication)

  const checkCache = (key) => {
    const cached = cache[key];
    if (!cached) return null;
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      const newCache = { ...cache };
      delete newCache[key];
      setCache(newCache);
      return null;
    }
    return cached.data;
  };

  const updateCache = (key, data) => {
    setCache((prev) => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now(),
      },
    }));
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const cachedCourses = checkCache("courses");
        if (cachedCourses) {
          setCourses(cachedCourses);
          setLoading(false);
          return;
        }

        setLoading(true);
        const coursesData = await getAllCourses();

        if (Array.isArray(coursesData)) {
          updateCache("courses", coursesData);
          setCourses(coursesData);
        } else {
          console.error("Courses data is not an array:", coursesData);
          setCourses([]);
        }
      } catch (err) {
        setError(err.message || "Failed to load courses");
        console.error("Error loading courses:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    // console.log("Current courses:", courses);
    // console.log("Loading state:", loading);
    // console.log("Error state:", error);
  }, [courses, loading, error]);

  useEffect(() => {
    const fetchEditData = async () => {
      if (editingCourse) {
        try {
          const [teachers, learners, studentTeachers] = await Promise.all([
            getTeachers({ page: 1, limit: 0 }),
            getGroupsByType("learner"),
            getGroupsByType("student_teacher"),
          ]);

          setAvailableTeachers(teachers);
          setLearnerGroups(learners);
          setStudentTeacherGroups(studentTeachers);
        } catch (error) {
          console.error("Error fetching edit data:", error);
          setError("Failed to load edit data");
        }
      }
    };

    fetchEditData();
  }, [editingCourse]);

  // Add success message state
  const [successMessage, setSuccessMessage] = useState("");

  // Add effect to auto-clear success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Add search-related state
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    if (!courses) return;

    const filtered = courses.filter(
      (course) =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.teacher?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  if (loading) {
    return (
      // Add dark mode background for loading state
      <div className="flex h-screen bg-gray-100 dark:bg-dark-bg-primary">
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-6 flex items-center justify-center">
          <LoadingSpinner text="Loading" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      // Add dark mode background and text colors for error state
      <div className="flex h-screen bg-gray-100 dark:bg-dark-bg-primary">
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-6">
          <Header title="Courses" />
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <AlertTriangle size={64} className="text-red-500 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Failed to Load Courses
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
              We encountered an error while trying to fetch the course data.
              This could be due to network issues or server unavailability.
            </p>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => window.location.reload()}
                // Ensure button styles work in dark mode (hover might need adjustment if needed)
                className="px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] dark:bg-gray-700 dark:hover:bg-[#F6BA18] dark:hover:text-[#212529] transition-colors duration-300 flex items-center gap-2"
              >
                Refresh Page
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                You can try refreshing the page or contact support if the issue
                persists
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleEdit = (course) => {
    const editData = {
      ...course,
      user_id: course.user_id || course.teacher_id || "", // Try both possible fields
      learner_group_id: course.learner_group_id || "",
      student_teacher_group_id: course.student_teacher_group_id || "",
    };
    setEditingCourse(editData);
    setDropdownOpen(null);
  };

  const saveCourseChanges = async (updatedCourse) => {
    try {
      await updateCourse(updatedCourse.id, {
        name: updatedCourse.name.trim(),
        description: updatedCourse.description?.trim() || "",
        user_id: parseInt(updatedCourse.user_id),
        learner_group_id: parseInt(updatedCourse.learner_group_id),
        student_teacher_group_id: parseInt(
          updatedCourse.student_teacher_group_id
        ),
      });

      setCache({}); // Clear cache
      const allCourses = await getAllCourses();
      setCourses(allCourses);
      setEditingCourse(null);
      setSuccessMessage("Course updated successfully");
    } catch (err) {
      console.error("Error updating course:", err);
      throw err; // Re-throw to be handled by the modal
    }
  };

  // Add this new function to handle edit course errors
  const handleEditCourse = async (course) => {
    try {
      const editData = {
        ...course,
        user_id: course.user_id || course.teacher_id || "",
        learner_group_id: course.learner_group_id || "",
        student_teacher_group_id: course.student_teacher_group_id || "",
      };

      // Fetch required data for editing
      const [teachers, learners, studentTeachers] = await Promise.all([
        getTeachers({ page: 1, limit: 0 }),
        getGroupsByType("learner"),
        getGroupsByType("student_teacher"),
      ]);

      setAvailableTeachers(teachers);
      setLearnerGroups(learners);
      setStudentTeacherGroups(studentTeachers);
      setEditingCourse(editData);
      setDropdownOpen(null);
    } catch (error) {
      console.error("Error preparing edit:", error);
      setError("Failed to load edit data");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteCourse(courseToDelete.id);
      setCache({}); // Clear cache
      const allCourses = await getAllCourses();
      setCourses(allCourses);
      setCourseToDelete(null);
      setSuccessMessage("Course deleted successfully"); // Add success message
    } catch (error) {
      console.error("Error deleting course:", error);
      setError("Failed to delete course");
    }
  };

  const handleCourseAdded = async (newCourse) => {
    try {
      setCache({}); // Clear cache
      // Refresh the entire course list immediately
      const allCourses = await getAllCourses();
      setCourses(allCourses);
      setIsAddCourseOpen(false);
      setSuccessMessage("Course added successfully"); // Add success message
    } catch (error) {
      console.error("Error refreshing courses:", error);
      // If the immediate refresh fails, at least add the new course
      setCourses((prev) => [...prev, newCourse]);
    }
  };

  // Update the form submission handler
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear any existing errors
    try {
      await saveCourseChanges(editingCourse);
    } catch (err) {
      // Error is handled in saveCourseChanges
      // We just prevent the form from closing
      console.error("Form submission failed:", err);
    }
  };

  return (
    // Add dark mode background
    <div className={`flex h-screen bg-gray-100 dark:bg-dark-bg-primary relative pb-10 ${isDarkMode ? 'dark' : ''}`}>
      {" "}
      {/* Added pb-16 for padding bottom */}
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-[2vw] md:p-[1vw] overflow-auto pb-16">
        {" "}
        {/* Added pb-16 here too */}
        <Header title="Courses" />
        {/* Header bar already uses dark background, ensure text/inputs are visible */}
        <div className="bg-[#212529] text-white p-4 rounded-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold">
              All Courses ({filteredCourses.length})
            </h2>

            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1 md:w-64">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  // Add dark mode styles for search input
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-500 w-full text-sm text-black dark:text-white bg-white dark:bg-gray-700"
                />
                <Search
                  size={20}
                  // Adjust search icon color if needed
                  className="absolute right-3 top-2 text-gray-400 dark:text-gray-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAddCourseOpen(true)}
                  // Ensure hover works in dark mode
                  className="p-2 rounded text-white hover:bg-gray-700 dark:hover:bg-gray-600"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
        {successMessage && (
          // Add dark mode styles for success message
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg mt-3">
            {successMessage}
          </div>
        )}
        {error ? (
          // Error state already handled above with dark mode styles
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <AlertTriangle size={64} className="text-red-500 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Failed to Load Courses
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
              We encountered an error while trying to fetch the course data.
              This could be due to network issues or server unavailability.
            </p>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] dark:bg-gray-700 dark:hover:bg-[#F6BA18] dark:hover:text-[#212529] transition-colors duration-300 flex items-center gap-2"
              >
                Refresh Page
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                You can try refreshing the page or contact support if the issue
                persists
              </span>
            </div>
          </div>
        ) : courses.length === 0 ? (
          // Add dark mode styles for empty state
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <InboxIcon size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Courses Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
              There are currently no courses in the system. Click the "+" button
              to add a new course.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                // Add dark mode background and shadow for course cards
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-dark-sm overflow-hidden group hover:shadow-lg dark:hover:shadow-dark-lg transition-shadow duration-300"
              >
                {/* Course Header Image/Gradient */}
                <div className="relative h-40">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                  <img
                    src={
                      course.image ||
                      "https://placehold.co/600x400/212529/FFF?text=Course"
                    }
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Action Buttons - Positioned over image */}
                  <div className="absolute top-2 right-2 z-20 flex gap-1">
                    <button
                      onClick={() => handleEdit(course)}
                      // Add dark mode styles for edit button
                      className="p-2 rounded-full bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors"
                      title="Edit course"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setCourseToDelete(course)}
                      // Add dark mode styles for delete button
                      className="p-2 rounded-full bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 text-red-600 transition-colors"
                      title="Delete course"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-5 flex-grow flex flex-col">
                  <div className="mb-3">
                    {/* Add dark mode text color */}
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
                      {course.name}
                    </h3>
                    {/* Add dark mode styles for badge */}
                    <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 rounded inline-block">
                      COURSE {course.id}
                    </span>
                  </div>

                  {/* Add dark mode text color */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 overflow-hidden">
                    {course.description || "No description available"}
                  </p>

                  {/* Course Details - Always Visible */}
                  {/* Add dark mode border color */}
                  <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                    <div className="flex items-center text-sm">
                      {/* Add dark mode background for icon container */}
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg mr-3">
                        <Users size={14} className="text-blue-500" />
                      </div>
                      <div>
                        {/* Add dark mode text color */}
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Teacher
                        </p>
                        {/* Add dark mode text color */}
                        <p className="text-gray-900 dark:text-gray-100">
                          {course.teacher || "Not assigned"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center text-sm">
                      {/* Add dark mode background for icon container */}
                      <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg mr-3">
                        <Users size={14} className="text-green-500" />
                      </div>
                      <div>
                        {/* Add dark mode text color */}
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Learner Group
                        </p>
                        {/* Add dark mode text color */}
                        <p className="text-gray-900 dark:text-gray-100">
                          {course.learner_group || "No group"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center text-sm">
                      {/* Add dark mode background for icon container */}
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg mr-3">
                        <Users size={14} className="text-purple-500" />
                      </div>
                      <div>
                        {/* Add dark mode text color */}
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Student Teacher Group
                        </p>
                        {/* Add dark mode text color */}
                        <p className="text-gray-900 dark:text-gray-100">
                          {course.student_teacher_group || "No group"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* MobileNavBar likely handles its own dark mode via ThemeContext */}
            <MobileNavBar navItems={navItems} />
          </div>
        )}
        {/* Remove the floating plus button since we now have it in the header */}
        {/* Modals (EditCourseModal, DeleteModal, AddCourse) should handle their own dark mode */}
        {editingCourse && (
          <EditCourseModal
            course={editingCourse}
            onClose={() => setEditingCourse(null)}
            onSave={saveCourseChanges}
            availableTeachers={availableTeachers}
            learnerGroups={learnerGroups}
            studentTeacherGroups={studentTeacherGroups}
          />
        )}
        {courseToDelete && (
          <DeleteModal
            // Pass necessary props, assuming DeleteModal handles dark mode
            module={courseToDelete} // Assuming 'module' prop is correct, might need adjustment
            message={`Are you sure you want to delete the course "${courseToDelete.name}"? This action cannot be undone.`}
            onConfirm={confirmDelete}
            onCancel={() => setCourseToDelete(null)}
            onClose={() => setCourseToDelete(null)}
          />
        )}
        <AddCourse
          isOpen={isAddCourseOpen}
          onClose={() => setIsAddCourseOpen(false)}
          onCourseAdded={handleCourseAdded}
          // Assuming AddCourse handles dark mode internally
        />
      </div>
    </div>
  );
}

export default AdminCourses;
