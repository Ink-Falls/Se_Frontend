import React from "react";

const DeleteModal = ({ title, onClose, onConfirm, message, isLoading }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full transition-colors">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {title || "Confirm Deletion"}
        </h3>
        <p aria-label="validation" className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          {message || "Are you sure you want to delete the selected item/s? This action cannot be undone."}
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent event propagation
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent event propagation
              onConfirm();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors flex items-center disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;