import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "/src/assets/images/ARALKADEMYLOGO.png";
import { verifyResetCode } from "../../services/authService"; // Import function

function EnterCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/ForgotPassword");
    }
  }, [email]);

  const handleVerifyCode = async () => {
    if (!code) {
      setMessage("Please enter the verification code.");
      return;
    }

    if (!email) {
      setMessage("Error: No email found. Please restart the process.");
      return;
    }

    try {
      await verifyResetCode(email, code);
      setMessage("Code verified! Redirecting...");
      navigate("/ChangePassword", { state: { email }, replace: true }); 
    } catch (error) {
      setMessage(error.message || "Invalid code. Please try again.");
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
      {/* Header */}
      <header className="py-[3vw] px-[4vw] lg:py-[1.5vw] lg:px-[2vw] bg-[#121212] text-[#F6BA18] flex justify-between items-center shadow-xl">
        <img
          src={logo}
          alt="ARALKADEMY Logo"
          className="h-[5vw] lg:h-[2.5vw]"
        />
        <button
          onClick={() => navigate("/enroll")}
          className="text-[4vw] py-[1vw] px-[6vw] lg:text-[1vw] max-lg:text-[2.5vw] lg:py-[0.5vw] lg:px-[2vw] bg-[#F6BA18] text-[#212529] font-bold rounded-md hover:bg-[#64748B] hover:text-white transition duration-300"
        >
          Enroll
        </button>
      </header>

      {/* Content Box */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-[4vw] max-lg:p-[7vw] w-[80vw] lg:w-[40vw] bg-white rounded-lg shadow-2xl relative">
          <div className="top-0 left-0 h-[1.5vw] lg:h-[0.5vw] w-full bg-[#F6BA18] rounded-t-lg absolute"></div>
          <h2 className="text-[8vw] lg:text-[2.5vw] max-lg:text-[5vw] font-bold text-[#212529]">
            Enter Verification Code
          </h2>
          <p className="text-[3vw] mb-[5vw] lg:mb-[2vw] max-lg:text-[2.5vw] lg:text-[1vw] text-[#64748B]">
            Please enter the 6-digit code sent to your email.
          </p>

          {/* Code Input */}
          <input
            type="text"
            placeholder="Enter code"
            className="w-full px-[3vw] py-[1.5vw] lg:py-[1vw] text-[3vw] max-lg:text-[2vw] lg:text-[1vw] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F6BA18] text-center"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {message && <p className="text-red-500 mt-2">{message}</p>}

          {/* Verify Button */}
          <div className="flex justify-end mt-[4vw] lg:mt-[2vw]">
            <button
              onClick={handleVerifyCode}
              className="py-[1.5vw] px-[7vw] text-[3.5vw] max-lg:text-[2.5vw] lg:py-[0.4vw] lg:px-[3vw] lg:text-[1vw] bg-[#212529] text-[#FFFFFF] font-semibold rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 ease-in-out"
            >
              Verify Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnterCode;
