import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "/src/assets/ARALKADEMYLOGO.png";

function Enrollment() {
  const [email, setEmail] = useState(""); // State to store the email input value
  const navigate = useNavigate(); // Hook for navigation between pages

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    console.log("Email:", email); // Log the email entered by the user
  };

  return (
    <>
      {/* Page container with a background image */}
      <div
        className="min-h-screen bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://upload.wikimedia.org/wikipedia/commons/7/7b/400_Year_old_Beauty.jpg)",
        }}
      >
        {/* Header with logo and navigation button */}
        <header className="py-[3vw] px-[4vw] lg:py-[1.5vw] lg:px-[2vw] bg-[#121212] text-[#F6BA18] flex justify-between items-center shadow-xl">
          <div className="flex items-center">
            <img
              src={logo}
              alt="ARALKADEMY Logo"
              className="h-[5vw] lg:h-[2.5vw] mr-2"
            />
          </div>

          {/* Log In button */}
          <button
            onClick={() => navigate("/Login")} // Navigate to the Login page on click
            className="text-[4vw] py-[1vw] px-[6vw] lg:text-[1vw] max-lg:text-[2.5vw] lg:py-[0.5vw] lg:px-[2vw] bg-[#F6BA18] text-[#212529] font-bold rounded-md hover:bg-[#64748B] hover:text-[#FFFFFF] transition-colors duration-300 ease-in-out"
          >
            Log In
          </button>
        </header>

        {/* Main content area */}
        <div className="flex items-center justify-center min-h-screen">
          {/* Wrapper for the enrollment options */}
          <div className="mt-[-15vw] sm:mt-[5vw] lg:mt-[-10vw] flex flex-col lg:flex-row items-center rounded-lg gap-[5vw]">
            {/* New Enrollee section */}
            <div className="p-[5vw] max-lg:p-[7vw] w-[80vw] lg:h-[13.5vw] lg:mt-[-1vw] lg:p-[2.5vw] lg:w-[30vw] bg-white rounded-lg shadow-2xl relative">
              {/* Highlighted top border */}
              <div className="top-[0vw] left-[0vw] h-[1.5vw] lg:top-[0vw] lg:left-[0vw] lg:h-[0.5vw] absolute w-full bg-[#F6BA18] rounded-t-lg"></div>

              {/* Section header */}
              <h2 className="text-[8vw] lg:text-[2vw] max-lg:text-[6vw] font-bold text-left text-[#212529]">
                New Enrollee?
              </h2>

              {/* Description text */}
              <p className="text-[3vw] mb-[5vw] lg:mb-[2.5vw] lg:text-[0.8vw] max-lg:text-[2.5vw] text-[#64748B] text-left">
                Click enroll below to begin your enrollment process
              </p>

              {/* Enrollment form */}
              <form onSubmit={handleSubmit} className="space-y-[1vw]">
                <div className="flex justify-between items-center mt-[0.5vw] w-full">
                  {/* Enroll button */}
                  <button
                    type="submit"
                    onClick={() => navigate("/Enrollment/New")}
                    className="py-[1.5vw] px-[7vw] text-[3.5vw] max-lg:text-[2.5vw] mb-[2vw] mt-[2vw] lg:mb-[0vw] lg:mt-[0vw] lg:py-[0.4vw] lg:px-[2.5vw] lg:text-[1vw] bg-[#212529] text-[#FFFFFF] font-bold rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 ease-in-out"
                  >
                    Enroll
                  </button>
                </div>
              </form>
            </div>

            {/* Enrollment Status Tracker section */}
            <div className="p-[2.5vw] max-lg:p-[7vw] w-[80vw] lg:w-[30vw] bg-white rounded-lg shadow-2xl relative">
              {/* Highlighted top border */}
              <div className="top-[0vw] left-[0vw] h-[1.5vw] lg:top-[0vw] lg:left-[0vw] lg:h-[0.5vw] absolute w-full bg-[#F6BA18] rounded-t-lg"></div>

              {/* Section header */}
              <h2 className="text-[8vw] lg:text-[2vw] max-lg:text-[6vw] font-bold text-left text-[#212529]">
                Enrollment Status Tracker
              </h2>

              {/* Description text */}
              <p className="text-[3vw] mb-[5vw] lg:mb-[2vw] lg:text-[0.8vw] max-lg:text-[2.5vw] text-[#64748B] text-left">
                Please enter your email address to check your enrollment status
              </p>

              {/* Email input form */}
              <form onSubmit={handleSubmit} className="space-y-[2vw]">
                <div>
                  {/* Email input field */}
                  <label
                    htmlFor="email"
                    className="text-[3vw] block text-[#64748B] lg:text-[0.8vw] max-lg:text-[2.5vw]"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-[1vw] text-[3vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] lg:text-[0.8vw] max-lg:text-[2.5vw] lg:px-[1vw] lg:py-[0.6vw] w-full border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="flex justify-between items-center w-full">
                  {/* Check status button */}
                  <button
                    type="submit"
                    className="py-[1.5vw] px-[7vw] text-[3.5vw] max-lg:text-[2.5vw] mb-[2vw] mt-[2vw] lg:mb-[0.2vw] lg:mt-[0.2vw] lg:py-[0.4vw] lg:px-[2.5vw] lg:text-[1vw] bg-[#212529] text-[#FFFFFF] font-semibold rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 ease-in-out"
                  >
                    Check
                  </button>

                  <div className="flex flex-row items-start ml-[2vw]">
                    {/* Status label */}
                    <h2 className="text-[2.5vw] mr-[2vw] mt-[2.5vw] mb-[1vw] lg:text-[1vw] lg:mr-[0.5vw] lg:mt-[1vw] font-semibold text-left text-[#212529]">
                      Status:
                    </h2>
                    {/* Default status message */}
                    <p className="py-[1vw] px-[4vw] text-[3.5vw] max-lg:text-[2.5vw] mb-[2vw] mt-[2vw] lg:mb-[0vw] lg:mt-[0.8vw] lg:py-[0.4vw] lg:px-[1.5vw] lg:text-[0.8vw] bg-[#F6BA18] text-[#212529] font-semibold rounded-md">
                      Unknown
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Enrollment;
