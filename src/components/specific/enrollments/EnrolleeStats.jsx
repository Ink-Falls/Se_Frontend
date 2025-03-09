// src/components/Enrollment/EnrolleeStats.jsx
import React from "react";
import PropTypes from 'prop-types';
import { Users } from 'lucide-react';

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
    <div className="grid grid-cols-4 gap-4 mb-6">
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

      {/* Rejected Enrollees */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-red-100 rounded-full">
            <Users className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h2 className="text-md text-[#64748b]">Rejected</h2>
            <p className="text-xl font-semibold text-[#475569]">{rejectedEnrollees}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrolleeStats;