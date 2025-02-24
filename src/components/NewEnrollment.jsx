// NewEnrollment.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "/src/assets/ARALKADEMYLOGO.png";

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

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact_no") {
      const formattedValue = value.replace(/\D/g, "").slice(0, 11);
      let formattedContactNo = formattedValue;
      if (formattedValue.length > 0) {
        formattedContactNo = formattedValue.replace(/^(\d{4})/, "$1-");
      }
      if (formattedValue.length > 4) {
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
    // Clear any existing error for the current field
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    // Client-side validation (BEFORE sending to the server)
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match."); // Frontend error
      setIsLoading(false);
      return; // Stop here if passwords don't match (client-side)
    }

    if (!/^(?:\+63|0)?9\d{9}$/.test(formData.contact_no.replace(/-/g, ""))) {
      setError(
        "Invalid contact number. Must start with 09 or +63, and have 11 digits."
      );
      setIsLoading(false);
      return;
    }

    if (formData.middle_initial.length > 3) {
      setError("Middle initial must be at most 3 characters.");
      setIsLoading(false);
      return;
    }

    // --- IMPORTANT FIX: Send ALL data, including confirm_password ---
    // DO NOT remove confirm_password here.  Send it to the backend for validation.
    // The backend service will remove it before saving.
    const dataToSend = {
      ...formData, // Include all form data
      contact_no: formData.contact_no.replace(/-/g, ""), // Remove hyphens
    }; // Send the entire formData object.

    try {
      const response = await fetch("http://localhost:4000/api/enrollment", {
        //Corrected
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend), // Send ALL data (including confirm_password)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Enrollment successful:", responseData);
        setSuccessMessage("Enrollment submitted successfully!");
        setFormData({
          // Reset form
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
        // navigate("/success");
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          setError("Email already exists. Please use a different email.");
        } else if (response.status === 400 && errorData.errors) {
          // Display all validation errors from the server
          let errorMessage = "";
          for (const field in errorData.errors) {
            errorMessage += errorData.errors[field] + " ";
          }
          setError(errorMessage.trim());
        } else {
          setError(errorData.message || "Enrollment failed.");
                     setErrors({ general: errorData.message || "Enrollment failed." }); // Set general error

                }
            }
        } catch (error) {
            console.error("Network error:", error);
            setErrors({ general: "Network error. Please try again." }); // Set general error for network issues
        } finally {
            setIsLoading(false);

        }
      }
    } catch (error) {
      console.error("Network error:", error);
      setError("Network error. Please try again.");
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
            <div className="p-[5vw] w-[80vw] lg:p-[2vw] lg:w-[50vw] bg-white rounded-lg shadow-2xl relative">
              <div className="top-[0vw] left-[0vw] h-[1.5vw] lg:top-[0vw] lg:left-[0vw] lg:h-[0.5vw] absolute w-full bg-[#F6BA18] rounded-t-lg"></div>
              <h2 className="text-[8vw] lg:text-[2vw] max-lg:text-[6vw] font-bold text-left text-[#212529]">
                Enrollment
              </h2>
              <p className="text-[3vw] mb-[5vw] lg:mb-[2vw] max-lg:text-[2.5vw] lg:text-[0.8vw] text-[#64748B] text-left">
                Please enter all the necessary information to enroll
              </p>
              {error && <p className="text-red-500">{error}</p>}
              {successMessage && (
                <p className="text-green-500">{successMessage}</p>
              )}
              <form onSubmit={handleSubmit} className="space-y-[2vw]">
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
                        className="text-[3vw] max-lg:mt-[2vw] max-lg:text-[2.5vw] block text-[#64748B] lg:text-[0.8vw]"
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
                        className="mt-[1vw] max-lg:mt-[2vw] text-[3vw] max-lg:text-[2.5vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] lg:text-[0.8vw] lg:px-[1vw] lg:py-[0.6vw] w-full border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]"
                        placeholder={`Enter your ${field.label.toLowerCase()}`}
                      />
                                             {/* Display field-specific error message */}
                                            {errors[field.name] && <p className="text-red-500">{errors[field.name]}</p>}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-[2vw]">
                                    <div className="w-full lg:w-[calc(50%-1vw)]">
                                        <label htmlFor="school_id" className="text-[3vw] block text-[#64748B] lg:text-[0.8vw]">
                                            School
                                        </label>
                                        <select
                                            id="school_id"
                                            name="school_id"
                                            value={formData.school_id}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-[1vw] text-[3vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] lg:text-[0.8vw] lg:px-[1vw] lg:py-[0.6vw] w-full border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]"
                                        >
                                             <option value="" disabled>Select your school</option>
                                            <option value="1001">Asuncion Consunji Elementary School (ACES)</option>
                                            <option value="1002">University of Santo Tomas (UST)</option>
                                            <option value="1003">De la Salle University (DLSU)</option>
                                        </select>
                                    </div>
                                    <div className="w-full lg:w-[calc(50%-1vw)]">
                                        <label htmlFor="year_level" className="text-[3vw] block text-[#64748B] lg:text-[0.8vw]">
                                            Year Level
                                        </label>
                                        <select
                                            id="year_level"
                                            name="year_level"
                                            value={formData.year_level}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-[1vw] text-[3vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] lg:text-[0.8vw] lg:px-[1vw] lg:py-[0.6vw] w-full border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]"
                                        >
                                            <option value="" disabled>Select your year level</option>
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
                                        className="py-[1.5vw] px-[10vw] text-[3.5vw] mb-[2vw] mt-[2vw] lg:mb-[0.2vw] lg:mt-[0.2vw] lg:py-[0.4vw] lg:px-[2.5vw] lg:text-[1vw] bg-[#212529] text-[#FFFFFF] font-bold rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 ease-in-out"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Submitting..." : "Submit"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-[2vw]">
                  <div className="w-full lg:w-[calc(50%-1vw)]">
                    <label
                      htmlFor="school_id"
                      className="text-[3vw] max-lg:mt-[2vw] max-lg:text-[2.5vw] block text-[#64748B] lg:text-[0.8vw]"
                    >
                      School
                    </label>
                    <select
                      id="school_id"
                      name="school_id"
                      value={formData.school_id}
                      onChange={handleInputChange}
                      required
                      className="mt-[1vw] max-lg:mt-[2vw] text-[3vw] max-lg:text-[2.5vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] lg:text-[0.8vw] lg:px-[1vw] lg:py-[0.6vw] w-full border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]"
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
                      className="text-[3vw] max-lg:mt-[2vw] max-lg:text-[2.5vw] block text-[#64748B] lg:text-[0.8vw]"
                    >
                      Year Level
                    </label>
                    <select
                      id="year_level"
                      name="year_level"
                      value={formData.year_level}
                      onChange={handleInputChange}
                      required
                      className="mt-[1vw] max-lg:mt-[2vw] text-[3vw] max-lg:text-[2.5vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] lg:text-[0.8vw] lg:px-[1vw] lg:py-[0.6vw] w-full border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]"
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
                    className="py-[1.5vw] px-[10vw] text-[3.5vw] max-lg:text-[2.5vw] mb-[2vw] mt-[2vw] lg:mb-[0.2vw] lg:mt-[0.2vw] lg:py-[0.4vw] lg:px-[2.5vw] lg:text-[1vw] bg-[#212529] text-[#FFFFFF] font-semibold rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 ease-in-out"
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
