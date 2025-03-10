import React, { useState, useEffect } from "react";
import Modal from "../../Button/Modal";
import { createCourse } from "../../../../services/courseService";

const AddCourse = ({ isOpen, onClose, onCourseAdded }) => {
  const [teachers, setTeachers] = useState([]);
  const [learnerGroups, setLearnerGroups] = useState([]);
  const [studentTeacherGroups, setStudentTeacherGroups] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    user_id: "",
    learner_group_id: "",
    student_teacher_group_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Fetch all required data in parallel
        const [teachersRes, learnerGroupsRes, studentTeacherGroupsRes] =
          await Promise.all([
            fetch(`${process.env.REACT_APP_API_URL}/users?role=teacher`, {
              headers,
            }),
            fetch(`${process.env.REACT_APP_API_URL}/groups?type=learner`, {
              headers,
            }),
            fetch(
              `${process.env.REACT_APP_API_URL}/groups?type=student_teacher`,
              { headers }
            ),
          ]);

        const teachersData = await teachersRes.json();
        const learnerGroupsData = await learnerGroupsRes.json();
        const studentTeacherGroupsData = await studentTeacherGroupsRes.json();

        setTeachers(teachersData.rows || []);
        setLearnerGroups(learnerGroupsData || []);
        setStudentTeacherGroups(studentTeacherGroupsData || []);
      } catch (err) {
        setError("Failed to load form data");
        console.error(err);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newCourse = await createCourse(formData);
      onCourseAdded(newCourse);
      onClose();
      setFormData({
        name: "",
        description: "",
        user_id: "",
        learner_group_id: "",
        student_teacher_group_id: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Course Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teacher
                </label>
                <select
                  required
                  value={formData.user_id}
                  onChange={(e) =>
                    setFormData({ ...formData, user_id: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((teacher) => (
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
                  required
                  value={formData.learner_group_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      learner_group_id: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
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
                <label className="block text-sm font-medium text-gray-700">
                  Student Teacher Group
                </label>
                <select
                  required
                  value={formData.student_teacher_group_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      student_teacher_group_id: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">Select a student teacher group</option>
                  {studentTeacherGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white px-6 py-4 border-t sticky bottom-0 z-10">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddCourse;
