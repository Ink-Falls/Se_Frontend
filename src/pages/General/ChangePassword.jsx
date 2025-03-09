import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "/src/assets/images/ARALKADEMYLOGO.png";
import { resetPassword } from "../../services/authService"; // Import function

function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/ForgotPassword");
    }
  }, [email]);

  const handleConfirm = async () => {
    if (!email) {
      setMessage("Error: No email found. Please restart the process.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match. Please try again.");
      return;
    }

    try {
      await resetPassword(email, password);
      setMessage("Password reset successfully! Redirecting...");
      navigate("/PasswordConfirm", { state: { passwordReset: true }, replace: true });
    } catch (error) {
      setMessage(error.message || "Failed to reset password. Please try again.");
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
        <img src={logo} alt="ARALKADEMY Logo" className="h-[5vw] lg:h-[2.5vw]" />
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
            Change password
          </h2>

          {/* New Password Input */}
          <div className="mt-[3vw] lg:mt-[1.5vw]">
            <label className="block text-[#64748B] text-[3vw] max-lg:text-[2.5vw] lg:text-[1vw] mb-[1vw]">
              New password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full px-[3vw] py-[1.5vw] lg:py-[1vw] text-[3vw] max-lg:text-[2vw] lg:text-[1vw] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F6BA18]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password Input */}
          <div className="mt-[3vw] lg:mt-[1.5vw]">
            <label className="block text-[#64748B] text-[3vw] max-lg:text-[2.5vw] lg:text-[1vw] mb-[1vw]">
              Confirm password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full px-[3vw] py-[1.5vw] lg:py-[1vw] text-[3vw] max-lg:text-[2vw] lg:text-[1vw] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F6BA18]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {message && <p className="text-red-500 mt-2">{message}</p>}

          {/* Confirm Button */}
          <div className="flex justify-end mt-[4vw] lg:mt-[2vw]">
            <button
              onClick={handleConfirm}
              className="py-[1.5vw] px-[7vw] text-[3.5vw] max-lg:text-[2.5vw] lg:py-[0.4vw] lg:px-[3vw] lg:text-[1vw] bg-[#212529] text-[#FFFFFF] font-semibold rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 ease-in-out"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
