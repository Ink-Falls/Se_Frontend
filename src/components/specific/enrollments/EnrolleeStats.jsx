// src/components/Enrollment/EnrolleeStats.jsx
import React from "react";
import { Users } from "lucide-react";

/**
 * EnrolleeStats component to display enrollment statistics.
 *
 * @component
 * @param {object} props - The component's props.
 * @param {number} props.totalEnrollees - The total number of enrollees.
 * @param {number} props.approvedEnrollees - The number of approved enrollees.
 * @param {number} props.pendingEnrollees - The number of pending enrollees.
 * @param {number} props.rejectedEnrollees - The number of rejected enrollees.
 * @returns {JSX.Element} The EnrolleeStats component.
 */
const EnrolleeStats = ({
  totalEnrollees = 0,
  approvedEnrollees = 0,
  pendingEnrollees = 0,
  rejectedEnrollees = 0,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Total Enrollees */}
      <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-green-500" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm lg:text-md text-[#64748b] whitespace-nowrap">Total Enrollees</h2>
            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#475569] truncate">
              {totalEnrollees}
            </p>
          </div>
        </div>
      </div>

      {/* Approved Enrollees */}
      <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-500" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm lg:text-md text-[#64748b] whitespace-nowrap">Approved</h2>
            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#475569] truncate">
              {approvedEnrollees}
            </p>
          </div>
        </div>
      </div>

      {/* Pending Enrollees */}
      <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-full shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-yellow-500" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm lg:text-md text-[#64748b] whitespace-nowrap">Pending</h2>
            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#475569] truncate">
              {pendingEnrollees}
            </p>
          </div>
        </div>
      </div>

      {/* Rejected Enrollees */}
      <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-full shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-red-500" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm lg:text-md text-[#64748b] whitespace-nowrap">Rejected</h2>
            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#475569] truncate">
              {rejectedEnrollees}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrolleeStats;
