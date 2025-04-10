import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { createUser } from "../../../../services/userService";

const AddUserModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    middle_initial: "",
    birth_date: "",
    contact_no: "",
    school_id: "",
    role: "",
    section: "",
    department: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const validatePassword = (password) => {
    if (!password) return "Password is required";

    const minLength = 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 8 characters long";
    }
    if (!hasNumber) {
      return "Password must contain at least one number";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character";
    }
    if (!hasLetter) {
      return "Password must contain at least one letter";
    }
    return null;
  };

  const validateForm = () => {
    const errors = {};

    // Name validations
    if (!/^[a-zA-Z\s]{2,30}$/.test(formData.first_name.trim())) {
      errors.first_name =
        "First name must be 2-30 characters and contain only letters";
    }

    if (!/^[a-zA-Z\s]{2,30}$/.test(formData.last_name.trim())) {
      errors.last_name =
        "Last name must be 2-30 characters and contain only letters";
    }

    if (
      formData.middle_initial &&
      !/^[A-Z]{1,2}$/.test(formData.middle_initial)
    ) {
      errors.middle_initial = "Middle initial must be 1-2 uppercase letters";
    }

    // Email validation
    errors.email = validateEmail(formData.email);
    if (!errors.email) {
      delete errors.email;
    }

    // Contact number validation
    const cleanedPhone = formData.contact_no.replace(/[-\s()]/g, "");
    if (!cleanedPhone) {
      errors.contact_no = "Contact number is required";
    } else if (!cleanedPhone.startsWith("09")) {
      errors.contact_no = "Contact number must start with 09";
    } else if (cleanedPhone.length !== 11) {
      errors.contact_no = "Contact number must be 11 digits";
    }

    // Birth date validation
    const birthDate = new Date(formData.birth_date);
    const today = new Date();
    if (birthDate > today) {
      errors.birth_date = "Birth date cannot be in the future";
    }

    // Enhanced password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    } else if (!/\d/.test(formData.password)) {
      errors.password = "Password must contain at least one number";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      errors.password = "Password must contain at least one special character";
    }

    // Confirm password validation
    if (!formData.confirm_password) {
      errors.confirm_password = "Please confirm your password";
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }

    // Student teacher specific validations
    if (formData.role === "student_teacher") {
      if (!formData.section || formData.section.length < 2) {
        errors.section = "Section must be at least 2 characters";
      }
      if (!formData.department || formData.department.length < 2) {
        errors.department = "Department must be at least 2 characters";
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email before submission
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setFieldErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const { confirm_password, ...userData } = formData;

      // Clean data before sending to API
      if (userData.contact_no) {
        userData.contact_no = userData.contact_no.replace(/[-\s()]/g, "");
      }

      Object.keys(userData).forEach((key) => {
        if (userData[key] === "" || userData[key] === undefined) {
          delete userData[key];
        }
      });

      const createdUser = await createUser(userData);
      onSubmit(createdUser);
    } catch (err) {
      console.error("User creation error:", err);

      // Handle specific API errors
      if (err.message === "Email already exists") {
        setFieldErrors({
          email: "Email already exists. Please use a different email.",
        });
      } else if (err.message.includes("validation")) {
        // Handle validation errors from API
        setFieldErrors({
          general: "Please check your input and try again.",
        });
      } else {
        // Handle general errors
        setError(err.message || "Failed to create user. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    let error = null;

    // Handle special cases first
    if (name === "contact_no") {
      // Only allow numbers and limit to 11 chars
      newValue = value.replace(/\D/g, "").slice(0, 11);

      // Validate number
      if (!newValue) {
        error = "Contact number is required";
      } else if (!newValue.startsWith("09")) {
        error = "Contact number must start with 09";
      } else if (newValue.length !== 11) {
        error = "Contact number must be 11 digits";
      }
    } else if (name === "middle_initial") {
      newValue = value.toUpperCase().slice(0, 2);
      if (newValue && !/^[A-Z]{1,2}$/.test(newValue)) {
        error = "Middle initial must be 1-2 uppercase letters";
      }
    } else {
      // Handle other validations
      switch (name) {
        case "first_name":
        case "last_name":
          if (value && !/^[a-zA-Z\s]{2,30}$/.test(value.trim())) {
            error = `${
              name === "first_name" ? "First" : "Last"
            } name must be 2-30 characters and contain only letters`;
          }
          break;
        case "email":
          error = validateEmail(value);
          break;
        case "password":
          if (!value) {
            error = "Password is required";
          } else if (value.length < 8) {
            error = "Password must be at least 8 characters long";
          } else if (!/\d/.test(value)) {
            error = "Password must contain at least one number";
          } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            error = "Password must contain at least one special character";
          }
          break;
        case "confirm_password":
          if (value !== formData.password) {
            error = "Passwords do not match";
          }
          break;
        case "birth_date":
          const birthDate = new Date(value);
          const today = new Date();
          if (birthDate > today) {
            error = "Birth date cannot be in the future";
          }
          break;
      }
    }

    // Update form data
    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Update field errors
    setFieldErrors((prev) => ({
      ...prev,
      [name]: error,
      // Special case for confirm_password when password changes
      ...(name === "password" && formData.confirm_password
        ? {
            confirm_password:
              formData.confirm_password !== value
                ? "Passwords do not match"
                : null,
          }
        : {}),
    }));
  };

  const handleMiddleInitialChange = (e) => {
    // Only allow up to 2 letters and convert to uppercase
    const value = e.target.value
      .replace(/[^A-Za-z]/g, "") // Remove non-letters
      .substring(0, 2) // Limit to 2 characters
      .toUpperCase(); // Convert to uppercase

    setFormData((prev) => ({
      ...prev,
      middle_initial: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] flex flex-col z-[10000]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New User</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          {fieldErrors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {fieldErrors.general}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
                className={`mt-1 block w-full rounded-md border ${
                  fieldErrors.first_name ? "border-red-500" : "border-gray-300"
                } px-3 py-2`}
                required
              />
              {fieldErrors.first_name && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.first_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
                className={`mt-1 block w-full rounded-md border ${
                  fieldErrors.last_name ? "border-red-500" : "border-gray-300"
                } px-3 py-2`}
                required
              />
              {fieldErrors.last_name && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.last_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Middle Initial
              </label>
              <input
                type="text"
                name="middle_initial"
                value={formData.middle_initial}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    middle_initial: e.target.value.toUpperCase().slice(0, 2),
                  }))
                }
                placeholder="Up to 2 letters"
                maxLength={2}
                className={`mt-1 block w-full rounded-md border ${
                  fieldErrors.middle_initial
                    ? "border-red-500"
                    : "border-gray-300"
                } px-3 py-2`}
              />
              {fieldErrors.middle_initial && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.middle_initial}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Birth Date
              </label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  fieldErrors.birth_date ? "border-red-500" : "border-gray-300"
                } px-3 py-2`}
                required
                placeholder="Select birth date"
              />
              {fieldErrors.birth_date && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.birth_date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className={`mt-1 block w-full rounded-md border ${
                  fieldErrors.email ? "border-red-500" : "border-gray-300"
                } px-3 py-2`}
                required
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <input
                type="tel"
                name="contact_no"
                value={formData.contact_no}
                onChange={handleChange}
                placeholder="Enter contact number"
                maxLength={11}
                className={`mt-1 block w-full rounded-md border ${
                  fieldErrors.contact_no ? "border-red-500" : "border-gray-300"
                } px-3 py-2`}
                required
              />
              {fieldErrors.contact_no && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.contact_no}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                School
              </label>
              <select
                id="school_id"
                placeholder="Select a school"
                name="school_id"
                value={formData.school_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-500"
                required
              >
                <option value="" disabled>
                  Select a school...
                </option>
                <option value="1002" data-name="ACES">
                  Asuncion Consunji Elementary School (ACES)
                </option>
                <option value="1001" data-name="UST">
                  University of Santo Tomas (UST)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                name="role"
                placeholder="Select a role"
                id="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-500"
                required
              >
                <option value="" disabled>
                  Select a role...
                </option>
                <option value="teacher">Teacher</option>
                <option value="student_teacher">Student Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {formData.role === "student_teacher" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Section
                  </label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    placeholder="Enter section"
                    className={`mt-1 block w-full rounded-md border ${
                      fieldErrors.section ? "border-red-500" : "border-gray-300"
                    } px-3 py-2`}
                    required
                  />
                  {fieldErrors.section && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.section}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Enter department"
                    className={`mt-1 block w-full rounded-md border ${
                      fieldErrors.department
                        ? "border-red-500"
                        : "border-gray-300"
                    } px-3 py-2`}
                    required
                  />
                  {fieldErrors.department && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.department}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="col-span-2 relative">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className={`mt-1 block w-full rounded-md border ${
                    fieldErrors.password ? "border-red-500" : "border-gray-300"
                  } px-3 py-2 pr-10`}
                  required
                  minLength="8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 mt-1 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="col-span-2 relative">
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className={`mt-1 block w-full rounded-md border ${
                    fieldErrors.confirm_password
                      ? "border-red-500"
                      : "border-gray-300"
                  } px-3 py-2 pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 mt-1 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {fieldErrors.confirm_password && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.confirm_password}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-[#F6BA18] disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
