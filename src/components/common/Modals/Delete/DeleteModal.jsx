import React from "react";
import { useTheme } from "../../../../contexts/ThemeContext";

const DeleteModal = ({ onClose, onConfirm, message }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-80 transition-colors">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Confirm Deletion
        </h3>
        <p aria-label="validation" className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          {message || "Are you sure you want to delete the selected item/s? This action cannot be undone."}
        </p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent event propagation
              onClose();
            }}
            className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent event propagation
              onConfirm();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
