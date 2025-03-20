import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { createModule, addModuleContent } from '../../../../services/moduleService';

const CreateModuleModal = ({ onClose, onSubmit, courseId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resources: []
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

  const addResource = () => {
    setFormData(prev => ({
      ...prev,
      resources: [...prev.resources, { title: '', link: '' }]
    }));
  };

  const updateResource = (index, field, value) => {
    setFormData(prev => {
      const updatedResources = [...prev.resources];
      updatedResources[index] = {
        ...updatedResources[index],
        [field]: value
      };
      return { ...prev, resources: updatedResources };
    });
  };

  const removeResource = (index) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!formData.title.trim()) {
        throw new Error('Module title is required');
      }

      // Create the module first
      const moduleData = {
        name: formData.title.trim(),
        description: formData.description.trim()
      };

      const newModule = await createModule(courseId, moduleData);

      // If there are resources, add them after module creation
      if (formData.resources.length > 0) {
        const validResources = formData.resources.filter(r => r.title && r.link);
        
        // Add resources one by one
        await Promise.all(validResources.map(resource => 
          addModuleContent(newModule.id, {
            title: resource.title,
            type: 'link',
            content: resource.link
          })
        ));
      }

      // Call the parent's onSubmit with the complete module data
      if (onSubmit) {
        await onSubmit({
          ...newModule,
          resources: formData.resources
        });
      }

      onClose();
    } catch (err) {
      console.error('Error creating module:', err);
      setError(err.message || 'Failed to create module');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Module</h2>
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
            <label className="block text-sm font-medium text-gray-700">Module Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter module title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter module description"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Learning Resources</label>
              <button
                type="button"
                onClick={addResource}
                className="text-[#212529] hover:text-[#F6BA18] flex items-center gap-1"
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
                    onChange={(e) => updateResource(index, 'title', e.target.value)}
                    placeholder="Resource title"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                  />
                  <input
                    type="url"
                    value={resource.link}
                    onChange={(e) => updateResource(index, 'link', e.target.value)}
                    placeholder="Resource link"
                    className="flex-2 rounded-md border border-gray-300 px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeResource(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
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
              className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateModuleModal;
