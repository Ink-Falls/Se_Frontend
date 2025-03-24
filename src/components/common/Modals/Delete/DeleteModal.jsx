import React from "react";

const DeleteModal = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h3 className="text-lg font-semibold text-gray-800">
          Confirm Deletion
        </h3>
        <p aria-label="validation" className="text-sm text-gray-600 mt-2">
          Are you sure you want to delete the selected item/s? This action
          cannot be undone.
        </p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent event propagation
              onClose();
            }}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent event propagation
              onConfirm();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
