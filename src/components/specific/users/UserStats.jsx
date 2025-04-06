import React from "react";
import {
  Users,
  GraduationCap,
  UserCog,
  School,
  ShieldCheck,
} from "lucide-react";

const UserStats = ({
  totalUsers,
  totalLearners,
  totalTeachers,
  totalStudentTeachers,
  totalAdmins,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 2xl:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {/* Total Users */}
      <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-green-500" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm lg:text-md text-[#64748b] whitespace-nowrap">
              Total Users
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#475569] truncate">
              {totalUsers || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Learners */}
      <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full shrink-0">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-500" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm lg:text-md text-[#64748b] whitespace-nowrap">
              Learners
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#475569] truncate">
              {totalLearners || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Teachers */}
      <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-full shrink-0">
            <School className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-yellow-500" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm lg:text-md text-[#64748b] whitespace-nowrap">
              Teachers
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#475569] truncate">
              {totalTeachers || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Student Teachers */}
      <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-full shrink-0">
            <UserCog className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-orange-500" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm lg:text-md text-[#64748b] whitespace-nowrap">
              Student Teachers
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#475569] truncate">
              {totalStudentTeachers || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Admins */}
      <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-full shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-purple-500" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm lg:text-md text-[#64748b] whitespace-nowrap">
              Admins
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#475569] truncate">
              {totalAdmins || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
