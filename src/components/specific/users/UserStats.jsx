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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* Total Users */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-green-100 rounded-full">
            <Users className="w-7 h-7 text-green-500" />
          </div>
          <div>
            <h2 className="text-md text-[#64748b]">Total Users</h2>
            <p className="text-xl font-semibold text-[#475569]">{totalUsers}</p>
          </div>
        </div>
      </div>

      {/* Learners */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <GraduationCap className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <h2 className="text-md text-[#64748b]">Learners</h2>
            <p className="text-xl font-semibold text-[#475569]">
              {totalLearners}
            </p>
          </div>
        </div>
      </div>

      {/* Teachers */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-yellow-100 rounded-full">
            <School className="w-7 h-7 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-md text-[#64748b]">Teachers</h2>
            <p className="text-xl font-semibold text-[#475569]">
              {totalTeachers}
            </p>
          </div>
        </div>
      </div>

      {/* Student Teachers */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-orange-100 rounded-full">
            <UserCog className="w-7 h-7 text-orange-500" />
          </div>
          <div>
            <h2 className="text-md text-[#64748b]">Student Teachers</h2>
            <p className="text-xl font-semibold text-[#475569]">
              {totalStudentTeachers}
            </p>
          </div>
        </div>
      </div>

      {/* Admins */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-purple-100 rounded-full">
            <ShieldCheck className="w-7 h-7 text-purple-500" />
          </div>
          <div>
            <h2 className="text-md text-[#64748b]">Admins</h2>
            <p className="text-xl font-semibold text-[#475569]">
              {totalAdmins}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
