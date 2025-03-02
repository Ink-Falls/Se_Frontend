// UserTable.jsx
import React from "react";
import { Edit } from "lucide-react";

function UserTable({ users, onEdit }) {
  // Receive onEdit prop
  if (!users || users.length === 0) {
    return <p>No users found.</p>;
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            ID
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            First Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Last Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Email
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Role
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>{" "}
          {/* New Column */}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {users.map((user) => (
          <tr key={user.id}>
            <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
            <td className="px-6 py-4 whitespace-nowrap">{user.first_name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{user.last_name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
            <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <button
                onClick={() => onEdit(user)} // Call onEdit with the user
                className="text-bg-[#F6BA18] hover:text-indigo-900"
              >
                <Edit size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UserTable;
