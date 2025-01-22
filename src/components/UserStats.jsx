// UserStats.js
import React from "react";

const UserStats = ({
  totalUsers = 0,
  totalLearners = 0,
  totalTeachers = 0,
  totalAdmins = 0,
  totalGroups = 0,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {/* Users */}
      <div className="flex items-center bg-white p-4 rounded-lg borde">
        <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mr-4">
          <i className="fas fa-user text-green-600"></i>
        </div>
        <div>
          <h2 className="text-md font-regular text-[#334155]">Users</h2>
          <p className="text-2xl font-semibold text-[#334155]">{totalUsers}</p>
        </div>
      </div>

      {/* Learners */}
      <div className="flex items-center bg-white p-4 rounded-lg borde">
        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mr-4">
          <i className="fas fa-user-graduate text-blue-600"></i>
        </div>
        <div>
          <h2 className="text-md font-regular text-[#334155]">Learners</h2>
          <p className="text-2xl font-semibold text-[#334155]">
            {totalLearners}
          </p>
        </div>
      </div>

      {/* Teachers */}
      <div className="flex items-center bg-white p-4 rounded-lg borde">
        <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center mr-4">
          <i className="fas fa-chalkboard-teacher text-yellow-600"></i>
        </div>
        <div>
          <h2 className="text-md font-regular text-[#334155]">Teachers</h2>
          <p className="text-2xl font-semibold text-[#334155]">
            {totalTeachers}
          </p>
        </div>
      </div>

      {/* Admin */}
      <div className="flex items-center bg-white p-4 rounded-lg borde">
        <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center mr-4">
          <i className="fas fa-user-shield text-red-600"></i>
        </div>
        <div>
          <h2 className="text-md font-regular text-[#334155]">Admin</h2>
          <p className="text-2xl font-semibold text-[#334155]">{totalAdmins}</p>
        </div>
      </div>

      {/* Groups */}
      <div className="flex items-center bg-white p-4 rounded-lg borde">
        <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mr-4">
          <i className="fas fa-users text-purple-600"></i>
        </div>
        <div>
          <h2 className="text-md font-regular text-[#334155]">Groups</h2>
          <p className="text-2xl font-semibold text-[#334155]">{totalGroups}</p>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
