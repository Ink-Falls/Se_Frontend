import React, { useState, useEffect } from "react";
import Modal from "../../Button/Modal.jsx";
import { createCourse } from "../../../../services/courseService";
import { getTeachers } from "../../../../services/userService";
import { getGroupsByType } from "../../../../services/groupService";

const AddCourse = ({ isOpen, onClose, onCourseAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    user_id: "",
    learner_group_id: "",
    student_teacher_group_id: "",
  });
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
          getTeachers({page: 1, limit: 0}),
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      if (
        !formData.name ||
        !formData.description ||
        !formData.user_id ||
        !formData.learner_group_id ||
        !formData.student_teacher_group_id
      ) {
        setError("Please fill in all required fields");
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
      onCourseAdded(newCourse);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create course");
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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col max-h-[80vh]">
        <div className="bg-white px-6 py-4 border-b sticky top-0 z-10">
          <h2 className="text-2xl font-bold">Add New Course</h2>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded mb-4">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 text-green-500 p-4 rounded mb-4">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
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
              <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">
                Teacher
              </label>
              <select
                id="user_id"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              >
                <option value="">Select a teacher</option>
                {availableTeachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {`${teacher.first_name} ${teacher.last_name}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="learner_group_id" className="block text-sm font-medium text-gray-700">
                Learner Group
              </label>
              <select
                id="learner_group_id"
                name="learner_group_id"
                value={formData.learner_group_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              >
                <option value="">Select a learner group</option>
                {learnerGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="student_teacher_group_id" className="block text-sm font-medium text-gray-700">
                Student Teacher Group
              </label>
              <select
                id="student_teacher_group_id"
                name="student_teacher_group_id"
                value={formData.student_teacher_group_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              >
                <option value="">Select a student teacher group</option>
                {studentTeacherGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
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