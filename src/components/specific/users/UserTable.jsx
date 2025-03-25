import React, { useState } from "react";
import {
  SquarePen,
  Plus,
  Search,
  Users,
  FileText,
  Filter,
  Trash2,
} from "lucide-react";

const UserTable = ({
  users,
  onEdit,
  onDelete,
  onAddUser,
  selectedIds,
  setSelectedIds,
  onCreateGroup,
  onShowGroupList, // Add new prop
  onSearch, // Add onSearch prop
  onFilterChange, // Add this prop
  currentFilter, // Add this prop
  currentPage, // Add this prop
  totalPages, // Add this prop
  onPageChange, // Add this prop
  onGenerateReport, // Add this prop
}) => {
  // Remove local selectedIds state since it's now passed as prop

  const ROWS_PER_PAGE = 10;

  const [sortOption, setSortOption] = useState("none"); // Add this state

  // Add sorting function
  const getSortedUsers = (users) => {
    const sortedUsers = [...users];
    switch (sortOption) {
      case "name-asc":
        return sortedUsers.sort((a, b) =>
          `${a.first_name} ${a.last_name}`.localeCompare(
            `${b.first_name} ${b.last_name}`
          )
        );
      case "name-desc":
        return sortedUsers.sort((a, b) =>
          `${b.first_name} ${b.last_name}`.localeCompare(
            `${a.first_name} ${a.last_name}`
          )
        );
      case "id-asc":
        return sortedUsers.sort((a, b) => a.school_id - b.school_id);
      case "id-desc":
        return sortedUsers.sort((a, b) => b.school_id - a.school_id);
      default:
        return sortedUsers;
    }
  };

  // Update pagination logic to use total count from API
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage); // Call parent handler to fetch new page data
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Ensure users is always an array
  const usersList = Array.isArray(users) ? users : [];

  // Update handleSelectAll to use usersList
  const handleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === usersList.length
        ? []
        : usersList.map((user) => user.id)
    );
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    onSearch(query); // Call the search handler from parent
  };

  return (
    <div>
      {/* Controls Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        {/* Delete Selected button */}
        {selectedIds.length > 0 && (
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-900 flex items-center gap-2"
          >
            <Trash2 size={20} />
            <span>Delete Selected ({selectedIds.length})</span>
          </button>
        )}

        {/* Controls that stack on mobile */}
        <div className="flex flex-col w-full md:flex-row gap-4">
          {/* Left side controls */}
          <div className="flex flex-col md:flex-row w-full md:w-auto gap-4 md:items-center">
            {/* Filter dropdown */}
            <div className="relative md:py-[2px]">
              <select
                value={currentFilter}
                onChange={(e) => onFilterChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6BA18] appearance-none w-full md:w-auto"
              >
                <option value="all">Filter By: All</option>
                <option value="learner">Filter By: Learner</option>
                <option value="teacher">Filter By: Teacher</option>
                <option value="student_teacher">Filter By: Student Teacher</option>
                <option value="admin">Filter By: Admin</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={16} className="text-gray-400" />
              </div>
            </div>

            {/* Sort dropdown */}
            <div className="relative md:py-[2px]">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6BA18] appearance-none w-full md:w-auto"
              >
                <option value="none">Sort By</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="id-asc">ID Number (Ascending)</option>
                <option value="id-desc">ID Number (Descending)</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={16} className="text-gray-400" />
              </div>
            </div>

            {/* Search input */}
            <div className="relative w-full md:w-auto md:py-[2px]">
              <input
                type="text"
                placeholder="Search users..."
                onChange={handleSearchChange}
                className="w-full md:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6BA18]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" size={20} />
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex flex-col md:flex-row w-full md:w-auto gap-4 md:ml-auto">
            <button 
              onClick={onAddUser} 
              className="flex items-center gap-2 md:p-2 md:bg-transparent px-4 py-2 bg-[#212529] text-white md:text-[#475569] rounded-lg md:rounded-full text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black w-full md:w-auto justify-center"
            >
              <Plus size={20} />
              <span className="md:hidden">Add User</span>
            </button>

            <button
              onClick={onCreateGroup}
              className="flex items-center gap-2 px-4 py-2 bg-[#212529] text-white rounded-lg text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black w-full md:w-auto justify-center"
            >
              <Users size={16} />
              <span>Create Group</span>
            </button>

            <button
              onClick={onShowGroupList}
              className="flex items-center gap-2 px-4 py-2 bg-[#212529] text-white rounded-lg text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black w-full md:w-auto justify-center"
            >
              <Users size={16} />
              <span>Group List</span>
            </button>

            <button
              onClick={onGenerateReport}
              className="flex items-center gap-2 px-4 py-2 bg-[#212529] text-white rounded-lg text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black w-full md:w-auto justify-center"
            >
              <FileText size={16} />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
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
                #
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
                School ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getSortedUsers(users).map((user, index) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(user.id)}
                    onChange={() => handleCheckboxChange(user.id)}
                    className="form-checkbox h-4 w-4 text-[#212529] rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {index + 1}
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
                  {user.school_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    aria-label="Edit"
                    onClick={() => onEdit(user)}
                    className="text-black hover:text-gray-700" // Changed color to black
                  >
                    <SquarePen size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add Pagination Controls */}
        <div className="px-6 py-4 flex items-center justify-between border-t">
          <div className="text-sm text-gray-700">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border bg-white text-gray-600 
                       hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-1 text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
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
