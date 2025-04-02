import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "/src/assets/images/ARALKADEMYLOGO.png";
import { forgotPassword } from "../../services/authService"; // Adjust the path accordingly

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

  const validateEmail = (email) => {
    const validTLDs = ["com", "edu", "ph", "org", "net", "gov", "edu.ph"];

    if (!email) {
      return "Email is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }

    // Extract domain and check TLD
    const domain = email.split("@")[1];
    if (!validTLDs.some((tld) => domain.toLowerCase().endsWith(`.${tld}`))) {
      return "Please enter a valid email domain";
    }

    return null;
  };

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
      // Handle specific error cases
      if (
        error.response?.status === 404 ||
        error.message.includes("not found")
      ) {
        setMessage("Email address not found.");
      } else if (error.response?.status === 429) {
        setMessage("Too many attempts. Please try again later.");
      } else if (error.response?.status === 400) {
        setMessage("Invalid email format. Please enter a valid email address.");
      } else {
        setMessage("Something went wrong. Please try again later.");
      }
      console.error("Forgot password error:", error);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url(https://upload.wikimedia.org/wikipedia/commons/7/7b/400_Year_old_Beauty.jpg)",
      }}
    >
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

      <div className="flex items-center justify-center min-h-screen">
        <div className="p-[4vw] max-lg:p-[7vw] w-[80vw] lg:w-[40vw] bg-white rounded-lg shadow-2xl relative">
          <div className="top-0 left-0 h-[1.5vw] lg:h-[0.5vw] w-full bg-[#F6BA18] rounded-t-lg absolute"></div>
          <h2 className="text-[8vw] lg:text-[2.5vw] max-lg:text-[5vw] font-bold text-[#212529]">
            Forgot password?
          </h2>
          <p className="text-[3vw] mb-[5vw] lg:mb-[2vw] max-lg:text-[2.5vw] lg:text-[1vw] text-[#64748B]">
            Enter your email below and wait for a password reset link.
          </p>
          <input
            type="email"
            placeholder="Email"
            className={`w-full px-[3vw] py-[1.5vw] lg:py-[1vw] max-lg:text-[2.5vw] border ${
              !isValidEmail && touched ? "border-red-500" : "border-gray-300"
            } rounded-md focus:ring-2 focus:ring-[#F6BA18]`}
            value={email}
            onChange={handleEmailChange}
            onBlur={() => setTouched(true)}
          />
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
  );
}

export default ForgotPassword;
