import React, { useState } from 'react';
import { X } from 'lucide-react';

const CreateContentModal = ({ moduleId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '', // This will store the URL
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!formData.title.trim()) {
        throw new Error('Resource title is required');
      }

      if (!formData.content.trim()) {
        throw new Error('Resource URL is required');
      }

      // Validate URL format
      try {
        new URL(formData.content);
      } catch {
        throw new Error('Please enter a valid URL');
      }

      // Format data to match API expectations
      const contentData = {
        title: formData.title.trim(),
        content: formData.content.trim() // This will be mapped to 'link' in moduleService
      };

      await onSubmit(contentData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add resource');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Resource Link</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Resource Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter resource title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Resource URL</label>
            <input
              type="url"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter resource URL"
              required
            />
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
              className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContentModal;
