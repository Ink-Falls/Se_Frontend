import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getEnrollmentById } from "/src/services/enrollmentService.js";

const EnrolleeDetailsModal = ({ enrolleeId, onClose, onReject, onApprove }) => {
  const [enrollee, setEnrollee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvalError, setApprovalError] = useState(null);

  useEffect(() => {
    const fetchEnrolleeData = async () => {
      try {
        if (!enrolleeId) {
          throw new Error("No enrollment ID provided");
        }

        setLoading(true);
        setError(null);

        const data = await getEnrollmentById(enrolleeId);
        if (!data) {
          throw new Error("No enrollment data found");
        }

        setEnrollee(data);
      } catch (err) {
        console.error("Error fetching enrollee data:", err);
        setError(err.message || "Failed to load enrollee details");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolleeData();
  }, [enrolleeId]);

  const handleApprove = async () => {
    try {
      setApprovalError(null); // Clear any previous error

      if (!enrollee.year_level) {
        setApprovalError("Cannot approve: Year level is missing");
        return;
      }

      const result = await onApprove(enrolleeId);
      if (result?.message === "Enrollment approved successfully") {
        onClose();
      }
    } catch (error) {
      console.error("Error in approval process:", error);
      setApprovalError(error.message || "Failed to complete approval process");
      // Keep modal open so user can see error
    }
  };

  const handleReject = async () => {
    try {
      setApprovalError(null);
      await onReject(enrolleeId);
      // Don't check response message, just close if no error was thrown
      onClose(true);
    } catch (error) {
      console.error("Error rejecting enrollment:", error);
      setApprovalError("An error occurred while rejecting the enrollment");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <p className="text-gray-700">Loading enrollment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <h3 className="text-red-600 font-semibold mb-2">Error</h3>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!enrollee) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getSchoolInfo = (schoolId) => {
    const schools = {
      1001: {
        name: "University of Santo Tomas (UST)",
        contact: "(02) 3406 1611",
        address: "España Blvd, Sampaloc, Manila",
      },
      1002: {
        name: "Asuncion Consunji Elementary School (ACES)",
        contact: "not assigned yet",
        address: "Brgy. Imelda, Samal, Bataan",
      },
    };
    return schools[schoolId] || { name: "N/A", contact: "N/A", address: "N/A" };
  };

  const schoolInfo = getSchoolInfo(enrollee.school_id);

  const renderActionButtons = () => {
    if (enrollee.status.toLowerCase() === "pending") {
      return (
        <>
          <button
            onClick={handleReject}
            className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-red-500 transition-colors"
          >
            Reject
          </button>
          <button
            onClick={handleApprove}
            className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] transition-colors"
          >
            Approve
          </button>
        </>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-lg max-h-[90vh] overflow-y-auto z-[10000]">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Enrollee Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Enrollee Details */}
        <div className="border rounded-lg p-8 bg-gray-50">
          <div className="grid grid-cols-3 gap-6">
            {/* Personal Information Section */}
            <div className="col-span-3">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    First Name
                  </p>
                  <p className="text-lg text-gray-900">{enrollee.first_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Name</p>
                  <p className="text-lg text-gray-900">{enrollee.last_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Middle Initial
                  </p>
                  <p className="text-lg text-gray-900">
                    {enrollee.middle_initial || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-lg text-gray-900">{enrollee.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Contact No.
                  </p>
                  <p className="text-lg text-gray-900">{enrollee.contact_no}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Birthdate</p>
                  <p className="text-lg text-gray-900">
                    {new Date(enrollee.birth_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Year Level
                  </p>
                  <p className="text-lg text-gray-900">{enrollee.year_level}</p>
                </div>
              </div>
            </div>

            {/* School Information Section */}
            <div className="col-span-3">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 mt-6">
                School Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    School Name
                  </p>
                  <p className="text-lg text-gray-900">{schoolInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    School Contact
                  </p>
                  <p className="text-lg text-gray-900">{schoolInfo.contact}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-600">
                    School Address
                  </p>
                  <p className="text-lg text-gray-900">{schoolInfo.address}</p>
                </div>
              </div>
            </div>

            {/* Enrollment Status */}
            <div className="col-span-3">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 mt-6">
                Enrollment Status
              </h3>
              <div className="bg-white p-4 rounded-md border">
                <p className="text-sm font-medium text-gray-600">
                  Current Status
                </p>
                <p
                  className={`text-lg font-medium ${getStatusColor(
                    enrollee.status
                  )}`}
                >
                  {enrollee.status.charAt(0).toUpperCase() +
                    enrollee.status.slice(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add error message display */}
        {approvalError && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg">
            {approvalError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-4 border-t pt-4">
          <button
            onClick={() => onClose(false)} // Pass false to indicate no action taken
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {renderActionButtons()}
        </div>
      </div>
    </div>
  );
};

export default EnrolleeDetailsModal;
