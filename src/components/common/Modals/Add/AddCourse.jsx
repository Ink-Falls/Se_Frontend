import React, { useState, useEffect } from "react";
import Modal from "../../Button/Modal";
import { createCourse } from "../../../../services/courseService";
import { getTeachers } from '../../../../services/userService';
import { getGroupsByType } from '../../../../services/groupService';

const AddCourse = ({ isOpen, onClose, onCourseAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    user_id: '',
    learner_group_id: '',
    student_teacher_group_id: ''
  });
  
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [learnerGroups, setLearnerGroups] = useState([]);
  const [studentTeacherGroups, setStudentTeacherGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const [teachers, learners, studentTeachers] = await Promise.all([
          getTeachers(),
          getGroupsByType('learner'),
          getGroupsByType('student_teacher')
        ]);

        setAvailableTeachers(teachers);
        setLearnerGroups(learners);
        setStudentTeacherGroups(studentTeachers);
      } catch (err) {
        setError('Failed to load data: ' + err.message);
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
    setSuccessMessage('');

    try {
        if (!formData.name || !formData.description || !formData.user_id || 
            !formData.learner_group_id || !formData.student_teacher_group_id) {
            setError('Please fill in all required fields');
            return;
        }

        const courseToSubmit = {
            name: formData.name.trim(),
            description: formData.description.trim(),
            user_id: parseInt(formData.user_id),
            learner_group_id: parseInt(formData.learner_group_id),
            student_teacher_group_id: parseInt(formData.student_teacher_group_id)
        };

        const newCourse = await createCourse(courseToSubmit);
        setSuccessMessage('Course created successfully!');

        // Call onCourseAdded immediately with the new course
        onCourseAdded(newCourse);

        // Reset form
        setFormData({
            name: '',
            description: '',
            user_id: '',
            learner_group_id: '',
            student_teacher_group_id: ''
        });
        
        // Close modal with a slight delay to show success message
        setTimeout(() => {
            onClose();
        }, 1000);

    } catch (err) {
        setError(err.message || 'Failed to create course');
    } finally {
        setIsLoading(false);
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
          {successMessage && (
            <div className="bg-green-50 text-green-500 p-4 rounded mb-4">
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
                {availableTeachers.map((teacher) => (
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
