import React, { useState } from "react";
import { X, Loader } from "lucide-react";
import { createAssessment } from "../../../../services/assessmentService";

const CreateAssessmentModal = ({ isOpen, onClose, courseId, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "quiz",
    max_score: 100,
    passing_score: 60,
    duration_minutes: 60,
    due_date: "",
    is_published: false,
    instructions: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const assessmentData = {
        ...formData,
        course_id: courseId,
        max_score: parseInt(formData.max_score),
        passing_score: parseInt(formData.passing_score),
        duration_minutes: parseInt(formData.duration_minutes),
      };

      const response = await createAssessment(assessmentData);
      if (response.success) {
        onSuccess(response.assessment);
        onClose();
      } else {
        throw new Error(response.message || "Failed to create assessment");
      }
    } catch (err) {
      setError(err.message || "Failed to create assessment");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Assessment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="quiz">Quiz</option>
                <option value="exam">Exam</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleInputChange}
                min="1"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Maximum Score
              </label>
              <input
                type="number"
                name="max_score"
                value={formData.max_score}
                onChange={handleInputChange}
                min="1"
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
                name="passing_score"
                value={formData.passing_score}
                onChange={handleInputChange}
                min="1"
                max={formData.max_score}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="datetime-local"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleInputChange}
                className="h-4 w-4 text-yellow-600 rounded border-gray-300"
              />
              <label className="ml-2 text-sm text-gray-700">
                Publish immediately
              </label>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Instructions
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Creating...
                </>
              ) : (
                "Create Assessment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssessmentModal;
