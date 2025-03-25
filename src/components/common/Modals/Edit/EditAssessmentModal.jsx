import React, { useState, useEffect } from "react";
import { X, Loader } from "lucide-react";
import { editAssessment } from "../../../../services/assessmentService";

const EditAssessmentModal = ({ isOpen, assessment, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "quiz",
    max_score: 100,
    passing_score: 60,
    duration_minutes: 60,
    due_date: "",
    instructions: "",
    is_published: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (assessment) {
      try {
        // Format the date correctly for the input - handle both Date objects and ISO strings
        let formattedDate = "";
        if (assessment.due_date) {
          // Make sure we have a Date object to work with
          const dueDate =
            assessment.due_date instanceof Date
              ? assessment.due_date
              : new Date(assessment.due_date);

          if (!isNaN(dueDate.getTime())) {
            // Format as YYYY-MM-DDTHH:MM (datetime-local format)
            formattedDate = dueDate.toISOString().substring(0, 16);
          } else {
            console.warn("Invalid date:", assessment.due_date);
          }
        }

        setFormData({
          ...assessment,
          due_date: formattedDate,
          // Make sure all required fields are present with appropriate defaults
          is_published: assessment.is_published || false,
          instructions: assessment.instructions || "",
          type: assessment.type || "quiz",
          max_score: assessment.max_score || 100,
          passing_score: assessment.passing_score || 60,
          duration_minutes: assessment.duration_minutes || 60,
        });
      } catch (err) {
        console.error("Error formatting assessment data:", err);
        setError("Error preparing form data. Please try again.");
      }
    }
  }, [assessment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Format data to match API requirements exactly
      const assessmentData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        max_score: parseInt(formData.max_score),
        passing_score: parseInt(formData.passing_score),
        duration_minutes: parseInt(formData.duration_minutes),
        due_date: new Date(formData.due_date).toISOString(),
        is_published: Boolean(formData.is_published),
        instructions: formData.instructions?.trim() || "",
      };

      // Call the API
      const response = await editAssessment(assessment.id, assessmentData);

      if (response.success) {
        onSubmit(response.assessment);
        onClose();
      } else {
        throw new Error(response.message || "Failed to update assessment");
      }
    } catch (err) {
      console.error("Error updating assessment:", err);
      setError(err.message || "Failed to update assessment");
    } finally {
      setIsLoading(false);
    }
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
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                id="title"
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
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
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="quiz">Quiz</option>
                  <option value="exam">Exam</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration (minutes)
                </label>
                <input
                  id="duration"
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
                <label htmlFor="max_score" className="block text-sm font-medium text-gray-700">
                  Max Score
                </label>
                <input
                  id="max_score"
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
                <label htmlFor="pass_score"className="block text-sm font-medium text-gray-700">
                  Passing Score
                </label>
                <input
                  id="pass_score"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="due_date"className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  id="due_date" 
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) =>
                    setFormData({ ...formData, is_published: e.target.checked })
                  }
                  className="h-4 w-4 text-yellow-600 rounded border-gray-300"
                />
                <label
                  htmlFor="is_published"
                  className="ml-2 text-sm text-gray-700"
                >
                  Published
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
                Instructions
              </label>
              <textarea
                id="instructions"
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
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-[#212529] rounded-md hover:bg-[#F6BA18] hover:text-[#212529] flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAssessmentModal;
