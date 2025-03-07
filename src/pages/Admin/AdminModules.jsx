// AdminModules.jsx
import React, { useState, useEffect } from "react";
import Sidebar, { SidebarItem } from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import Modal from "../../components/common/Button/Modal";
import DeleteModal from "../../components/common/Modals/Delete/DeleteModal";
import {
  MoreVertical,
  ChevronDown,
  Edit,
  Trash2,
  Plus,
  Save,
  XCircle,
  Users,
  Book,
  Bell,
  FileText,
  Pencil,
} from "lucide-react";

function AdminModules() {
  const [courses, setCourses] = useState([]);
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [learnerGroups, setLearnerGroups] = useState([]); //for dropdown
  const [studentTeacherGroups, setStudentTeacherGroups] = useState([]); //for dropdown
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    //for add
    name: "",
    description: "",
    user_id: "", // Teacher ID,
    learner_group_id: "",
    student_teacher_group_id: "",
    image: "",
  });
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

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

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token"); // Get the token
      const response = await fetch(
        `http://localhost:4000/api/courses/${moduleToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the header
          },
        }
      );

      if (response.ok) {
        setCourses((prevCourses) =>
          prevCourses.filter((course) => course.id !== moduleToDelete.id)
        );
      } else {
        const errorData = await response.json();
        console.error("Error deleting course:", errorData);
        alert(
          `Failed to delete course: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Network error while deleting course");
    } finally {
      setModuleToDelete(null);
      setDropdownOpen(null);
    }
  };

  const navItems = [
    { text: "Users", icon: <Users size={20} />, route: "/AdminUser" },
    { text: "Courses", icon: <Book size={20} />, route: "/AdminModules" },
    {
      text: "Enrollments",
      icon: <Pencil size={20} />,
      route: "/AdminEnrollment",
    },
    {
      text: "Announcements",
      icon: <FileText size={20} />,
      route: "/AdminAnnouncements",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found. User might not be logged in.");
        setIsLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        const [
          coursesResponse,
          teachersResponse,
          learnerGroupsResponse,
          studentTeacherGroupsResponse,
        ] = await Promise.all([
          fetch("http://localhost:4000/api/courses", { headers }),
          fetch("http://localhost:4000/api/users", { headers }),
          fetch("http://localhost:4000/api/groups?group_type=learner", {
            headers,
          }),
          fetch("http://localhost:4000/api/groups?group_type=student_teacher", {
            headers,
          }),
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
          const filteredTeachers = teachersData.rows.filter(
            (user) => user.role === "teacher"
          );
          setTeachers(filteredTeachers);
        } else {
          console.error("teachersData.rows is not an array:", teachersData);
          setTeachers([]);
        }

        if (!learnerGroupsResponse.ok) {
          throw new Error(
            `HTTP error! status: ${learnerGroupsResponse.status}`
          );
        }
        const learnerGroupsData = await learnerGroupsResponse.json();
        if (Array.isArray(learnerGroupsData)) {
          setLearnerGroups(learnerGroupsData);
        } else if (learnerGroupsData && Array.isArray(learnerGroupsData.rows)) {
          setLearnerGroups(learnerGroupsData.rows);
        } else {
          console.error(
            "Learner groups data is not an array:",
            learnerGroupsData
          );
          setLearnerGroups([]);
        }

        if (!studentTeacherGroupsResponse.ok) {
          throw new Error(
            `HTTP error! status: ${studentTeacherGroupsResponse.status}`
          );
        }
        const studentTeacherGroupsData =
          await studentTeacherGroupsResponse.json();
        if (Array.isArray(studentTeacherGroupsData)) {
          setStudentTeacherGroups(studentTeacherGroupsData);
        } else if (
          studentTeacherGroupsData &&
          Array.isArray(studentTeacherGroupsData.rows)
        ) {
          setStudentTeacherGroups(studentTeacherGroupsData.rows);
        } else {
          console.error(
            "Student teacher groups data is not an array:",
            studentTeacherGroupsData
          );
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

  const toggleExpand = (id) => {
    setExpandedCourseId(expandedCourseId === id ? null : id);
  };

  const handleEdit = (course) => {
    setEditingCourse({ ...course }); // Create a *copy* for editing
    setDropdownOpen(null);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingCourse((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingCourse((prev) => ({ ...prev, image: reader.result }));
        setNewCourse((prev) => ({ ...prev, image: reader.result })); //for add
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (id) => {
    const token = localStorage.getItem("token"); // Get token
    try {
      const response = await fetch(`http://localhost:4000/api/courses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include token
        },
        body: JSON.stringify(editingCourse),
      });

      if (response.ok) {
        const updatedCourse = await response.json();
        // Update the courses state with the updated course.
        setCourses((prevCourses) =>
          prevCourses.map((c) => (c.id === id ? updatedCourse : c))
        );
        setEditingCourse(null); // Exit edit mode
      } else {
        const errorData = await response.json();
        console.error("Error updating course:", errorData);
        alert(
          `Failed to update course: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error updating course:", error);
      alert("Network error while updating course");
    }
  };

  const handleCancelEdit = () => {
    setEditingCourse(null);
  };

  const handleAddCourse = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:4000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include token
        },
        body: JSON.stringify(newCourse),
      });

      if (response.ok) {
        const addedCourse = await response.json();
        setCourses((prevCourses) => [...prevCourses, addedCourse.course]);
        setIsAddCourseOpen(false); // Close modal after successful addition
        setNewCourse({
          // Clear form
          name: "",
          description: "",
          user_id: "",
          learner_group_id: "",
          student_teacher_group_id: "",
          image: "",
        });
      } else {
        const errorData = await response.json();
        console.error("Error adding course:", errorData);
        alert(`Failed to add course: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error adding course:", error);
      alert("Network error while adding course");
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
          <Header title="Admin: Manage Courses" />
          <div className="mt-4">
            <div className="bg-white shadow rounded-lg">
              <ul className="divide-y divide-gray-200">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <li key={course.id}>
                      {/* Main Course Item */}
                      <div
                        className="flex justify-between items-center p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleExpand(course.id)}
                      >
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {course.name}
                          </h3>
                        </div>
                        {/* Dropdown and Actions */}
                        <div className="relative flex items-center space-x-2">
                          <ChevronDown
                            size={20}
                            className={`cursor-pointer transition-transform ${
                              expandedCourseId === course.id ? "rotate-180" : ""
                            }`}
                            onClick={() => toggleExpand(course.id)}
                          />
                          <button
                            onClick={(e) => toggleDropdown(course.id, e)}
                            className="menu-btn relative z-20"
                          >
                            <MoreVertical
                              size={20}
                              className="cursor-pointer"
                            />
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
                                onClick={() => setModuleToDelete(course)}
                              >
                                <Trash2 size={16} className="mr-2" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {expandedCourseId === course.id && (
                        <div className="p-4 bg-gray-50">
                          {editingCourse && editingCourse.id === course.id ? (
                            // --- Edit Mode ---
                            <div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">
                                    Course Name
                                  </label>
                                  <input
                                    type="text"
                                    name="name"
                                    value={editingCourse.name}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  />
                                  <label className="block text-sm font-medium text-gray-700 mt-4">
                                    Description
                                  </label>
                                  <textarea
                                    name="description"
                                    value={editingCourse.description}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">
                                    Teacher
                                  </label>
                                  <select
                                    name="user_id"
                                    value={editingCourse.user_id || ""}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  >
                                    <option value="">Select Teacher</option>
                                    {teachers.map((teacher) => (
                                      <option
                                        key={teacher.id}
                                        value={teacher.id}
                                      >
                                        {teacher.first_name} {teacher.last_name}
                                      </option>
                                    ))}
                                  </select>
                                  <label className="block text-sm font-medium text-gray-700 mt-4">
                                    {" "}
                                    Image{" "}
                                  </label>
                                  <input
                                    type="file"
                                    name="image"
                                    onChange={handleImageChange}
                                    className="mt-1 block w-full"
                                    accept="image/*"
                                  />
                                  {editingCourse.image && (
                                    <img
                                      src={editingCourse.image}
                                      alt="Course"
                                      className="mt-2 h-20 w-auto"
                                    />
                                  )}
                                  <label className="block text-sm font-medium text-gray-700 mt-4">
                                    Learner Group
                                  </label>
                                  <select
                                    name="learner_group_id"
                                    value={editingCourse.learner_group_id || ""}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  >
                                    <option value="">
                                      Select Learner Group
                                    </option>
                                    {learnerGroups.map((group) => (
                                      <option
                                        key={group.group_id}
                                        value={group.group_id}
                                      >
                                        {group.name}
                                      </option>
                                    ))}
                                  </select>

                                  <label className="block text-sm font-medium text-gray-700 mt-4">
                                    Student Teacher Group
                                  </label>
                                  <select
                                    name="student_teacher_group_id"
                                    value={
                                      editingCourse.student_teacher_group_id ||
                                      ""
                                    }
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  >
                                    <option value="">
                                      Select Student Teacher Group
                                    </option>
                                    {studentTeacherGroups.map((group) => (
                                      <option
                                        key={group.group_id}
                                        value={group.group_id}
                                      >
                                        {group.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="mt-4">
                                <button
                                  type="button"
                                  onClick={() => handleSave(course.id)}
                                  className="px-4 py-2 mr-2 bg-green-500 text-white rounded hover:bg-green-700"
                                >
                                  <Save size={16} className="inline mr-1" />{" "}
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                                >
                                  <XCircle size={16} className="inline mr-1" />{" "}
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // --- View Mode ---
                            <div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="font-semibold">Course Name</p>
                                  <p className="text-gray-700">{course.name}</p>
                                  <p className="font-semibold mt-2">
                                    Description
                                  </p>
                                  <p className="text-gray-700">
                                    {course.description}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-semibold">Teacher</p>
                                  <p className="text-gray-700">
                                    {course.teacher
                                      ? `${course.teacher.first_name} ${course.teacher.last_name}`
                                      : "Not assigned"}
                                  </p>

                                  <p className="font-semibold mt-2">
                                    Learner Group
                                  </p>
                                  <p className="text-gray-700">
                                    {course.learnerGroup
                                      ? course.learnerGroup.name
                                      : "Not assigned"}
                                  </p>
                                  <p className="font-semibold mt-2">
                                    Student Teacher Group
                                  </p>
                                  <p className="text-gray-700">
                                    {course.studentTeacherGroup
                                      ? course.studentTeacherGroup.name
                                      : "Not assigned"}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-4">
                                {course.image && (
                                  <img
                                    src={course.image}
                                    alt={course.name}
                                    className="h-48 w-auto"
                                  />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-center text-gray-600">
                    No courses available
                  </li>
                )}
              </ul>
            </div>

            {/* Add Course Button */}
            <button
              onClick={() => setIsAddCourseOpen(true)}
              className="fixed bottom-8 right-8 bg-yellow-500 text-white rounded-full p-4 shadow-lg hover:bg-yellow-600 transition-colors"
            >
              <Plus size={24} />
            </button>
          </div>

          {/* Add Course Modal */}
          {isAddCourseOpen && (
            <Modal
              isOpen={isAddCourseOpen}
              onClose={() => setIsAddCourseOpen(false)}
            >
              <h2 className="text-xl font-semibold mb-4">Add New Course</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddCourse();
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    {/* Course Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Course Name
                      </label>
                      <input
                        type="text"
                        value={newCourse.name}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, name: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        value={newCourse.description}
                        onChange={(e) =>
                          setNewCourse({
                            ...newCourse,
                            description: e.target.value,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                    {/* Image Upload (Full Width) */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Image
                      </label>
                      <input
                        type="file"
                        onChange={handleImageChange}
                        className="mt-1 block w-full"
                        accept="image/*"
                      />
                      {newCourse.image && (
                        <img
                          src={newCourse.image}
                          alt="New Course Preview"
                          className="mt-2 h-20 w-auto"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    {/* Teacher Dropdown */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Teacher
                      </label>
                      <select
                        value={newCourse.user_id}
                        onChange={(e) =>
                          setNewCourse({
                            ...newCourse,
                            user_id: e.target.value,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      >
                        <option value="">Select Teacher</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.first_name} {teacher.last_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Learner Group Dropdown */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Learner Group
                      </label>
                      <select
                        value={newCourse.learner_group_id}
                        onChange={(e) =>
                          setNewCourse({
                            ...newCourse,
                            learner_group_id: e.target.value,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      >
                        <option value="">Select Learner Group</option>
                        {learnerGroups.map((group) => (
                          <option key={group.group_id} value={group.group_id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Student Teacher Group Dropdown */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Student Teacher Group
                      </label>
                      <select
                        value={newCourse.student_teacher_group_id}
                        onChange={(e) =>
                          setNewCourse({
                            ...newCourse,
                            student_teacher_group_id: e.target.value,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      >
                        <option value="">Select Student Teacher Group</option>
                        {studentTeacherGroups.map((group) => (
                          <option key={group.group_id} value={group.group_id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddCourseOpen(false)}
                    className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
                  >
                    Add Course
                  </button>
                </div>
              </form>
            </Modal>
          )}
          {/* Delete Confirmation Modal */}
          {moduleToDelete && (
            <DeleteModal
              module={moduleToDelete}
              onConfirm={confirmDelete}
              onCancel={() => setModuleToDelete(null)}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default AdminModules;
