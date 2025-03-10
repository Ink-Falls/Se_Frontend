import React, { useState } from 'react';
import { SquarePen, Plus, Search, Users, FileText, Filter, Trash2 } from 'lucide-react';

const UserTable = ({ users, onEdit, onDelete, onAddUser, selectedIds, setSelectedIds, onCreateGroup }) => {
  // Remove local selectedIds state since it's now passed as prop

  const handleCheckboxChange = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(selectedIds.length === users.length ? [] : users.map(user => user.id));
  };

  return (<div>
    {/* Controls Section */}
    <div className="flex flex-wrap items-center gap-4 mb-4">
      {/* Show delete button when items are selected */}
      {selectedIds.length > 0 && (
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-900 flex items-center gap-2"
        >
          <Trash2 size={20} />
          <span>Delete Selected ({selectedIds.length})</span>
        </button>
      )}

      {/* Left-side controls: Filter Button */}
      <button
        onClick={() => console.log("Filter By: All")}
        className="flex text-sm items-center gap-2 ml-2 md:ml-0 mt-2 md:mt-0 text-[#64748b] rounded-lg"
      >
        <Filter size={16} />
        <span>Filter By: All</span>
      </button>

      {/* Right-side buttons: Plus, Search, Create Group, Generate Report */}
      <div className="flex flex-wrap items-center gap-4 ml-auto w-full md:w-auto">
        {/* Plus and Search Buttons */}
        <div className="flex items-center gap-4 ml-2 md:ml-0">
          <button onClick={onAddUser} className="text-white rounded-full">
            <Plus size={22} className="text-[#475569]" />
          </button>
          <button className="flex items-center gap-2 rounded-lg">
            <Search className="text-[#475569]" size={20} />
          </button>
        </div>

        {/* Create Group and Generate Report Buttons */}
        <div className="flex flex-wrap gap-4 ml-2 md:ml-0 ">
          <button
            onClick={onCreateGroup}
            className="flex items-center gap-2 px-4 py-2 bg-[#212529] text-white rounded-lg text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black"
          >
            <Users size={20} />
            <span>Create Group</span>
          </button>
          <button
            onClick={() => console.log("Generate Report")}
            className="flex items-center gap-2 px-4 py-2 bg-[#212529] text-white rounded-lg text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black"
          >
            <FileText size={20} />
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Middle Initial</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Birth Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact No</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user, index) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(user.id)}
                  onChange={() => handleCheckboxChange(user.id)}
                  className="form-checkbox h-4 w-4 text-[#212529] rounded"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.first_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.middle_initial}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.last_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(user.birth_date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.contact_no}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.school_id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(user)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <SquarePen size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
};

export default UserTable;
