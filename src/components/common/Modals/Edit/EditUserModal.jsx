import React, { useState, useEffect } from "react";
import { X } from "lucide-react"; // Add this import
import Modal from "../../Button/Modal"; // Your Modal component

function EditUserModal({ user, onClose, onSave }) {
  const [editedUser, setEditedUser] = useState({
    ...user,
    // Explicitly exclude password
    password: undefined,
  });

  // IMPORTANT: Update local state if the 'user' prop changes
  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact_no") {
      // Remove all non-digits
      let numbers = value.replace(/\D/g, "");

      // Ensure starts with '09'
      if (!numbers.startsWith("09")) {
        if (numbers.startsWith("63")) {
          numbers = "0" + numbers.substring(2);
        } else if (!numbers.startsWith("0")) {
          numbers = "09";
        }
      }

      // Limit to 11 digits
      numbers = numbers.slice(0, 11);

      // Format as 09XX-XXX-XXXX
      let formatted = numbers;
      if (numbers.length >= 4) {
        formatted = numbers.slice(0, 4) + "-" + numbers.slice(4);
      }
      if (numbers.length >= 7) {
        formatted = formatted.slice(0, 8) + "-" + formatted.slice(8);
      }

      setEditedUser((prev) => ({
        ...prev,
        [name]: formatted,
      }));
      return;
    }

    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { password, ...userWithoutPassword } = editedUser;
      await onSave(userWithoutPassword); // Pass the updated user up
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update user");
      console.error("Error updating user:", err);
    }
  };

  if (!user) {
    return null; // Don't render anything if no user is provided
  }

  const schoolOptions = [
    { id: "1001", name: "Asuncion Consunji Elementary School (ACES)" },
    { id: "1002", name: "University of Santo Tomas (UST)" },
    { id: "1003", name: "De la Salle University (DLSU)" },
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
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
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
              <label htmlFor="last_name"className="block text-sm font-medium text-gray-700">
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
              <label htmlFor="middle_initial" className="block text-sm font-medium text-gray-700">
                Middle Initial:
              </label>
              <input
                id="middle_initial"
                type="text"
                name="middle_initial"
                value={editedUser.middle_initial || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
              <label htmlFor="contact_no" className="block text-sm font-medium text-gray-700">
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
              <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
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
              <label htmlFor="scool"className="block text-sm font-medium text-gray-700">
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
              <label htmlFor="role"className="block text-sm font-medium text-gray-700">
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
