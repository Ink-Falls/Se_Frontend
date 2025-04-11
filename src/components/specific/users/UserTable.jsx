import React, { useState, useEffect, useRef } from "react";
import {
  SquarePen,
  Plus,
  Search,
  Users,
  FileText,
  Filter,
  Trash2,
  X,
  RotateCcw,
} from "lucide-react";
import RestoreUserModal from "../../common/Modals/Restore/RestoreUserModal";
import { useTheme } from "../../../contexts/ThemeContext";

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
  totalUsers,
  searchQuery,
}) => {
  const ROWS_PER_PAGE = 10;
  const { isDarkMode } = useTheme();

  const [pageInput, setPageInput] = useState(currentPage.toString());
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [hoveredUserId, setHoveredUserId] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tableRef = useRef(null);

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
      1001: "UST",
      1002: "ACES",
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

  const handleRestoreSuccess = (message) => {
    alert(message || "User restored successfully");
    setIsRestoreModalOpen(false);
    window.location.reload();
  };

  const handleRowMouseEnter = (e, user) => {
    if (user.role !== "admin") {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 8
      });
      setHoveredUserId(user.id);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        {selectedIds.length > 0 && (
          <button
            onClick={onDelete}
            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 flex items-center gap-2"
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
                className="pl-10 md:pl-[2vw] pr-4 md:pr-[1vw] py-2 md:py-[0.5vw] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6BA18] appearance-none w-full md:w-[12vw] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
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
                className="pl-10 md:pl-[2vw] pr-4 md:pr-[1vw] py-2 md:py-[0.5vw] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6BA18] appearance-none w-full md:w-[12vw] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
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
                className="w-full md:w-[15vw] pl-10 md:pl-[2vw] pr-4 md:pr-[1vw] py-2 md:py-[0.5vw] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6BA18] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              />
              <Search className="absolute left-3 md:left-[0.5vw] top-1/2 -translate-y-1/2 text-[#475569] dark:text-gray-400 w-5 h-5 md:w-[1vw] md:h-[1vw]" />
              {searchQuery && (
                <button
                  onClick={onSearchCancel}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row w-full md:w-auto gap-2 md:ml-auto">
            <button
              onClick={() => setIsRestoreModalOpen(true)}
              className="flex items-center gap-2 md:gap-[0.3vw] p-2 md:p-[0.4vw] bg-[#212529] md:bg-transparent text-white md:text-[#475569] dark:md:text-gray-300 rounded-lg md:rounded-full text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black w-full md:w-auto justify-center"
              title="Restore deleted user"
            >
              <RotateCcw size={20} className="w-[10] h-[10]" />
              <span className="md:hidden">Restore User</span>
            </button>

            <button
              onClick={onAddUser}
              className="flex items-center gap-2 md:gap-[0.3vw] p-2 md:p-[0.4vw] bg-[#212529] md:bg-transparent text-white md:text-[#475569] dark:md:text-gray-300 rounded-lg md:rounded-full text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black w-full md:w-auto justify-center"
            >
              <Plus size={20} className="w-[10] h-[10]" />
              <span className="md:hidden">Add User</span>
            </button>

            <button
              onClick={onCreateGroup}
              className="flex items-center gap-2 md:gap-[0.3vw] px-4 md:px-[0.8vw] py-2 md:py-[0.4vw] bg-[#212529] text-white rounded-lg text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black w-full md:w-auto justify-center dark:bg-gray-700"
            >
              <Users size={16} className="md:w-[1vw] md:h-[1vw]" />
              <span>Create Group</span>
            </button>

            <button
              onClick={onShowGroupList}
              className="flex items-center gap-2 md:gap-[0.3vw] px-4 md:px-[0.8vw] py-2 md:py-[0.4vw] bg-[#212529] text-white rounded-lg text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black w-full md:w-auto justify-center dark:bg-gray-700"
            >
              <Users size={16} className="md:w-[1vw] md:h-[1vw]" />
              <span>Group List</span>
            </button>

            <button
              data-testid="generate-report-button"
              onClick={onGenerateReport}
              className="flex items-center gap-2 md:gap-[0.3vw] px-4 md:px-[0.8vw] py-2 md:py-[0.4vw] bg-[#212529] text-white rounded-lg text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black w-full md:w-auto justify-center dark:bg-gray-700"
            >
              <FileText size={16} className="md:w-[1vw] md:h-[1vw]" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900" ref={tableRef}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedIds.length === users.length}
                  onChange={handleSelectAll}
                  className="form-checkbox h-4 w-4 text-[#212529] dark:text-gray-400 rounded"
                  disabled={users.length === 0}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                First Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Middle Initial
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Last Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Birth Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Contact No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Users size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      No Users Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md">
                      {searchQuery
                        ? `We couldn't find any users matching "${searchQuery}"`
                        : "No users available for the selected criteria"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => handleRowClick(user)}
                  onMouseEnter={(e) => handleRowMouseEnter(e, user)}
                  onMouseLeave={() => setHoveredUserId(null)}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
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
                      className="form-checkbox h-4 w-4 text-[#212529] dark:text-blue-500 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {user.first_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {user.middle_initial}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {user.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {new Date(user.birth_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {user.contact_no}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {getSchoolAbbreviation(user.school_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {getFormattedRole(user.role)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="px-6 py-4 border-t dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
              Showing {users.length} of {totalUsers} users
            </p>

            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || users.length === 0}
                className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
              >
                Previous
              </button>

              <div className="flex items-center gap-1 px-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentPage}
                </span>
                <span className="text-gray-500 dark:text-gray-400">/</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{totalPages || 1}</span>
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || users.length === 0}
                className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip portal rendered outside of the table to avoid affecting layout */}
      {hoveredUserId !== null && users.find(u => u.id === hoveredUserId)?.role !== "admin" && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="bg-gray-800 dark:bg-gray-200 px-3 py-1.5 rounded-md text-xs text-white dark:text-gray-900">
            Click to edit user details
            <div className="absolute h-2 w-2 bg-gray-800 dark:bg-gray-200 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
          </div>
        </div>
      )}

      {isRestoreModalOpen && (
        <RestoreUserModal
          isOpen={isRestoreModalOpen}
          onClose={() => setIsRestoreModalOpen(false)}
          onSuccess={handleRestoreSuccess}
        />
      )}
    </div>
  );
};

export default UserTable;
