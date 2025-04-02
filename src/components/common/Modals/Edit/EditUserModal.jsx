import React, { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { updateUser } from "../../../../services/userService";

function EditUserModal({ user, onClose, onSave }) {
  const [editedUser, setEditedUser] = useState({ ...user });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  // Add email validation function
  const validateEmail = (email) => {
    const validTLDs = ["com", "edu", "ph", "org", "net", "gov", "edu.ph"];

    if (!email) {
      return "Email is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }

    const domain = email.split("@")[1];
    if (!validTLDs.some((tld) => domain.toLowerCase().endsWith(`.${tld}`))) {
      return "Please enter a valid email domain";
    }

    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Set touched state for the field
    setTouched((prev) => ({ ...prev, [name]: true }));

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

    // Clear field error when user types
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    // Validate email as user types
    if (name === "email") {
      const emailError = validateEmail(value);
      if (emailError) {
        setFieldErrors((prev) => ({ ...prev, email: emailError }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    // Validate email before submission
    const emailError = validateEmail(editedUser.email);
    if (emailError) {
      setFieldErrors((prev) => ({ ...prev, email: emailError }));
      setLoading(false);
      return;
    }

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
      console.error("Error updating user:", err);
      const errorMessage = err.message || "An unexpected error occurred";

      if (errorMessage.toLowerCase().includes("email already exists")) {
        setFieldErrors({
          email: "This email address is already in use",
        });
      } else if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      } else {
        setError(errorMessage);
      }
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
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}

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
                className={`mt-1 block w-full px-3 py-2 border ${
                  fieldErrors.first_name ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {fieldErrors.first_name && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.first_name}
                </p>
              )}
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
                className={`mt-1 block w-full px-3 py-2 border ${
                  fieldErrors.last_name ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {fieldErrors.last_name && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.last_name}
                </p>
              )}
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
                className={`mt-1 block w-full px-3 py-2 border ${
                  fieldErrors.middle_initial
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {fieldErrors.middle_initial && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.middle_initial}
                </p>
              )}
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
                className={`mt-1 block w-full px-3 py-2 border ${
                  fieldErrors.email ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
              )}
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
                className={`mt-1 block w-full px-3 py-2 border ${
                  fieldErrors.contact_no ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {fieldErrors.contact_no && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.contact_no}
                </p>
              )}
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
                className={`mt-1 block w-full px-3 py-2 border ${
                  fieldErrors.birth_date ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {fieldErrors.birth_date && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.birth_date}
                </p>
              )}
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
                className={`mt-1 block w-full px-3 py-2 border ${
                  fieldErrors.school_id ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              >
                <option value="">Select School</option>
                {schoolOptions.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
              {fieldErrors.school_id && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.school_id}
                </p>
              )}
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
                className={`mt-1 block w-full px-3 py-2 border ${
                  fieldErrors.role ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="learner">Learner</option>
                <option value="student_teacher">Student Teacher</option>
              </select>
              {fieldErrors.role && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.role}</p>
              )}
            </div>
          </form>
        </div>

        <div className="p-6 border-t mt-auto">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditUserModal;
