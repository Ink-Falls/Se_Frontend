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
 * @returns {JSX.Element} The EnrolleeStats component.
 */
const EnrolleeStats = ({
  totalEnrollees = 0,
  approvedEnrollees = 0,
  pendingEnrollees = 0,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-6">
      {/* Total Enrollees */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-green-100 rounded-full">
            <Users className="w-7 h-7 text-green-500" />
          </div>
          <div>
            <h2 className="text-md text-[#64748b]">Total Enrollees</h2>
            <p className="text-xl font-semibold text-[#475569]">{totalEnrollees}</p>
          </div>
        </div>
      </div>

      {/* Approved Enrollees */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <Users className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <h2 className="text-md text-[#64748b]">Approved Enrollees</h2>
            <p className="text-xl font-semibold text-[#475569]">{approvedEnrollees}</p>
          </div>
        </div>
      </div>

      {/* Pending Enrollees */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-yellow-100 rounded-full">
            <Users className="w-7 h-7 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-md text-[#64748b]">Pending Enrollees</h2>
            <p className="text-xl font-semibold text-[#475569]">{pendingEnrollees}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrolleeStats;