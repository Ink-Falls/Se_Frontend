import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "/src/assets/images/ARALKADEMYLOGO.png";
import { forgotPassword } from "../../services/authService";
import { validateEmail } from "../../utils/validationUtils";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [touched, setTouched] = useState(false);

  // Add validation effect
  useEffect(() => {
    if (touched) {
      const emailError = validateEmail(email);
      setIsValidEmail(!emailError);
      setMessage(emailError || "");
    }
  }, [email, touched]);

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setTouched(true);
  };

  const handleForgotPassword = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setMessage(emailError);
      setIsValidEmail(false);
      return;
    }

    try {
      await forgotPassword(email);
      setMessage("Password reset code sent! Check your email.");
      setIsValidEmail(true);
      navigate("/VerifyCode", { state: { email } });
    } catch (error) {
      setIsValidEmail(false);
      if (
        error.response?.status === 404 ||
        error.message.includes("not found")
      ) {
        setMessage("Email address not found.");
      } else {
        setMessage("Something went wrong. Please try again later.");
      }
      console.error("Forgot password error:", error);
    }
  };

  return (
    // Add overlay div similar to login page
    <div className="relative min-h-screen">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-30"></div>

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center -z-10"
        style={{
          backgroundImage:
            "url(https://upload.wikimedia.org/wikipedia/commons/7/7b/400_Year_old_Beauty.jpg)",
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10">
        <header className="py-[3vw] px-[4vw] lg:py-[1.5vw] lg:px-[2vw] bg-[#121212] text-[#F6BA18] flex justify-between items-center shadow-xl">
          <img
            src={logo}
            alt="ARALKADEMY Logo"
            className="h-[5vw] lg:h-[2.5vw]"
          />
          <button
            onClick={() => navigate("/enrollment")}
            className="text-[4vw] py-[1vw] px-[6vw] lg:text-[1vw] max-lg:text-[2.5vw] lg:py-[0.5vw] lg:px-[2vw] bg-[#F6BA18] text-[#212529] font-bold rounded-md hover:bg-[#64748B] hover:text-white transition duration-300"
          >
            Enroll
          </button>
        </header>

        <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.20))]">
          <div className="p-[4vw] max-lg:p-[7vw] w-[80vw] lg:w-[40vw] bg-white rounded-lg shadow-2xl relative">
            <div className="top-0 left-0 h-[1.5vw] lg:h-[0.5vw] w-full bg-[#F6BA18] rounded-t-lg absolute"></div>
            <h2 className="text-[8vw] lg:text-[2.5vw] max-lg:text-[5vw] font-bold text-[#212529]">
              Forgot password?
            </h2>
            <p className="text-[3vw] mb-[5vw] lg:mb-[2vw] max-lg:text-[2.5vw] lg:text-[1vw] text-[#64748B]">
              Enter your email below and wait for a password reset link.
            </p>
            <div>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className={`mt-[1vw] text-[3vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] lg:text-[0.8vw] max-lg:text-[2.5vw] lg:px-[1vw] lg:py-[0.6vw] w-full border ${
                  !isValidEmail && touched
                    ? "border-red-500 ring-1 ring-red-500"
                    : "border-[#64748B]"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]`}
                value={email}
                onChange={handleEmailChange}
                onBlur={() => setTouched(true)}
              />
            </div>
            {touched && message && (
              <p
                className={`mt-2 text-sm ${
                  !isValidEmail ? "text-red-500" : "text-green-500"
                }`}
              >
                {message}
              </p>
            )}
            <div className="flex justify-end mt-[4vw] lg:mt-[2vw]">
              <button
                onClick={handleForgotPassword}
                className="py-[1.5vw] px-[7vw] text-[3.5vw] max-lg:text-[2.5vw] lg:py-[0.4vw] lg:px-[3vw] lg:text-[1vw] bg-[#212529] text-white font-semibold rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition duration-300"
              >
                Send code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
