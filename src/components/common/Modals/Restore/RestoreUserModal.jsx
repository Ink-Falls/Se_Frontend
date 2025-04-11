import React, { useState } from "react";
import { X, Loader } from "lucide-react";
import { restoreUser } from "../../../../services/userService";
import { useTheme } from "../../../../contexts/ThemeContext";

const RestoreUserModal = ({ isOpen, onClose, onSuccess }) => {
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    // Clear error when user starts typing
    if (error) {
      setError("");
    }

    // Only validate if there's input
    if (newEmail) {
      const emailError = validateEmail(newEmail);
      if (emailError) {
        setError(emailError);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate email before submission
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    try {
      setIsLoading(true);
      const response = await restoreUser(email);
      onSuccess(response.message);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to restore user");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl dark:shadow-dark-xl transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 transition-colors">Restore User</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              className={`mt-1 block w-full rounded-md border ${
                error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              } px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors`}
              placeholder="Enter user email"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#212529] dark:bg-gray-900 rounded-md hover:bg-[#F6BA18] dark:hover:bg-[#F6BA18] hover:text-[#212529] dark:hover:text-[#212529] flex items-center transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Restoring...
                </>
              ) : (
                "Restore User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestoreUserModal;
