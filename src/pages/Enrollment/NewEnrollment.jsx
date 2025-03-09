import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/ARALKADEMYLOGO.png";

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

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");
    setIsLoading(true);

    const clientErrors = {};

    if (formData.password !== formData.confirm_password) {
      clientErrors.confirm_password = "Passwords do not match.";
    }

    // Improved client-side contact number validation
    const cleanedContactNo = formData.contact_no.replace(/[-\s()]/g, "");
    if (!/^(?:\+63|0)\d{10}$/.test(cleanedContactNo)) {
      clientErrors.contact_no =
        "Invalid contact number. Must be 11 digits and start with 09 or +639.";
    }

    if (formData.middle_initial.length > 3) {
      clientErrors.middle_initial =
        "Middle initial must be at most 3 characters.";
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setIsLoading(false);
      return;
    }

    const dataToSend = {
      ...formData,
      contact_no: formData.contact_no.replace(/[-\s()]/g, ""), // Remove hyphens, spaces, and parentheses
    };

    try {
      const response = await fetch("http://localhost:4000/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Enrollment successful:", responseData);
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
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          setErrors({
            email: "Email already exists. Please use a different email.",
          });
        } else if (response.status === 400 && errorData.errors) {
          setErrors(errorData.errors);
        } else {
          setErrors({ general: errorData.message || "Enrollment failed." });
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="min-h-screen bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://upload.wikimedia.org/wikipedia/commons/7/7b/400_Year_old_Beauty.jpg)",
        }}
      >
        <header className="py-[3vw] px-[4vw] lg:py-[1.5vw] lg:px-[2vw] bg-[#121212] text-[#F6BA18] flex justify-between items-center shadow-xl">
          <div className="flex items-center">
            <img
              src={logo}
              alt="ARALKADEMY Logo"
              className="h-[5vw] lg:h-[2.5vw] mr-2"
            />
          </div>

          <button
            onClick={() => navigate("/Login")}
            className="text-[4vw] py-[1vw] px-[6vw] lg:text-[1vw] max-lg:text-[2.5vw] lg:py-[0.5vw] lg:px-[2vw] bg-[#F6BA18] text-[#212529] font-bold rounded-md hover:bg-[#64748B] hover:text-[#FFFFFF] transition-colors duration-300 ease-in-out"
          >
            Log In
          </button>
        </header>
        <div className="flex items-center justify-center min-h-screen">
          <div className="mt-[5vw] lg:mt-[0vw] flex flex-col lg:flex-row items-center rounded-lg">
            <div className="p-[10vw] max-lg:p-[9vw] max-w-[90vw] w-[90vw] lg:p-[2vw] lg:max-w-[60vw] my-[2vw] lg:w-[80vw] bg-white rounded-lg shadow-2xl relative">
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
                      <input
                        type={field.type}
                        id={field.name}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        required={field.required}
                        className="mt-[1vw] text-[3vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] max-lg:text-[2.5vw] lg:text-[0.8vw] lg:px-[1vw] lg:py-[0.6vw] w-full border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]"
                        placeholder={`Enter your ${field.label.toLowerCase()}`}
                      />
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
                      <option value="1003">
                        De la Salle University (DLSU)
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
                    className="py-[1.5vw] px-[10vw] text-[3.5vw] mb-[2vw] max-lg:text-[2.5vw] mt-[3vw] lg:mb-[0.2vw] lg:mt-[0.vw] lg:py-[0.4vw] lg:px-[2.5vw] lg:text-[1vw] bg-[#212529] text-[#FFFFFF] font-bold rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 ease-in-out"
                    disabled={isLoading}
                  >
                    {isLoading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NewEnrollment;
