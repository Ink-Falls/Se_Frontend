// AdminUser.jsx
import React, { useState, useEffect } from "react";
import Sidebar, { SidebarItem } from "./Sidebar";
import Header from "./Header";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import DeleteUserButton from "./DeleteUserButton"; // Import
import {
  MoreVertical,
  ChevronDown,
  Edit,
  Trash2,
  Plus,
  Save,
  XCircle,
  Home,
  Book,
  Bell,
  FileText,
  Users,
  Pencil,
} from "lucide-react";

function AdminUser() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const navItems = [
    { text: "Users", icon: <Users size={20} />, route: "/AdminUser" },
    { text: "Courses", icon: <Book size={20} />, route: "/AdminModules" },
    {
      text: "Enrollments",
      icon: <Pencil size={20} />,
      route: "/AdminEnrollment",
    },
    {
      text: "Announcements",
      icon: <FileText size={20} />,
      route: "/AdminAnnouncements",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found. User might not be logged in.");
        setIsLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        const response = await fetch("http://localhost:4000/api/users", {
          headers,
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Received data:", data); // Add this for debugging

        if (Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          console.error("Invalid data format from /api/users:", data);
          setError("Invalid data format received from server.");
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUserAdded = (newUser) => {
    setUsers((prevUsers) => [newUser, ...prevUsers]);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const handleEdit = (user) => {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (userId) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />

        <div className="flex-1 p-6 overflow-auto">
          <Header title="Admin: Manage Users" />
          <div className="mt-4">
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
            >
              <Plus size={16} className="mr-2" /> Add User
            </button>
          </div>
          <div className="bg-white shadow rounded-lg overflow-x-auto mt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit size={16} className="inline mr-1" />
                        Edit
                      </button>
                      <DeleteUserButton
                        userId={user.id}
                        onDelete={handleDeleteUser}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add User Modal */}
          {isAddUserModalOpen && (
            <AddUserModal
              isOpen={isAddUserModalOpen}
              onClose={() => setIsAddUserModalOpen(false)}
              onUserAdded={handleUserAdded}
            />
          )}
          {/* Edit User Modal */}
          {isEditModalOpen && (
            <EditUserModal
              user={editingUser}
              onClose={() => {
                setEditingUser(null);
                setIsEditModalOpen(false);
              }}
              onSave={handleUserUpdated}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default AdminUser;
