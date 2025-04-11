import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import {
  createModule,
  addModuleContent,
} from "../../../../services/moduleService";
import { useTheme } from "../../../../contexts/ThemeContext";

const CreateModuleModal = ({ onClose, onSubmit, courseId }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resources: [],
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const { isDarkMode } = useTheme();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addResource = () => {
    setFormData((prev) => ({
      ...prev,
      resources: [...prev.resources, { title: "", link: "" }],
    }));
  };

  const updateResource = (index, field, value) => {
    setFormData((prev) => {
      const updatedResources = [...prev.resources];
      updatedResources[index] = {
        ...updatedResources[index],
        [field]: value,
      };
      return { ...prev, resources: updatedResources };
    });
  };

  const removeResource = (index) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!formData.title.trim()) {
        throw new Error("Module title is required");
      }

      // Format the data
      const moduleData = {
        name: formData.title.trim(),
        description: formData.description.trim(),
        resources: formData.resources
          .map((resource) => ({
            title: resource.title.trim(),
            link: resource.link.trim(),
          }))
          .filter((r) => r.title && r.link), // Only include valid resources
      };

      // Submit to parent component
      await onSubmit(moduleData);
      onClose();
    } catch (err) {
      console.error("Error in module creation:", err);
      setError(err.message || "Failed to create module");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl dark:shadow-dark-xl transition-colors">
        {/* Fixed Header */}
        <div className="p-6 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 transition-colors">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create New Module</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} id="moduleForm" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                Module Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#F6BA18] focus:border-transparent transition-colors"
                placeholder="Enter module title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#F6BA18] focus:border-transparent transition-colors"
                placeholder="Enter module description"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowResources(!showResources)}
                className="flex items-center gap-2 text-[#212529] dark:text-gray-200 hover:text-[#F6BA18] dark:hover:text-[#F6BA18] transition-colors"
              >
                <Plus size={16} />
                {showResources ? "Hide Resources" : "Add Learning Resources"}
              </button>

              {showResources && (
                <div className="mt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                      Learning Resources
                    </label>
                    <button
                      type="button"
                      onClick={addResource}
                      className="text-[#212529] dark:text-gray-200 hover:text-[#F6BA18] dark:hover:text-[#F6BA18] flex items-center gap-1 transition-colors"
                    >
                      <Plus size={16} />
                      Add Resource
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.resources.map((resource, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={resource.title}
                          onChange={(e) =>
                            updateResource(index, "title", e.target.value)
                          }
                          placeholder="Resource title"
                          className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                        />
                        <input
                          type="url"
                          value={resource.link}
                          onChange={(e) =>
                            updateResource(index, "link", e.target.value)
                          }
                          placeholder="Resource link"
                          className="flex-2 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => removeResource(index)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 border-t dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 z-10 transition-colors">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="moduleForm"
              disabled={isLoading}
              className="px-4 py-2 bg-[#212529] dark:bg-[#333333] text-white rounded-md hover:bg-[#F6BA18] dark:hover:bg-[#F6BA18] hover:text-[#212529] dark:hover:text-[#212529] disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Creating..." : "Create Module"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateModuleModal;
