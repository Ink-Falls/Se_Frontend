import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { updateUser } from "../../../../services/userService";

function EditUserModal({ user, onClose, onSave }) {
  const [editedUser, setEditedUser] = useState({ ...user });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact_no") {
      // Clean and format contact number
      let cleanedValue = value.replace(/\D/g, "");

      if (!cleanedValue.startsWith("0") && !value.startsWith("+63")) {
        cleanedValue = "0" + cleanedValue;
      }

      cleanedValue = cleanedValue.slice(0, 11);

      // Format with hyphens
      let formattedContactNo = cleanedValue;
      if (formattedContactNo.length > 4) {
        formattedContactNo = formattedContactNo.replace(/^(\d{4})/, "$1-");
      }
      if (formattedContactNo.length > 8) {
        formattedContactNo = formattedContactNo.replace(/-(\d{3})/, "-$1-");
      }

      setEditedUser((prev) => ({
        ...prev,
        [name]: formattedContactNo,
      }));
    } else if (name === "middle_initial") {
      // Convert to uppercase and limit to 1 character
      setEditedUser((prev) => ({
        ...prev,
        [name]: value.toUpperCase().slice(0, 1),
      }));
    } else {
      setEditedUser((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { password, ...userWithoutPassword } = editedUser;

      // Remove hyphens from contact number
      const cleanedData = {
        ...userWithoutPassword,
        contact_no: userWithoutPassword.contact_no?.replace(/-/g, ""),
      };

      await onSave(cleanedData);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update user");
      console.error("Error updating user:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const schoolOptions = [
    { id: "1001", name: "Asuncion Consunji Elementary School (ACES)" },
    { id: "1002", name: "University of Santo Tomas (UST)" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Edit User</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700"
              >
                First Name:
              </label>
              <input
                id="first_name"
                type="text"
                name="first_name"
                value={editedUser.first_name || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name:
              </label>
              <input
                id="last_name"
                type="text"
                name="last_name"
                value={editedUser.last_name || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="middle_initial"
                className="block text-sm font-medium text-gray-700"
              >
                Middle Initial:
              </label>
              <input
                id="middle_initial"
                type="text"
                name="middle_initial"
                value={editedUser.middle_initial || ""}
                onChange={handleInputChange}
                maxLength={1}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email:
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={editedUser.email || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="contact_no"
                className="block text-sm font-medium text-gray-700"
              >
                Contact No:
              </label>
              <input
                id="contact_no"
                type="text"
                name="contact_no"
                value={editedUser.contact_no || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="birthdate"
                className="block text-sm font-medium text-gray-700"
              >
                Birthdate:
              </label>
              <input
                id="birthdate"
                type="date"
                name="birth_date"
                value={
                  editedUser.birth_date
                    ? new Date(editedUser.birth_date)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="scool"
                className="block text-sm font-medium text-gray-700"
              >
                School:
              </label>
              <select
                id="school"
                name="school_id"
                value={editedUser.school_id || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select School</option>
                {schoolOptions.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role:
              </label>
              <select
                id="role"
                name="role"
                value={editedUser.role || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="learner">Learner</option>
                <option value="student_teacher">Student Teacher</option>
              </select>
            </div>
          </form>
        </div>

        <div className="p-6 border-t mt-auto">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              type="submit"
              className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditUserModal;
