import React, { useState, useEffect } from "react";
import Sidebar, { SidebarItem } from "./Sidebar";
import Header from "./Header";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import DeleteUserButton from "./DeleteUserButton";
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
} from "lucide-react";

// Create a cache outside the component to persist across renders
const userCache = {
  data: null,
  timestamp: 0,
  expiryTime: 5 * 60 * 1000, // 5 minutes in milliseconds
};

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
      text: "Notifications",
      icon: <Bell size={20} />,
      route: "/AdminNotifications",
    },
    {
      text: "Announcements",
      icon: <FileText size={20} />,
      route: "/AdminAnnouncements",
    },
  ];

  useEffect(() => {
    const fetchDataWithRetry = async (retries = 3, delay = 1000) => {
      // Check if we have valid cached data
      const now = Date.now();
      if (userCache.data && now - userCache.timestamp < userCache.expiryTime) {
        console.log("Using cached user data");
        setUsers(userCache.data);
        setIsLoading(false);
        return;
      }

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

      let attempts = 0;
      while (attempts <= retries) {
        try {
          const response = await fetch("http://localhost:4000/api/users", {
            headers,
          });

          if (response.status === 429) {
            attempts++;
            console.log(
              `Rate limited. Retry attempt ${attempts} of ${retries}`
            );

            // If we have cached data available, use it instead of retrying
            if (userCache.data) {
              console.log("Using cached data due to rate limiting");
              setUsers(userCache.data);
              setIsLoading(false);
              return;
            }

            if (attempts <= retries) {
              await new Promise((resolve) =>
                setTimeout(resolve, delay * Math.pow(2, attempts - 1))
              );
              continue;
            }
          }

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          console.log("Received data:", data);

          if (Array.isArray(data.users)) {
            // Update the cache
            userCache.data = data.users;
            userCache.timestamp = now;

            setUsers(data.users);
          } else {
            console.error("Invalid data format from /api/users:", data);
            setError("Invalid data format received from server.");
            setUsers([]);
          }
          break; // Exit the loop if successful
        } catch (error) {
          console.error("Error fetching users:", error);

          // If we have cached data available, use it after an error
          if (userCache.data) {
            console.log("Using cached data after fetch error");
            setUsers(userCache.data);
            setIsLoading(false);
            return;
          }

          if (attempts >= retries) {
            setError(error.message);
          }
          attempts++;
          if (attempts <= retries) {
            await new Promise((resolve) =>
              setTimeout(resolve, delay * Math.pow(2, attempts - 1))
            );
          }
        }
      }
      setIsLoading(false);
    };

    fetchDataWithRetry();
  }, []);

  // Update cache when users are modified
  const handleUserAdded = (newUser) => {
    const updatedUsers = [newUser, ...users];
    setUsers(updatedUsers);
    userCache.data = updatedUsers;
    userCache.timestamp = Date.now();
  };

  const handleUserUpdated = (updatedUser) => {
    const updatedUsers = users.map((user) =>
      user.id === updatedUser.id ? updatedUser : user
    );
    setUsers(updatedUsers);
    userCache.data = updatedUsers;
    userCache.timestamp = Date.now();
  };

  const handleDeleteUser = (userId) => {
    const updatedUsers = users.filter((user) => user.id !== userId);
    setUsers(updatedUsers);
    userCache.data = updatedUsers;
    userCache.timestamp = Date.now();
  };

  const handleEdit = (user) => {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
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
