import React, { useState, useEffect } from "react";
import Modal from "../../Button/Modal.jsx";
import { createCourse } from "../../../../services/courseService";
import { getTeachers } from "../../../../services/userService";
import { getGroupsByType } from "../../../../services/groupService";
import { X, AlertTriangle } from "lucide-react";
import { useTheme } from "../../../../contexts/ThemeContext";

const AddCourse = ({ isOpen, onClose, onCourseAdded }) => {
  const { isDarkMode } = useTheme();
  const initialFormState = {
    name: "",
    description: "",
    user_id: "",
    learner_group_id: "",
    student_teacher_group_id: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [learnerGroups, setLearnerGroups] = useState([]);
  const [studentTeacherGroups, setStudentTeacherGroups] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachers, learners, studentTeachers] = await Promise.all([
          getTeachers({ page: 1, limit: 0 }),
          getGroupsByType("learner"),
          getGroupsByType("student_teacher"),
        ]);

        setAvailableTeachers(teachers);
        setLearnerGroups(learners);
        setStudentTeacherGroups(studentTeachers);
      } catch (err) {
        setError("Failed to load data: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState);
      setError(null);
      setSuccessMessage("");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      // Validate required fields
      if (
        !formData.name ||
        !formData.description ||
        !formData.user_id ||
        !formData.learner_group_id ||
        !formData.student_teacher_group_id
      ) {
        setError("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      const courseToSubmit = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        user_id: parseInt(formData.user_id),
        learner_group_id: parseInt(formData.learner_group_id),
        student_teacher_group_id: parseInt(formData.student_teacher_group_id),
      };

      const newCourse = await createCourse(courseToSubmit);
      setSuccessMessage("Course created successfully");
      onCourseAdded(newCourse);
      onClose();
    } catch (err) {
      // Display the error message from the backend or a fallback message
      setError(err.message || "Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setFormData(initialFormState);
    setError(null);
    setSuccessMessage("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col max-h-[80vh]">
        <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b dark:border-gray-700 sticky top-0 z-10 transition-colors">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors">Add New Course</h2>
        </div>

        <div className="p-6 overflow-y-auto bg-white dark:bg-gray-800 transition-colors">
          {error && (
            <div
              role="alert"
              className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 transition-colors"
            >
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400 p-4 rounded mb-4 transition-colors">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                data-testid="course-name-label"
              >
                Course Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                required
                data-testid="course-name-input"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                rows={3}
                required
              />
            </div>

            <div>
              <label
                htmlFor="user_id"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors"
              >
                Select Teacher
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
                {availableTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className={`p-4 cursor-pointer transition-colors duration-200 ${
                      formData.user_id === teacher.id.toString()
                        ? isDarkMode 
                          ? "bg-yellow-900/30 border-l-4 border-yellow-500" 
                          : "bg-yellow-50 border-l-4 border-yellow-500"
                        : isDarkMode 
                          ? "hover:bg-gray-700" 
                          : "hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        user_id: teacher.id.toString(),
                      }))
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors">
                          {`${teacher.first_name} ${teacher.last_name}`}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">{teacher.email}</p>
                      </div>
                      <div className="w-5">
                        {formData.user_id === teacher.id.toString() && (
                          <div className="w-4 h-4 rounded-full bg-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="learner_group_id"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors"
              >
                Select Learner Group
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
                {learnerGroups.map((group) => (
                  <div
                    key={group.id}
                    className={`p-4 cursor-pointer transition-colors duration-200 ${
                      formData.learner_group_id === group.id.toString()
                        ? isDarkMode 
                          ? "bg-yellow-900/30 border-l-4 border-yellow-500" 
                          : "bg-yellow-50 border-l-4 border-yellow-500"
                        : isDarkMode 
                          ? "hover:bg-gray-700" 
                          : "hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        learner_group_id: group.id.toString(),
                      }))
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors">
                          {group.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                          Group ID: {group.id}
                        </p>
                      </div>
                      <div className="w-5">
                        {formData.learner_group_id === group.id.toString() && (
                          <div className="w-4 h-4 rounded-full bg-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="student_teacher_group_id"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors"
              >
                Select Student Teacher Group
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
                {studentTeacherGroups.map((group) => (
                  <div
                    key={group.id}
                    className={`p-4 cursor-pointer transition-colors duration-200 ${
                      formData.student_teacher_group_id === group.id.toString()
                        ? isDarkMode 
                          ? "bg-yellow-900/30 border-l-4 border-yellow-500" 
                          : "bg-yellow-50 border-l-4 border-yellow-500"
                        : isDarkMode 
                          ? "hover:bg-gray-700" 
                          : "hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        student_teacher_group_id: group.id.toString(),
                      }))
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors">
                          {group.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                          Group ID: {group.id}
                        </p>
                      </div>
                      <div className="w-5">
                        {formData.student_teacher_group_id ===
                          group.id.toString() && (
                          <div className="w-4 h-4 rounded-full bg-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 mr-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Creating..." : "Create Course"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default AddCourse;
