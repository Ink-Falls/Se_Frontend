import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/images/ARALKADEMYLOGO.png";
import { createEnrollment } from "../../services/enrollmentService";
import { Eye, EyeOff } from "lucide-react";
import ConsentForm from "../../components/enrollment/ConsentForm";

function NewEnrollment() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    middle_initial: "",
    contact_no: "",
    birth_date: "",
    school_id: "",
    year_level: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showConsent, setShowConsent] = useState(true);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false); // New state for tracking successful submission
  const navigate = useNavigate();

  useEffect(() => {
    // Always show the consent when first loading the page
    setShowConsent(true);
  }, []);

  // Add individual validation functions
  const validateName = (name, fieldName) => {
    if (!name.trim()) {
      return `${fieldName} is required`;
    }
    if (!/^[a-zA-Z\s]{2,30}$/.test(name)) {
      return `${fieldName} must be 2-30 characters and contain only letters`;
    }
    return null;
  };

  const validateMiddleInitial = (mi) => {
    if (mi && !/^[A-Z]{1,2}$/.test(mi)) {
      return "Middle initial must be 1-2 uppercase letters";
    }
    return null;
  };

  const validateContactNo = (contactNo) => {
    const cleanedContactNo = contactNo.replace(/[-\s()]/g, "");
    if (!cleanedContactNo) {
      return "Contact number is required";
    }
    if (!cleanedContactNo.startsWith("09")) {
      return "Contact number must start with 09";
    }
    if (cleanedContactNo.length !== 11) {
      return "Contact number must be 11 digits";
    }
    return null;
  };

  const validateBirthDate = (date) => {
    if (!date) {
      return "Birth date is required";
    }
    const birthDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (birthDate > today) {
      return "Birth date cannot be in the future";
    }
    return null;
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/\d/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one special character";
    }
    if (!/[a-zA-Z]/.test(password)) {
      return "Password must contain at least one letter";
    }
    return null;
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) {
      return "Please confirm your password";
    }
    if (confirmPassword !== password) {
      return "Passwords do not match";
    }
    return null;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      return "Email is required";
    }

    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }

    return null;
  };

  // Modify handleInputChange to include real-time validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    let error = null;

    // Handle special cases first
    if (name === "middle_initial") {
      newValue = value.toUpperCase().slice(0, 2);
      error = validateMiddleInitial(newValue);
    } else if (name === "contact_no") {
      let cleanedValue = value.replace(/\D/g, "");
      if (cleanedValue.startsWith("63")) {
        cleanedValue = "0" + cleanedValue.slice(2);
      }
      if (!cleanedValue.startsWith("0") && !value.startsWith("+63")) {
        cleanedValue = "0" + cleanedValue;
      }
      cleanedValue = cleanedValue.slice(0, 11);

      // Format with hyphens
      newValue = cleanedValue;
      if (newValue.length > 4) {
        newValue = newValue.replace(/^(\d{4})/, "$1-");
      }
      if (newValue.length > 8) {
        newValue = newValue.replace(/-(\d{3})/, "-$1-");
      }
      error = validateContactNo(newValue);
    } else {
      // Handle other validations
      switch (name) {
        case "first_name":
          error = validateName(value, "First name");
          break;
        case "last_name":
          error = validateName(value, "Last name");
          break;
        case "email":
          error = validateEmail(value);
          break;
        case "password":
          error = validatePassword(value);
          break;
        case "confirm_password":
          error = validateConfirmPassword(value, formData.password);
          break;
        case "birth_date":
          error = validateBirthDate(value);
          break;
      }
    }

    // Update form data
    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Update errors immediately
    setErrors((prev) => ({
      ...prev,
      [name]: error,
      // Special case for confirm_password when password changes
      ...(name === "password" && formData.confirm_password
        ? {
            confirm_password: validateConfirmPassword(
              formData.confirm_password,
              value
            ),
          }
        : {}),
    }));
  };

  // Keep validateForm for final submission check
  const validateForm = () => {
    const errors = {};

    errors.first_name = validateName(formData.first_name, "First name");
    errors.last_name = validateName(formData.last_name, "Last name");
    errors.middle_initial = validateMiddleInitial(formData.middle_initial);
    errors.contact_no = validateContactNo(formData.contact_no);
    errors.email = validateEmail(formData.email);
    errors.password = validatePassword(formData.password);
    errors.confirm_password = validateConfirmPassword(
      formData.confirm_password,
      formData.password
    );
    errors.birth_date = validateBirthDate(formData.birth_date);

    if (!formData.school_id) {
      errors.school_id = "Please select a school";
    }
    if (!formData.year_level) {
      errors.year_level = "Please select your year level";
    }

    // Remove null errors
    Object.keys(errors).forEach((key) => {
      if (errors[key] === null) {
        delete errors[key];
      }
    });

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");
    setIsLoading(true);

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    // Prepare data for submission
    const dataToSend = {
      ...formData,
      contact_no: formData.contact_no.replace(/[-\s()]/g, ""),
    };

    try {
      await createEnrollment(dataToSend);
      setSuccessMessage("Enrollment submitted successfully!");
      setIsSubmitSuccess(true); // Set submission as successful
      setFormData({
        first_name: "",
        last_name: "",
        middle_initial: "",
        contact_no: "",
        birth_date: "",
        school_id: "",
        year_level: "",
        email: "",
        password: "",
        confirm_password: "",
      });

      setTimeout(() => {
        navigate("/EnrollConfirm");
      }, 3000);
    } catch (error) {
      if (error.message === "Email already exists") {
        setErrors({
          email: "Email already exists. Please use a different email.",
        });
      } else {
        setErrors({
          general: error.message || "Network error. Please try again.",
        });
      }
      setIsLoading(false); // Only set loading false on error
      // Don't set isSubmitSuccess to true if there was an error
    }
    // Don't set isLoading to false on success - keep the button disabled
  };

  const handleAcceptConsent = () => {
    setShowConsent(false);
  };

  const handleDeclineConsent = () => {
    navigate("/Enrollment"); // Go back to enrollment page
  };

  return (
    <>
      <div
        className="min-h-screen bg-cover bg-center relative"
        style={{
          backgroundImage:
            "url(https://upload.wikimedia.org/wikipedia/commons/7/7b/400_Year_old_Beauty.jpg)",
        }}
      >
        {/* Show consent modal if needed */}
        {showConsent && (
          <ConsentForm
            onAccept={handleAcceptConsent}
            onDecline={handleDeclineConsent}
          />
        )}

        {/* Semi-transparent black overlay */}
        <div className="absolute inset-0 bg-black opacity-30"></div>

        <header className="relative z-10 py-[3vw] px-[4vw] lg:py-[1.5vw] lg:px-[2vw] bg-[#121212] text-[#F6BA18] flex justify-between items-center shadow-xl">
          <div className="flex items-center">
            <img
              src={logo}
              alt="ARALKADEMY Logo"
              className="h-[8vw] md:h-[5vw] lg:h-[2.5vw] mr-2"
            />
          </div>

          <button
            onClick={() => navigate("/Login")}
            className="text-[4vw] py-[1.5vw] px-[6vw] md:text-[3vw] md:py-[1vw] md:px-[4vw] lg:text-[1vw] lg:py-[0.5vw] lg:px-[2vw] bg-[#F6BA18] text-[#212529] font-bold rounded-md hover:bg-[#64748B] hover:text-[#FFFFFF] transition-colors duration-300 ease-in-out"
          >
            Log In
          </button>
        </header>

        {/* Only show the form if consent has been accepted */}
        {!showConsent && (
          <div className="relative z-10 flex items-center justify-center min-h-screen pb-[15vw] md:pb-[10vw] lg:pb-0">
            <div className="mt-[10vw] md:mt-[15vw] lg:mt-[0vw] flex flex-col lg:flex-row items-center rounded-lg">
              <div className="p-[5vw] max-lg:p-[7vw] w-[80vw] lg:p-[2.5vw] lg:w-[60vw] bg-white rounded-lg shadow-2xl relative">
                <div className="top-[0vw] left-[0vw] h-[1.5vw] lg:top-[0vw] lg:left-[0vw] lg:h-[0.5vw] absolute w-full bg-[#F6BA18] rounded-t-lg"></div>
                <h2 className="text-[8vw] lg:text-[2vw] max-lg:text-[6vw] font-bold text-left text-[#212529]">
                  Enrollment
                </h2>
                <p className="text-[3vw] mb-[5vw] lg:mb-[2vw] lg:text-[0.8vw] max-lg:text-[2.5vw] text-[#64748B] text-left">
                  Please enter all the necessary information to enroll
                </p>
                {errors.general && (
                  <p className="text-red-500 text-sm mt-1">{errors.general}</p>
                )}
                {successMessage && (
                  <p className="text-green-500 text-sm mt-1">
                    {successMessage}
                  </p>
                )}

                {/* Enrollment Form */}
                <form onSubmit={handleSubmit} className="space-y-[1.5vw]">
                  <div className="flex flex-wrap gap-[2vw]">
                    {[
                      {
                        label: "First Name",
                        name: "first_name",
                        type: "text",
                        required: true,
                      },
                      {
                        label: "Last Name",
                        name: "last_name",
                        type: "text",
                        required: true,
                      },
                      {
                        label: "Middle Initial",
                        name: "middle_initial",
                        type: "text",
                        required: false,
                      },
                      {
                        label: "Contact No.",
                        name: "contact_no",
                        type: "tel",
                        required: true,
                      },
                      {
                        label: "Birthdate",
                        name: "birth_date",
                        type: "date",
                        required: true,
                      },
                      {
                        label: "Email",
                        name: "email",
                        type: "email",
                        required: true,
                      },
                      {
                        label: "Password",
                        name: "password",
                        type: "password",
                        required: true,
                      },
                      {
                        label: "Confirm Password",
                        name: "confirm_password",
                        type: "password",
                        required: true,
                      },
                    ].map((field) => (
                      <div
                        key={field.name}
                        className="w-full lg:w-[calc(50%-1vw)]"
                      >
                        <label
                          htmlFor={field.name}
                          className="text-[3vw] block text-[#64748B] lg:text-[0.8vw] max-lg:text-[2.5vw]"
                        >
                          {field.label}
                        </label>
                        {field.name === "password" ||
                        field.name === "confirm_password" ? (
                          <div className="relative">
                            <input
                              type={
                                field.name === "password"
                                  ? showPassword
                                    ? "text"
                                    : "password"
                                  : showConfirmPassword
                                  ? "text"
                                  : "password"
                              }
                              id={field.name}
                              name={field.name}
                              value={formData[field.name]}
                              onChange={handleInputChange}
                              required={field.required}
                              className="mt-[1vw] text-[3vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] max-lg:text-[2.5vw] lg:text-[0.8vw] lg:px-[1vw] lg:py-[0.6vw] w-full border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529] pr-[10vw] lg:pr-[3vw]"
                              placeholder={`Enter your ${field.label.toLowerCase()}`}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                field.name === "password"
                                  ? setShowPassword(!showPassword)
                                  : setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-[3vw] lg:right-[1vw] top-[55%] transform -translate-y-1/2 text-gray-500"
                              aria-label={`Toggle ${field.label.toLowerCase()} visibility`}
                            >
                              {field.name === "password" ? (
                                showPassword ? (
                                  <EyeOff className="w-[4vw] h-[4vw] lg:w-[1.2vw] lg:h-[1.2vw]" />
                                ) : (
                                  <Eye className="w-[4vw] h-[4vw] lg:w-[1.2vw] lg:h-[1.2vw]" />
                                )
                              ) : showConfirmPassword ? (
                                <EyeOff className="w-[4vw] h-[4vw] lg:w-[1.2vw] lg:h-[1.2vw]" />
                              ) : (
                                <Eye className="w-[4vw] h-[4vw] lg:w-[1.2vw] lg:h-[1.2vw]" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <input
                            type={field.type}
                            id={field.name}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={(e) => {
                              if (field.name === "middle_initial") {
                                setFormData((prev) => ({
                                  ...prev,
                                  middle_initial: e.target.value
                                    .toUpperCase()
                                    .slice(0, 2),
                                }));
                              } else {
                                handleInputChange(e);
                              }
                            }}
                            required={field.required}
                            maxLength={
                              field.name === "middle_initial" ? 2 : undefined
                            }
                            className="mt-[1vw] text-[3vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] max-lg:text-[2.5vw] lg:text-[0.8vw] lg:px-[1vw] lg:py-[0.6vw] w-full border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]"
                            placeholder={`Enter your ${field.label.toLowerCase()}`}
                          />
                        )}
                        <div className="min-h-[0vw]">
                          {errors[field.name] && (
                            <p className="text-red-500 mt-1 text-xs">
                              {errors[field.name]}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-[2vw]">
                    <div className="w-full lg:w-[calc(50%-1vw)]">
                      <label
                        htmlFor="school_id"
                        className="text-[3vw] mt-[0.5vw] max-lg:text-[2.5vw] block text-[#64748B] lg:text-[0.8vw]"
                      >
                        School
                      </label>
                      <select
                        id="school_id"
                        name="school_id"
                        value={formData.school_id}
                        onChange={handleInputChange}
                        required
                        className="mt-[1vw] text-[3vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] lg:text-[0.8vw] lg:px-[0.5vw] max-lg:text-[2.5vw] lg:py-[0.6vw] w-full border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]"
                      >
                        <option value="" disabled>
                          Select your school
                        </option>
                        <option value="1001">
                          Asuncion Consunji Elementary School (ACES)
                        </option>
                        <option value="1002">
                          University of Santo Tomas (UST)
                        </option>
                      </select>
                    </div>

                    <div className="w-full lg:w-[calc(50%-1vw)]">
                      <label
                        htmlFor="year_level"
                        className="text-[3vw] mt-[0.5vw] max-lg:text-[2.5vw] block text-[#64748B] lg:text-[0.8vw]"
                      >
                        Year Level
                      </label>
                      <select
                        id="year_level"
                        name="year_level"
                        value={formData.year_level}
                        onChange={handleInputChange}
                        required
                        className="mt-[1vw] text-[3vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] lg:text-[0.8vw] max-lg:text-[2.5vw] lg:px-[1vw] max-lg:text-[2.5vw]z lg:py-[0.6vw] w-full border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]"
                      >
                        <option value="" disabled>
                          Select your year level
                        </option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end items-center w-full">
                    <button
                      type="submit"
                      className={`py-[1.5vw] px-[7vw] text-[3.5vw] max-lg:text-[2.5vw] mb-[2vw] mt-[2vw] lg:mb-[0.2vw] lg:mt-[0.2vw] lg:py-[0.4vw] lg:px-[2.5vw] lg:text-[1vw] bg-[#212529] text-[#FFFFFF] font-semibold rounded-md transition-colors duration-300 ease-in-out ${
                        isLoading || isSubmitSuccess
                          ? "opacity-70 cursor-not-allowed"
                          : "hover:bg-[#F6BA18] hover:text-[#212529]"
                      }`}
                      disabled={isLoading || isSubmitSuccess}
                    >
                      {isLoading
                        ? "Submitting..."
                        : isSubmitSuccess
                        ? "Redirecting..."
                        : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default NewEnrollment;
