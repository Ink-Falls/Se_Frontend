import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const EditAssessmentModal = ({ isOpen, assessment, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "quiz",
    max_score: 100,
    passing_score: 60,
    duration_minutes: 60,
    due_date: "",
    instructions: "", // Add instructions field
  });

  useEffect(() => {
    if (assessment) {
      setFormData({
        ...assessment,
        due_date: assessment.due_date
          ? new Date(assessment.due_date).toISOString().split("T")[0]
          : "",
      });
    }
  }, [assessment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Just pass the form data to parent
    onSubmit({ ...formData, id: assessment.id });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Edit Assessment</h2>
            <button onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
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
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="quiz">Quiz</option>
                  <option value="exam">Exam</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_minutes: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Score
                </label>
                <input
                  type="number"
                  value={formData.max_score}
                  onChange={(e) =>
                    setFormData({ ...formData, max_score: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Passing Score
                </label>
                <input
                  type="number"
                  value={formData.passing_score}
                  onChange={(e) =>
                    setFormData({ ...formData, passing_score: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Instructions
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) =>
                  setFormData({ ...formData, instructions: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows={4}
                placeholder="Enter detailed instructions for students"
              />
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 border-t">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-[#212529] rounded-md hover:bg-[#F6BA18] hover:text-[#212529]"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAssessmentModal;
