import React from "react";

const EnrolleeStats = ({
  totalEnrollees = 0,
  approvedEnrollees = 0,
  pendingEnrollees = 0,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Enrollees */}
      <div className="flex items-center bg-white p-4 rounded-lg border">
        <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mr-4">
          <i className="fas fa-users text-green-600"></i>
        </div>
        <div>
          <h2 className="text-md font-regular text-[#334155]">
            Total Enrollees
          </h2>
          <p className="text-2xl font-semibold text-[#334155]">
            {totalEnrollees}
          </p>
        </div>
      </div>

      {/* Approved Enrollees */}
      <div className="flex items-center bg-white p-4 rounded-lg border">
        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mr-4">
          <i className="fas fa-check-circle text-blue-600"></i>
        </div>
        <div>
          <h2 className="text-md font-regular text-[#334155]">
            Approved Enrollees
          </h2>
          <p className="text-2xl font-semibold text-[#334155]">
            {approvedEnrollees}
          </p>
        </div>
      </div>

      {/* Pending Enrollees */}
      <div className="flex items-center bg-white p-4 rounded-lg border">
        <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center mr-4">
          <i className="fas fa-clock text-yellow-600"></i>
        </div>
        <div>
          <h2 className="text-md font-regular text-[#334155]">
            Pending Enrollees
          </h2>
          <p className="text-2xl font-semibold text-[#334155]">
            {pendingEnrollees}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnrolleeStats;
