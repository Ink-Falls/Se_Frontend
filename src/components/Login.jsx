import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import logo from "/src/assets/ARALKADEMYLOGO.png";  // Adjust paths if needed
import icon from "/src/assets/ARALKADEMYICON.png";
import nstpLogo from "/src/assets/NSTPLOGO.png";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [captchaResponse, setCaptchaResponse] = useState(null); // Store reCAPTCHA response
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!captchaResponse) { // Check if reCAPTCHA is solved
            alert("Please verify the CAPTCHA to proceed.");
            return;
        }

        setError(null);

        try {
            const response = await fetch("http://localhost:4000/api/users/login", { // Correct URL
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, captchaResponse }), // Include captchaResponse
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                navigate("/Home");
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Login failed");
            }
        } catch (err) {
            console.error("Login request failed:", err);
            setError("An error occurred. Please try again.");
        }
    };

    const handleCaptchaChange = (value) => {
        setCaptchaResponse(value); // Store the reCAPTCHA response
    };

    const handleForgotPassword = () => {
        alert("Forgot Password functionality is not implemented yet.");
    };

    const handleEnroll = () => {
        navigate("/Enrollment");
    };

    return (
        <>
           {/* Background image with overlay */}
      <div
        className="min-h-screen bg-cover bg-center relative"
        style={{
          backgroundImage:
            "url(https://upload.wikimedia.org/wikipedia/commons/7/7b/400_Year_old_Beauty.jpg)",
        }}
      >
        {/* Semi-transparent black overlay */}
        <div className="absolute inset-0 bg-black opacity-30"></div>

        {/* Header section with navigation and title */}
        <header className="relative z-10 py-[3vw] px-[4vw] lg:py-[1.5vw] lg:px-[2vw] bg-[#121212] text-[#F6BA18] flex justify-between items-center shadow-xl">
          <div className="flex items-center">
            <img
              src={logo}
              alt="ARALKADEMY Logo"
              className="h-[5vw] lg:h-[2.5vw] mr-2"
            />
          </div>

          {/* Enroll button */}
          <button
            onClick={handleEnroll}
            className="text-[4vw] py-[1vw] px-[6vw] lg:text-[1vw] lg:py-[0.5vw] lg:px-[2vw] bg-[#F6BA18] text-[#212529] font-bold rounded-md hover:bg-[#64748B] hover:text-[#FFFFFF] transition-colors duration-300 ease-in-out"
          >
            Enroll
          </button>
        </header>

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          {/* Wrapper for left and right sections */}
          <div className="mt-[-10vw] sm:mt-[0vw] lg:mt-[-5vw] flex flex-col lg:flex-row items-center p-[2vw] rounded-lg gap-[15vw]">
            {/* Left side: Icons, Title, and description */}
            <div className="text-left lg:block hidden lg:mt-[-5vw]">
              <div className="flex items-center space-x-4]">
                <img
                  src={icon}
                  alt="AralKademy Icon"
                  className="h-[6vw] lg:h-[6vw]"
                />
                <img
                  src={nstpLogo}
                  alt="NSTP Logo"
                  className="h-[6vw] lg:h-[6vw]"
                />
              </div>
              <h1 className="text-[5vw] font-extrabold drop-shadow-[5px_5px_5px_rgba(0,0,0,0.8)]">
                <span className="text-[#F6BA18]">Aral</span>
                <span className="text-[#FFFFFF]">Kademy</span>
              </h1>
              <p className="text-[#FFFFFF] mt-[0vw] max-w-md drop-shadow-[3px_3px_3px_rgba(0,0,0,0.8)] text-[1.2vw]">
                Learning Management System for UST NSTP-LTS and Partner
                Communities
              </p>
            </div>

            {/* Right side: Login form */}
            <div className="p-[5vw] w-[80vw] lg:p-[3vw] lg:w-[30vw] bg-white rounded-lg shadow-2xl relative">
              {/* Yellow top border */}
              <div className="top-[0vw] left-[0vw] h-[1.5vw] lg:top-[0vw] lg:left-[0vw] lg:h-[0.5vw] absolute w-full bg-[#F6BA18] rounded-t-lg"></div>

              {/* Login form header */}
              <h2 className="text-[8vw] lg:text-[2.5vw] font-bold text-left text-[#212529]">
                Log In
              </h2>

              {/* Form instruction text */}
              <p className="text-[3vw] mb-[8vw] lg:mb-[1.5vw] lg:text-[0.8vw] text-[#64748B] text-left">
                Please fill in your login information to proceed
              </p>

              {/* Login form */}
              <form onSubmit={handleSubmit} className="space-y-[1vw]">
                 {/* Display error message */}
                {error && <p className="text-red-500 text-center">{error}</p>}
                {/* Email input */}
                <div>
                  <label
                    htmlFor="email"
                    className="text-[3vw] block text-[#64748B] lg:text-[0.8vw]"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-[1vw] text-[3vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] lg:text-[0.8vw] lg:px-[1vw] lg:py-[0.6vw] w-full border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Password input */}
                <div>
                  <label
                    htmlFor="password"
                    className="mt-[5vw] text-[3vw] lg:text-[0.8vw] lg:mt-[0vw] block text-[#64748B]"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-[1vw] text-[3vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] lg:text-[0.8vw] lg:px-[1vw] lg:py-[0.6vw] w-full border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]"
                    placeholder="Enter your password"
                  />
                </div>

                {/* Forgot password button */}
                <div className="text-right mt-[0.5vw]">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[3vw] lg:text-[0.8vw] text-[#64748B] hover:underline focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* CAPTCHA verification */}
                <div className="mt-[1vw] overflow-visible h-auto">
                  <div
                    style={{
                      transformOrigin: "left",
                      transform: "scale(0.8)",
                    }}
                  >
                    <ReCAPTCHA
                      sitekey="6Ldv39cqAAAAAML6O41KNyqN_sXx7sIOA245Hc1N"  // YOUR SITE KEY
                      onChange={handleCaptchaChange}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex justify-center mt-[0.5vw]">
                  <button
                    type="submit"
                    className="py-[2vw] px-[12vw] text-[4vw] mb-[2vw] mt-[2vw] lg:mb-[0vw] lg:mt-[0vw] lg:py-[0.6vw] lg:px-[4vw] lg:text-[1vw] bg-[#212529] text-[#FFFFFF] font-semibold rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 ease-in-out"
                    disabled={!captchaResponse} // Disable until reCAPTCHA is solved
                  >
                    Log In
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

export default Login;