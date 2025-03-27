import React, { useState, useEffect } from "react";
import Sidebar, {
  SidebarItem,
} from "/src/components/common/layout/Sidebar.jsx";
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
  AlertTriangle,
  InboxIcon,
} from "lucide-react";
import {
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../../services/courseService";
import { getTeachers } from "../../services/userService";
import { getGroupsByType } from "../../services/groupService";
import AddCourse from "../../components/common/Modals/Add/AddCourse";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import BlackHeader from "../../components/common/layout/BlackHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
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
  const [isLoading, setIsLoading] = useState(true);

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
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
            getTeachers(),
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
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-6 flex items-center justify-center">
          <LoadingSpinner text="Loading" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-6">
          <Header title="Courses" />
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <AlertTriangle size={64} className="text-red-500 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Failed to Load Courses
            </h3>
            <p className="text-gray-600 text-center max-w-md mb-8">
              We encountered an error while trying to fetch the course data.
              This could be due to network issues or server unavailability.
            </p>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 flex items-center gap-2"
              >
                Refresh Page
              </button>
              <span className="text-sm text-gray-500 mt-2">
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
        name: updatedCourse.name,
        description: updatedCourse.description,
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
      setSuccessMessage("Course updated successfully"); // Add success message
    } catch (error) {
      console.error("Error updating course:", error);
      // Handle error (you might want to show an error message to the user)
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

  return (
    <div className="flex h-screen bg-gray-100 relative pb-10">
      {" "}
      {/* Added pb-16 for padding bottom */}
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-[2vw] md:p-[1vw] overflow-auto pb-16">
        {" "}
        {/* Added pb-16 here too */}
        <Header title="Courses" />
        <BlackHeader title="All Courses" count={filteredCourses.length}>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-yellow-500 w-64 text-sm text-black"
              />
              <Search
                size={20}
                className="absolute right-3 top-2 text-gray-400"
              />
            </div>
            <button
              onClick={() => setIsAddCourseOpen(true)}
              className="p-2 rounded hover:bg-gray-700"
            >
              <Plus size={20} />
            </button>
          </div>
        </BlackHeader>
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg mt-3">
            {successMessage}
          </div>
        )}
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <AlertTriangle size={64} className="text-red-500 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Failed to Load Courses
            </h3>
            <p className="text-gray-600 text-center max-w-md mb-8">
              We encountered an error while trying to fetch the course data.
              This could be due to network issues or server unavailability.
            </p>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 flex items-center gap-2"
              >
                Refresh Page
              </button>
              <span className="text-sm text-gray-500 mt-2">
                You can try refreshing the page or contact support if the issue
                persists
              </span>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <InboxIcon size={64} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Courses Found
            </h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
              There are currently no courses in the system. Click the "+" button
              to add a new course.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow duration-300"
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
                      className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                      title="Edit course"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setCourseToDelete(course)}
                      className="p-2 rounded-full bg-white/90 hover:bg-white text-red-600 transition-colors"
                      title="Delete course"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-5 flex-grow flex flex-col">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {course.name}
                    </h3>
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded inline-block">
                      COURSE {course.id}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    {course.description || "No description available"}
                  </p>

                  {/* Course Details - Always Visible */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center text-sm">
                      <div className="p-2 bg-blue-50 rounded-lg mr-3">
                        <Users size={14} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          Teacher
                        </p>
                        <p className="text-gray-900">
                          {course.teacher || "Not assigned"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center text-sm">
                      <div className="p-2 bg-green-50 rounded-lg mr-3">
                        <Users size={14} className="text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          Learner Group
                        </p>
                        <p className="text-gray-900">
                          {course.learner_group || "No group"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center text-sm">
                      <div className="p-2 bg-purple-50 rounded-lg mr-3">
                        <Users size={14} className="text-purple-500" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          Student Teacher Group
                        </p>
                        <p className="text-gray-900">
                          {course.student_teacher_group || "No group"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <MobileNavBar navItems={navItems} />
          </div>
        )}
        {/* Remove the floating plus button since we now have it in the header */}
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
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingCourse.name}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        name: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={editingCourse.description}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        description: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Teacher
                  </label>
                  <select
                    value={editingCourse.user_id}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        user_id: e.target.value,
                      })
                    }
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
                  <label className="block text-sm font-medium text-gray-700">
                    Learner Group
                  </label>
                  <select
                    value={editingCourse.learner_group_id}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        learner_group_id: e.target.value,
                      })
                    }
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
                  <label className="block text-sm font-medium text-gray-700">
                    Student Teacher Group
                  </label>
                  <select
                    value={editingCourse.student_teacher_group_id}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        student_teacher_group_id: e.target.value,
                      })
                    }
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
            onClose={() => setCourseToDelete(null)}
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
