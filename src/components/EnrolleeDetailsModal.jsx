import React from "react";
import { X } from "lucide-react";

const EnrolleeDetailsModal = ({ enrollee, onClose, onReject, onApprove }) => {
  if (!enrollee) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Enrollee Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Enrollee Details */}
        <div className="border rounded-lg p-6">
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600">First name</p>
              <p className="text-md text-gray-900">{enrollee.firstName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Contact No.</p>
              <p className="text-md text-gray-900">{enrollee.contactNo}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Last name</p>
              <p className="text-md text-gray-900">{enrollee.lastName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Birthdate</p>
              <p className="text-md text-gray-900">{enrollee.birthdate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-md text-gray-900">{enrollee.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Year Level</p>
              <p className="text-md text-gray-900">{enrollee.yearLevel}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Role</p>
              <p className="text-md text-gray-900">{enrollee.role}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">School</p>
              <p className="text-md text-gray-900">{enrollee.school}</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onReject}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Reject
          </button>
          <button
            onClick={onApprove}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrolleeDetailsModal;
