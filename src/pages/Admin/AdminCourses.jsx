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
          console.log("Using cached course data");
          setCourses(cachedCourses);
          setLoading(false);
          return;
        }

        console.log("Fetching fresh course data");
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
    console.log("Current courses:", courses);
    console.log("Loading state:", loading);
    console.log("Error state:", error);
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
    // Log the course data being edited
    console.log("Course being edited:", course);

    const editData = {
      ...course,
      user_id: course.user_id || course.teacher_id || "", // Try both possible fields
      learner_group_id: course.learner_group_id || "",
      student_teacher_group_id: course.student_teacher_group_id || "",
    };

    console.log("Formatted edit data:", editData); // For debugging
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
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-[2vw] md:p-[1vw] overflow-auto">
        <Header title="Courses" />

        {/* Add success message display */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
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
          <div className="flex flex-col gap-6 mt-4">
            {" "}
            {/* Increased gap */}
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl p-6 border-l-4 border-yellow-500 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex justify-between items-center cursor-pointer">
                  {" "}
                  {/* Changed from items-start to items-center */}
                  <div
                    className="w-full space-y-1"
                    onClick={() =>
                      setExpandedCourseId(
                        expandedCourseId === course.id ? null : course.id
                      )
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                        COURSE {course.id}
                      </span>
                    </div>
                    <h3 className="font-bold text-xl text-gray-800 group-hover:text-yellow-600 transition-colors">
                      {course.name}
                    </h3>
                  </div>
                  <div className="relative flex items-center space-x-2">
                    {" "}
                    {/* Changed gap-3 to space-x-2 */}
                    <button
                      className={`p-2 rounded-full hover:bg-gray-100 transition-colors duration-150 ${
                        expandedCourseId === course.id ? "bg-gray-100" : ""
                      }`}
                      onClick={() =>
                        setExpandedCourseId(
                          expandedCourseId === course.id ? null : course.id
                        )
                      }
                    >
                      <ChevronDown
                        size={20}
                        className={`transform transition-transform duration-150 ${
                          expandedCourseId === course.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => toggleDropdown(course.id, e)}
                      className="menu-btn relative z-20 p-2 rounded-full hover:bg-gray-100 transition-colors duration-150"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {dropdownOpen === course.id && (
                      <div className="absolute right-0 top-12 bg-white border rounded-lg shadow-sm w-36 z-30 dropdown-menu overflow-hidden">
                        <button
                          className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 w-full transition-colors"
                          onClick={() => handleEdit(course)}
                        >
                          <Edit size={16} className="mr-3 text-gray-500" /> Edit
                        </button>
                        <button
                          className="flex items-center px-4 py-3 text-sm hover:bg-red-50 w-full text-red-600 transition-colors"
                          onClick={() => setCourseToDelete(course)}
                        >
                          <Trash2 size={16} className="mr-3" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`transition-all duration-150 overflow-hidden ${
                    expandedCourseId === course.id ? "mt-6" : "max-h-0"
                  }`}
                >
                  <div className="border-t pt-6 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-2">
                        Description
                      </h4>
                      <p className="text-gray-700">
                        {course.description || "No description available"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-600 mb-1">
                          Teacher
                        </h4>
                        <p className="text-gray-700">
                          {course.teacher || "Not assigned"}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-600 mb-1">
                          Learner Group
                        </h4>
                        <p className="text-gray-700">
                          {course.learner_group}
                          {course.learner_group_id && (
                            <span className="text-xs text-gray-400 ml-1">
                              (ID: {course.learner_group_id})
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-600 mb-1">
                          Student Teacher Group
                        </h4>
                        <p className="text-gray-700">
                          {course.student_teacher_group}
                          {course.student_teacher_group_id && (
                            <span className="text-xs text-gray-400 ml-1">
                              (ID: {course.student_teacher_group_id})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {course.image && (
                      <div className="mt-4">
                        <img
                          src={course.image}
                          alt={course.name}
                          className="w-full max-w-2xl h-48 object-cover rounded-lg shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
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
