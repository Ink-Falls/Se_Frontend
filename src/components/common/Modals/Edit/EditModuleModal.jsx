import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";

const EditModuleModal = ({ module, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [moduleTitle, setModuleTitle] = useState(module.title || "");
  const [moduleDescription, setModuleDescription] = useState(
    module.description || ""
  );
  const [resources, setResources] = useState(module.resources || []);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 50); // Delayed animation start
  }, []);

  // Add new resource
  const addResource = () => {
    setResources([...resources, { title: "", link: "" }]);
  };

  // Update resource
  const updateResource = (index, key, value) => {
    const updatedResources = [...resources];
    updatedResources[index][key] = value;
    setResources(updatedResources);
  };

  // Remove resource
  const removeResource = (index) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  // Save module data
  const handleSave = () => {
    onSave({
      ...module,
      title: moduleTitle,
      description: moduleDescription,
      resources: resources.filter((res) => res.title && res.link),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div
        className={`bg-white rounded-2xl shadow-lg w-[700px] p-8 relative ${
          animate ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Edit Module
        </h2>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`py-2 px-4 font-medium transition-colors ${
              activeTab === "details"
                ? "border-b-2 border-yellow-500 text-yellow-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("details")}
          >
            Module Details
          </button>
          <button
            className={`py-2 px-4 font-medium transition-colors ${
              activeTab === "resources"
                ? "border-b-2 border-yellow-500 text-yellow-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("resources")}
          >
            Learning Resources
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "details" && (
          <div className="mt-6">
            <label className="text-gray-700 font-medium">Module Title</label>
            <input
              type="text"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              className="w-full px-3 mt-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              placeholder="Enter module title"
            />

            <label className="text-gray-700 font-medium mt-4 block">
              Module Description
            </label>
            <textarea
              value={moduleDescription}
              onChange={(e) => setModuleDescription(e.target.value)}
              className="w-full px-3 mt-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              rows="3"
              placeholder="Enter module description"
            />
          </div>
        )}

        {activeTab === "resources" && (
          <div className="mt-6 space-y-3">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity"
              >
                <input
                  type="text"
                  value={resource.title}
                  onChange={(e) =>
                    updateResource(index, "title", e.target.value)
                  }
                  className="w-1/3 px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Title"
                />
                <input
                  type="text"
                  value={resource.link}
                  onChange={(e) =>
                    updateResource(index, "link", e.target.value)
                  }
                  className="w-2/3 px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Paste link here"
                />
                <button
                  onClick={() => removeResource(index)}
                  className="text-red-500 hover:text-red-700 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            <button
              onClick={addResource}
              className="flex items-center text-yellow-600 mt-5 hover:underline transition-all"
            >
              <Plus size={18} className="mr-1" /> Add new link
            </button>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-yellow-500 text-white px-5 py-2 rounded-lg hover:bg-yellow-600 transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModuleModal;
