import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const EditModuleModal = ({ module, onClose, onSave }) => {
  const [moduleTitle, setModuleTitle] = useState(module.title || "");
  const [moduleDescription, setModuleDescription] = useState(
    module.description || ""
  );
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 50); // Delayed animation start
  }, []);

  // Save module data
  const handleSave = () => {
    onSave({
      ...module,
      title: moduleTitle,
      description: moduleDescription,
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
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Edit Module
        </h2>

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

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-yellow-500 text-white px-5 py-2 rounded-lg hover:bg-yellow-600 transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModuleModal;
