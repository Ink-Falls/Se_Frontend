import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { createAssessment } from '../../../../services/assessmentService';
import { getModulesByCourseId } from '../../../../services/moduleService';
import { useCourse } from '../../../../contexts/CourseContext'; // Add this import

const CreateAssessmentModal = ({ isOpen, onClose, onSuccess }) => {
  const { selectedCourse } = useCourse(); // Add this line

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    module_id: '',
    type: 'quiz',
    max_score: 100,
    passing_score: 60,
    duration_minutes: 30,
    due_date: '',
    is_published: false,
    instructions: '',
    allowed_attempts: 3,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [moduleOptions, setModuleOptions] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special validation for duration_minutes
    if (name === 'duration_minutes') {
      // Allow empty input for clearing
      if (value === '') {
        setFormData((prev) => ({ ...prev, duration_minutes: '' }));
        setError('Time limit must be greater than 0 minutes');
        return;
      }

      const numValue = parseInt(value);

      // Check for zero and negative values
      if (numValue <= 0) {
        setFormData((prev) => ({ ...prev, duration_minutes: value }));
        setError('Time limit must be greater than 0 minutes');
        return;
      }

      setFormData((prev) => ({ ...prev, duration_minutes: numValue }));
      setError('');
      return;
    }

    // Handle other fields
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Add validation for time limit
      if (parseInt(formData.duration_minutes) <= 0) {
        setError('Time limit must be greater than 0 minutes');
        setIsLoading(false);
        return;
      }

      const assessmentData = {
        ...formData,
        module_id: parseInt(formData.module_id),
        course_id: selectedCourse.id,
        max_score: parseInt(formData.max_score),
        passing_score: parseInt(formData.passing_score),
        duration_minutes: parseInt(formData.duration_minutes),
        allowed_attempts: parseInt(formData.allowed_attempts),
      };

      const response = await createAssessment(assessmentData);
      if (response.success) {
        onSuccess(response.assessment);
        onClose();
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error('Assessment creation error:', err);
      // Handle specific API errors
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Invalid assessment data');
      } else if (err.response?.status === 403) {
        setError("You don't have permission to create assessments");
      } else if (err.response?.status === 409) {
        setError('An assessment with this title already exists');
      } else {
        setError(err.message || 'Failed to create assessment');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        module_id: '',
        type: 'quiz',
        max_score: 100,
        passing_score: 60,
        duration_minutes: 30,
        due_date: '',
        is_published: false,
        instructions: '',
        allowed_attempts: 3,
      });
      setError('');
    }
  }, [isOpen]);

  // Add useEffect to fetch modules when modal opens
  useEffect(() => {
    const fetchModules = async () => {
      if (!isOpen || !selectedCourse?.id) return;

      try {
        setLoadingModules(true);
        const modulesResponse = await getModulesByCourseId(selectedCourse.id);

        // Check if modulesResponse is array and has items
        if (Array.isArray(modulesResponse) && modulesResponse.length > 0) {
          setModuleOptions(
            modulesResponse.map((module) => ({
              module_id: module.module_id,
              name: module.name,
            }))
          );
        } else {
          setError('No modules available for this course');
        }
      } catch (error) {
        console.error('Error fetching modules:', error);
        setError('Failed to load modules');
      } finally {
        setLoadingModules(false);
      }
    };

    fetchModules();
  }, [isOpen, selectedCourse?.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Create New Assessment</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
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
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label
                  htmlFor="module_id"
                  className="block text-sm font-medium text-gray-700"
                >
                  Module
                </label>
                <select
                  id="module_id"
                  name="module_id"
                  value={formData.module_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                  disabled={loadingModules}
                >
                  <option value="">Select a module</option>
                  {moduleOptions.map((module) => (
                    <option key={module.module_id} value={module.module_id}>
                      {module.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div className="col-span-2">
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
                  onChange={handleInputChange}
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Type
                </label>
                <select
                  id="type"
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
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700"
                >
                  Time Limit (minutes)
                </label>
                <input
                  id="duration"
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleInputChange}
                  onKeyPress={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === '.') {
                      e.preventDefault();
                    }
                  }}
                  min="1"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="max_score"
                  className="block text-sm font-medium text-gray-700"
                >
                  Maximum Score
                </label>
                <input
                  id="max_score"
                  type="number"
                  name="max_score"
                  value={formData.max_score}
                  onChange={handleInputChange}
                  onKeyPress={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === '.') {
                      e.preventDefault();
                    }
                  }}
                  min="1"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="pass_score"
                  className="block text-sm font-medium text-gray-700"
                >
                  Passing Score
                </label>
                <input
                  id="pass_score"
                  type="number"
                  name="passing_score"
                  value={formData.passing_score}
                  onChange={handleInputChange}
                  onKeyPress={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === '.') {
                      e.preventDefault();
                    }
                  }}
                  min="1"
                  max={formData.max_score}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="due_date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Due Date
                </label>
                <input
                  id="due_date"
                  type="datetime-local"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="instruction"
                  className="block text-sm font-medium text-gray-700"
                >
                  Instructions
                </label>
                <textarea
                  id="instruction"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="allowed_attempts"
                  className="block text-sm font-medium text-gray-700"
                >
                  Allowed Attempts
                </label>
                <input
                  id="allowed_attempts"
                  type="number"
                  name="allowed_attempts"
                  min="1"
                  max="10"
                  value={formData.allowed_attempts}
                  onChange={handleInputChange}
                  onKeyPress={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === '.') {
                      e.preventDefault();
                    }
                  }}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 border-t">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              aria-label="cancel"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Creating...
                </>
              ) : (
                'Create Assessment'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAssessmentModal;
