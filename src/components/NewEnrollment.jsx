import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "/src/assets/ARALKADEMYLOGO.png";

function NewEnrollment() {
    // State to store form data
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        middleName: "",  // Keep this, even if optional
        contactNo: "",
        birthdate: "",
        schoolId: "",  // Changed to schoolId (match backend)
        yearLevel: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");  // For displaying error messages
    const [successMessage, setSuccessMessage] = useState(""); //for success message
    const [schools, setSchools] = useState([]); // To store the list of schools

    const navigate = useNavigate();

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Validate and format the contact number field
        if (name === "contactNo") {
          const formattedValue = value.replace(/\D/g, "").slice(0, 11); // Limit to 11 digits
          let formattedContactNo = formattedValue;
          if (formattedValue.length > 0) {
            formattedContactNo = formattedValue.replace(/^(\d{4})/, '$1-'); // Add - after first 4 digit
          }
          if (formattedValue.length > 4) {
            formattedContactNo = formattedContactNo.replace(/-(\d{3})/, '-$1-'); //Add - after the next 3 digits
          }
          // No need for a final replace, slice handled it
            setFormData((prevData) => ({
                ...prevData,
                [name]: formattedContactNo,
            }));
        } else {
            // Update other fields
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };
  // Fetch schools on component mount (useEffect)
    React.useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch("http://localhost:3000/schools"); // Assuming you have a /schools endpoint
        if (response.ok) {
          const data = await response.json();
          setSchools(data); // Assuming the response is an array of school objects
        } else {
          console.error("Failed to fetch schools:", response.status);
          setError("Failed to load school list. Please try again later.");
        }
      } catch (error) {
        console.error("Network error fetching schools:", error);
        setError("Network error. Please check your connection and try again.");
      }
    };
     fetchSchools();
  }, []); // Empty dependency array: run only once on mount


    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");  // Clear previous errors
        setSuccessMessage("");

        // Password confirmation check
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
       // Add basic client-side validation for contact number format (before sending to the server).
        if (!(/^09\d{9}$/).test(formData.contactNo.replace(/-/g, ""))) { // Remove hyphens for validation
            setError("Invalid contact number format.  Must start with 09 and be 11 digits.");
            return;
        }

        // Prepare data for sending to the backend (remove confirmPassword)
        const { confirmPassword, ...dataToSend } = formData;
        //Convert school name to id
        const selectedSchool = schools.find(school => school.name === formData.schoolId);
        if (!selectedSchool) {
          setError("Invalid school selected."); // Should not happen if dropdown is correct
          return;
        }

       const data = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formData.birthdate,  // Use the correct name
        contactNo: formData.contactNo.replace(/-/g, ""), //remove hypens
        schoolId: selectedSchool.id,  // Send school ID, not the name.
        yearLevel: formData.yearLevel,
        handledById: null, //  You'll probably handle this on the backend
        status: 'pending'    //  Default status
      };
        try {
            const response = await fetch("http://localhost:3000/enrollments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data), // Send the data
            });

            if (response.ok) {
                const responseData = await response.json(); //parse data
                console.log("Enrollment successful:", responseData);
                setSuccessMessage("You are now successfully enrolled!");
                // navigate("/success"); // Redirect to a success page, for example
            } else {
                const errorData = await response.json(); // Get error message
                setError(errorData.message || "Enrollment failed."); // Use the error message from server
            }
        } catch (error) {
            console.error("Network error:", error);
            setError("Network error. Please try again.");
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
                        className="text-[4vw] py-[1vw] px-[6vw] lg:text-[1vw] lg:py-[0.5vw] lg:px-[2vw] bg-[#F6BA18] text-[#212529] font-bold rounded-md hover:bg-[#64748B] hover:text-[#FFFFFF] transition-colors duration-300 ease-in-out"
                    >
                        Log In
                    </button>
                </header>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="mt-[5vw] lg:mt-[0vw] flex flex-col lg:flex-row items-center rounded-lg">
                        <div className="p-[5vw] w-[80vw] lg:p-[2vw] lg:w-[50vw] bg-white rounded-lg shadow-2xl relative">
                            <div className="top-[0vw] left-[0vw] h-[1.5vw] lg:top-[0vw] lg:left-[0vw] lg:h-[0.5vw] absolute w-full bg-[#F6BA18] rounded-t-lg"></div>
                            <h2 className="text-[8vw] lg:text-[2vw] font-bold text-left text-[#212529]">
                                Enrollment
                            </h2>
                            <p className="text-[3vw] mb-[5vw] lg:mb-[2vw] lg:text-[0.8vw] text-[#64748B] text-left">
                                Please enter all the necessary information to enroll
                            </p>
                             {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display errors */}
                             {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                            <form onSubmit={handleSubmit} className="space-y-[2vw]">
                                <div className="flex flex-wrap gap-[2vw]">
                                    {[
                                        {
                                            label: "First Name",
                                            name: "firstName",
                                            type: "text",
                                            required: true,
                                        },
                                        {
                                            label: "Last Name",
                                            name: "lastName",
                                            type: "text",
                                            required: true,
                                        },
                                        {
                                            label: "Middle Name",
                                            name: "middleName",
                                            type: "text",
                                            required: false, // Middle name is optional
                                        },
                                        {
                                            label: "Contact No.",
                                            name: "contactNo",
                                            type: "tel", // Use type="tel" for phone numbers
                                            required: true,
                                        },
                                        {
                                            label: "Birthdate",
                                            name: "birthdate",
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
                                            name: "confirmPassword",
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
                                                className="text-[3vw] block text-[#64748B] lg:text-[0.8vw]"
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
                                                className="mt-[1vw] text-[3vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] lg:text-[0.8vw] lg:px-[1vw] lg:py-[0.6vw] w-full border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]"
                                                placeholder={`Enter your ${field.label.toLowerCase()}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-[2vw]">
                                   <div className="w-[calc(50%-1vw)]">
                                    <label
                                      htmlFor="schoolId" // Changed to schoolId
                                      className="text-[3vw] block text-[#64748B] lg:text-[0.8vw]"
                                    >
                                      School
                                    </label>
                                    <select
                                       id="schoolId"
                                       name="schoolId"
                                       value={formData.schoolId}
                                       onChange={handleInputChange}
                                       required
                                       className="mt-[1vw] text-[3vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] lg:text-[0.8vw] lg:px-[1vw] lg:py-[0.6vw] w-full border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]"
                                     >
                                       <option value="" disabled>
                                        Select your school
                                      </option>
                                      {/* Populate options dynamically from fetched data */}
                                      {schools.map((school) => (
                                        <option key={school.id} value={school.name}>
                                          {school.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                    <div className="w-[calc(50%-1vw)]">
                                        <label
                                            htmlFor="yearLevel"
                                            className="text-[3vw] block text-[#64748B] lg:text-[0.8vw]"
                                        >
                                            Year Level
                                        </label>
                                        <select
                                            id="yearLevel"
                                            name="yearLevel"
                                            value={formData.yearLevel}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-[1vw] text-[3vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] lg:text-[0.8vw] lg:px-[1vw] lg:py-[0.6vw] w-full border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]"
                                        >
                                            <option value="" disabled>
                                                Select your year level
                                            </option>
                                            <option value="Freshman">Freshman</option>
                                            <option value="Sophomore">Sophomore</option>
                                            <option value="Junior">Junior</option>
                                            <option value="Senior">Senior</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end items-center w-full">
                                    <button
                                        type="submit"
                                        className="py-[1.5vw] px-[10vw] text-[3.5vw] mb-[2vw] mt-[2vw] lg:mb-[0.2vw] lg:mt-[0.2vw] lg:py-[0.4vw] lg:px-[2.5vw] lg:text-[1vw] bg-[#212529] text-[#FFFFFF] font-bold rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 ease-in-out"
                                    >
                                        Submit
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