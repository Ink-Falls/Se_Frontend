import React, { useState } from "react";
import { X } from "lucide-react";

const RejectEnrolleeModal = ({ onClose, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState("");

  const reasons = [
    "Unverifiable information",
    "Duplicate Application",
    "Does Not Meet Eligibility Criteria",
    "Late Submission",
    "Capacity Reached",
    "Applicant Withdrawal Application",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Reject Enrollment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Choose reason/s
          </label>
          {reasons.map((reason) => (
            <div key={reason} className="flex items-center">
              <input
                type="checkbox"
                id={reason}
                value={reason}
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
                className="mr-2"
              />
              <label htmlFor={reason} className="text-sm text-gray-700">
                {reason}
              </label>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedReason)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectEnrolleeModal;
