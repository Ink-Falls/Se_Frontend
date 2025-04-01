import React, { useState, useEffect } from "react";
import Modal from "../../Button/Modal.jsx";
import { createCourse } from "../../../../services/courseService";
import { getTeachers } from "../../../../services/userService";
import { getGroupsByType } from "../../../../services/groupService";
import { X, AlertTriangle } from "lucide-react";

const AddCourse = ({ isOpen, onClose, onCourseAdded }) => {
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
        <div className="bg-white px-6 py-4 border-b sticky top-0 z-10">
          <h2 className="text-2xl font-bold">Add New Course</h2>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 text-green-500 p-4 rounded mb-4">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Course Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows={3}
                required
              />
            </div>

            <div>
              <label
                htmlFor="user_id"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Teacher
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                {availableTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                      formData.user_id === teacher.id.toString()
                        ? "bg-yellow-50 border-yellow-500"
                        : ""
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        user_id: teacher.id.toString(),
                      }))
                    }
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {`${teacher.first_name} ${teacher.last_name}`}
                      </span>
                      <span className="text-sm text-gray-500">
                        {teacher.email}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="learner_group_id"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Learner Group
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                {learnerGroups.map((group) => (
                  <div
                    key={group.id}
                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                      formData.learner_group_id === group.id.toString()
                        ? "bg-yellow-50 border-yellow-500"
                        : ""
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        learner_group_id: group.id.toString(),
                      }))
                    }
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{group.name}</span>
                      <span className="text-sm text-gray-500">
                        Group ID: {group.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="student_teacher_group_id"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Student Teacher Group
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                {studentTeacherGroups.map((group) => (
                  <div
                    key={group.id}
                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                      formData.student_teacher_group_id === group.id.toString()
                        ? "bg-yellow-50 border-yellow-500"
                        : ""
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        student_teacher_group_id: group.id.toString(),
                      }))
                    }
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{group.name}</span>
                      <span className="text-sm text-gray-500">
                        Group ID: {group.id}
                      </span>
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
                className="px-4 py-2 border rounded-md hover:bg-gray-50 mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
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
