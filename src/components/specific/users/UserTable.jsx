import React, { useState, useEffect } from "react";
import {
  SquarePen,
  Plus,
  Search,
  Users,
  FileText,
  Filter,
  Trash2,
  X,
} from "lucide-react";

const UserTable = ({
  users,
  onEdit,
  onDelete,
  onAddUser,
  selectedIds,
  setSelectedIds,
  onCreateGroup,
  onShowGroupList,
  onSearch,
  onSearchCancel,
  onFilterChange,
  currentFilter,
  currentPage,
  totalPages,
  onPageChange,
  onGenerateReport,
  sortConfig,
  onSort,
  totalItems,
  searchQuery,
}) => {
  const ROWS_PER_PAGE = 10;

  const [pageInput, setPageInput] = useState(currentPage.toString());

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
      setPageInput(newPage.toString());
    }
  };

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e) => {
    if (e.key === "Enter") {
      const newPage = parseInt(pageInput);
      if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
        onPageChange(newPage);
      } else {
        setPageInput(currentPage.toString());
      }
    }
  };

  const handlePageInputBlur = () => {
    setPageInput(currentPage.toString());
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const usersList = Array.isArray(users) ? users : [];

  const handleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === usersList.length
        ? []
        : usersList.map((user) => user.id)
    );
  };

  const handleSearchChange = (e) => {
    e.preventDefault();
    const query = e.target.value;
    onSearch(query);
  };

  const getSchoolAbbreviation = (schoolName) => {
    const abbreviations = {
      1001: "ACES",
      1002: "UST",
    };
    return abbreviations[schoolName] || schoolName;
  };

  const getFormattedRole = (role) => {
    const roleMap = {
      student_teacher: "Student Teacher",
      admin: "Admin",
      teacher: "Teacher",
      learner: "Learner",
    };
    return roleMap[role] || role;
  };

  const handleRowClick = (user) => {
    if (user.role !== "admin") {
      onEdit(user);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        {selectedIds.length > 0 && (
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-900 flex items-center gap-2"
          >
            <Trash2 size={20} />
            <span>Delete Selected ({selectedIds.length})</span>
          </button>
        )}

        <div className="flex flex-col w-full md:flex-row gap-4">
          <div className="flex flex-col md:flex-row w-full md:w-auto gap-4 md:items-center">
            <div className="relative py-2 md:py-[0.2vw]">
              <select
                value={currentFilter}
                onChange={(e) => onFilterChange(e.target.value)}
                className="pl-10 md:pl-[2vw] pr-4 md:pr-[1vw] py-2 md:py-[0.5vw] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6BA18] appearance-none w-full md:w-[12vw]"
              >
                <option value="all">Filter By: All</option>
                <option value="learner">Filter By: Learner</option>
                <option value="teacher">Filter By: Teacher</option>
                <option value="student_teacher">
                  Filter By: Student Teacher
                </option>
                <option value="admin">Filter By: Admin</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 md:pl-[0.5vw] flex items-center pointer-events-none">
                <Filter
                  size={16}
                  className="text-gray-400 md:w-[1vw] md:h-[1vw]"
                />
              </div>
            </div>

            <div className="relative py-2 md:py-[0.2vw]">
              <select
                value={`${sortConfig.key || "none"}-${sortConfig.direction}`}
                onChange={(e) => {
                  const [key, direction] = e.target.value.split("-");
                  onSort(key === "none" ? null : key, direction);
                }}
                className="pl-10 md:pl-[2vw] pr-4 md:pr-[1vw] py-2 md:py-[0.5vw] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6BA18] appearance-none w-full md:w-[12vw]"
              >
                <option value="none-asc">Sort By</option>
                <option value="id-asc">ID (Ascending)</option>
                <option value="id-desc">ID (Descending)</option>
                <option value="fullName-asc">Name (A-Z)</option>
                <option value="fullName-desc">Name (Z-A)</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 md:pl-[0.5vw] flex items-center pointer-events-none">
                <Filter
                  size={16}
                  className="text-gray-400 md:w-[1vw] md:h-[1vw]"
                />
              </div>
            </div>

            <div className="relative w-full md:w-auto py-2 md:py-[0.2vw]">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full md:w-[15vw] pl-10 md:pl-[2vw] pr-4 md:pr-[1vw] py-2 md:py-[0.5vw] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6BA18]"
              />
              <Search className="absolute left-3 md:left-[0.5vw] top-1/2 -translate-y-1/2 text-[#475569] w-5 h-5 md:w-[1vw] md:h-[1vw]" />
              {searchQuery && (
                <button
                  onClick={onSearchCancel}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row w-full md:w-auto gap-2 md:ml-auto">
            <button
              onClick={onAddUser}
              className="flex items-center gap-2 md:gap-[0.3vw] p-2 md:p-[0.4vw] bg-[#212529] md:bg-transparent text-white md:text-[#475569] rounded-lg md:rounded-full text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black w-full md:w-auto justify-center"
            >
              <Plus size={20} className="w-[10] h-[10]" />
              <span className="md:hidden">Add User</span>
            </button>

            <button
              onClick={onCreateGroup}
              className="flex items-center gap-2 md:gap-[0.3vw] px-4 md:px-[0.8vw] py-2 md:py-[0.4vw] bg-[#212529] text-white rounded-lg text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black w-full md:w-auto justify-center"
            >
              <Users size={16} className="md:w-[1vw] md:h-[1vw]" />
              <span>Create Group</span>
            </button>

            <button
              onClick={onShowGroupList}
              className="flex items-center gap-2 md:gap-[0.3vw] px-4 md:px-[0.8vw] py-2 md:py-[0.4vw] bg-[#212529] text-white rounded-lg text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black w-full md:w-auto justify-center"
            >
              <Users size={16} className="md:w-[1vw] md:h-[1vw]" />
              <span>Group List</span>
            </button>

            <button
              data-testid="generate-report-button"
              onClick={onGenerateReport}
              className="flex items-center gap-2 md:gap-[0.3vw] px-4 md:px-[0.8vw] py-2 md:py-[0.4vw] bg-[#212529] text-white rounded-lg text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black w-full md:w-auto justify-center"
            >
              <FileText size={16} className="md:w-[1vw] md:h-[1vw]" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedIds.length === users.length}
                  onChange={handleSelectAll}
                  className="form-checkbox h-4 w-4 text-[#212529] rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                First Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Middle Initial
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Birth Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Users size={24} className="text-gray-400 mb-2" />
                    <div className="text-gray-500 text-sm">
                      {searchQuery
                        ? `No users found matching "${searchQuery}"`
                        : "No users found matching the selected criteria"}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => handleRowClick(user)}
                  className={`hover:bg-gray-50 transition-colors ${
                    user.role !== "admin" ? "cursor-pointer" : ""
                  }`}
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => handleCheckboxChange(user.id)}
                      className="form-checkbox h-4 w-4 text-[#212529] rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.first_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.middle_initial}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.birth_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.contact_no}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getSchoolAbbreviation(user.school_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getFormattedRole(user.role)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="px-6 py-4 flex items-center justify-between border-t">
          <div className="text-sm text-gray-700">
            {users.length === 0
              ? "No users to display"
              : `Showing ${(currentPage - 1) * 10 + 1} to ${Math.min(
                  currentPage * 10,
                  totalItems
                )} of ${totalItems} users`}
          </div>
          <div className="flex space-x-2 items-center">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || users.length === 0}
              className="px-3 py-1 rounded border bg-white text-gray-600 
                       hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-1 text-gray-600">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || users.length === 0}
              className="px-3 py-1 rounded border bg-white text-gray-600 
                       hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
