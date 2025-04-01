import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";

const EditCourseModal = ({
  course,
  onClose,
  onSave,
  availableTeachers,
  learnerGroups,
  studentTeacherGroups,
}) => {
  const [editedCourse, setEditedCourse] = useState(course);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate form fields
      if (!editedCourse.name?.trim()) {
        throw new Error("Course name is required");
      }

      if (!editedCourse.user_id) {
        throw new Error("Please select a teacher");
      }

      if (
        !editedCourse.learner_group_id ||
        !editedCourse.student_teacher_group_id
      ) {
        throw new Error(
          "Please select both learner and student teacher groups"
        );
      }

      await onSave(editedCourse);
      onClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to update course";
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Edit Course</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={editedCourse.name}
                onChange={(e) =>
                  setEditedCourse({ ...editedCourse, name: e.target.value })
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
                value={editedCourse.description}
                onChange={(e) =>
                  setEditedCourse({
                    ...editedCourse,
                    description: e.target.value,
                  })
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
                value={editedCourse.user_id}
                onChange={(e) =>
                  setEditedCourse({ ...editedCourse, user_id: e.target.value })
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
                value={editedCourse.learner_group_id}
                onChange={(e) =>
                  setEditedCourse({
                    ...editedCourse,
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
                value={editedCourse.student_teacher_group_id}
                onChange={(e) =>
                  setEditedCourse({
                    ...editedCourse,
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
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourseModal;
