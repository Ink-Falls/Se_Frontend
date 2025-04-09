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
  const navigate = useNavigate();

  useEffect(() => {
    // Always show the consent when first loading the page
    setShowConsent(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "middle_initial") {
      // Force uppercase and limit to 2 characters
      setFormData((prevData) => ({
        ...prevData,
        [name]: value.toUpperCase().slice(0, 2),
      }));
      return; // Exit early after handling middle initial
    }

    if (name === "contact_no") {
      let cleanedValue = value.replace(/\D/g, ""); // Remove non-digits

      // Convert +63 to 0
      if (cleanedValue.startsWith("63")) {
        cleanedValue = "0" + cleanedValue.slice(2);
      }
      // Ensure it starts with 0 if not +63
      else if (!cleanedValue.startsWith("0") && !value.startsWith("+63")) {
        cleanedValue = "0" + cleanedValue;
      }

      // Limit to 11 digits
      cleanedValue = cleanedValue.slice(0, 11);

      // Format with hyphens
      let formattedContactNo = cleanedValue;
      if (formattedContactNo.length > 4) {
        formattedContactNo = formattedContactNo.replace(/^(\d{4})/, "$1-");
      }
      if (formattedContactNo.length > 8) {
        formattedContactNo = formattedContactNo.replace(/-(\d{3})/, "-$1-");
      }

      setFormData((prevData) => ({
        ...prevData,
        [name]: formattedContactNo,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
  };

  const validateForm = () => {
    const errors = {};

    // Name validations
    if (!formData.first_name.trim()) {
      errors.first_name = "First name is required";
    } else if (!/^[a-zA-Z\s]{2,30}$/.test(formData.first_name)) {
      errors.first_name =
        "First name must be 2-30 characters and contain only letters";
    }

    if (!formData.last_name.trim()) {
      errors.last_name = "Last name is required";
    } else if (!/^[a-zA-Z\s]{2,30}$/.test(formData.last_name)) {
      errors.last_name =
        "Last name must be 2-30 characters and contain only letters";
    }

    if (
      formData.middle_initial &&
      !/^[A-Z]{1,2}$/.test(formData.middle_initial)
    ) {
      errors.middle_initial = "Middle initial must be 1-2 uppercase letters";
    }

    // Contact number validation
    const cleanedContactNo = formData.contact_no.replace(/[-\s()]/g, "");
    if (!cleanedContactNo) {
      errors.contact_no = "Contact number is required";
    } else if (!cleanedContactNo.startsWith("09")) {
      errors.contact_no = "Contact number must start with 09";
    } else if (cleanedContactNo.length !== 11) {
      errors.contact_no = "Contact number must be 11 digits";
    }

    // Enhanced email validation
    const validEmailDomains = [
      '@gmail.com',
      '@yahoo.com',
      '@outlook.com',
      '@hotmail.com',
      '@icloud.com',
      '@protonmail.com',
      '@aol.com',
      '@zoho.com',
      '@mail.com'
    ];
    
    if (!formData.email) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      } else if (!validEmailDomains.some(domain => formData.email.toLowerCase().endsWith(domain))) {
        errors.email = "Please use a valid email domain (e.g., @gmail.com, @yahoo.com)";
      }
    }

    // Enhanced password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else {
      const minLength = 8;
      const hasNumber = /\d/.test(formData.password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
      const hasLetter = /[a-zA-Z]/.test(formData.password);

      if (formData.password.length < minLength) {
        errors.password = "Password must be at least 8 characters long";
      } else if (!hasNumber) {
        errors.password = "Password must contain at least one number";
      } else if (!hasSpecialChar) {
        errors.password = "Password must contain at least one special character";
      } else if (!hasLetter) {
        errors.password = "Password must contain at least one letter";
      }
    }

    if (!formData.confirm_password) {
      errors.confirm_password = "Please confirm your password";
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }

    // Birth date validation
    if (!formData.birth_date) {
      errors.birth_date = "Birth date is required";
    } else {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();

      // Set today's time to midnight for accurate date comparison
      today.setHours(0, 0, 0, 0);

      if (birthDate > today) {
        errors.birth_date = "Birth date cannot be in the future";
      }
    }

    // School and year level validation
    if (!formData.school_id) {
      errors.school_id = "Please select a school";
    }

    if (!formData.year_level) {
      errors.year_level = "Please select your year level";
    }

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
    } finally {
      setIsLoading(false);
    }
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
                  <p className="text-green-500 text-sm mt-1">{successMessage}</p>
                )}

                {/* Enrollment Form */}
                <form onSubmit={handleSubmit} className="space-y-[1.5vw]">
                  <div className="flex flex-wrap gap-[2vw]">
                    {[{
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
                    }].map((field) => (
                      <div key={field.name} className="w-full lg:w-[calc(50%-1vw)]">
                        <label htmlFor={field.name} className="text-[3vw] block text-[#64748B] lg:text-[0.8vw] max-lg:text-[2.5vw]">
                          {field.label}
                        </label>
                        {field.name === "password" || field.name === "confirm_password" ? (
                          <div className="relative">
                            <input
                              type={field.name === "password" ? showPassword ? "text" : "password" : showConfirmPassword ? "text" : "password"}
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
                              onClick={() => field.name === "password" ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-[3vw] lg:right-[1vw] top-[55%] transform -translate-y-1/2 text-gray-500"
                              aria-label={`Toggle ${field.label.toLowerCase()} visibility`}
                            >
                              {field.name === "password" ? showPassword ? <EyeOff className="w-[4vw] h-[4vw] lg:w-[1.2vw] lg:h-[1.2vw]" /> : <Eye className="w-[4vw] h-[4vw] lg:w-[1.2vw] lg:h-[1.2vw]" /> : showConfirmPassword ? <EyeOff className="w-[4vw] h-[4vw] lg:w-[1.2vw] lg:h-[1.2vw]" /> : <Eye className="w-[4vw] h-[4vw] lg:w-[1.2vw] lg:h-[1.2vw]" />}
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
                                  middle_initial: e.target.value.toUpperCase().slice(0, 2),
                                }));
                              } else {
                                handleInputChange(e);
                              }
                            }}
                            required={field.required}
                            maxLength={field.name === "middle_initial" ? 2 : undefined}
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
                      className="py-[1.5vw] px-[7vw] text-[3.5vw] max-lg:text-[2.5vw] mb-[2vw] mt-[2vw] lg:mb-[0.2vw] lg:mt-[0.2vw] lg:py-[0.4vw] lg:px-[2.5vw] lg:text-[1vw] bg-[#212529] text-[#FFFFFF] font-semibold rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 ease-in-out"
                      disabled={isLoading}
                    >
                      {isLoading ? "Submitting..." : "Submit"}
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
