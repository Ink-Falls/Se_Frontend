import React, { useState } from "react";
import { requestNumericCode } from "../../services/authService";
import { QRCodeSVG } from "qrcode.react";

function NumericCodeGenerator() {
  const [studentEmail, setStudentEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [codeData, setCodeData] = useState(null);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Student email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(studentEmail);

    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await requestNumericCode(studentEmail);
      setCodeData(data);
    } catch (err) {
      console.error("Code generation failed:", err);
      setError(err.message || "Failed to generate code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNew = () => {
    setCodeData(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-[#212529] mb-4">
        Generate Student Login Code
      </h2>
      <p className="text-[#64748B] mb-4">
        Generate a 6-digit code for student login
      </p>

      {codeData ? (
        <div className="text-center">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Login Code:</h3>
            <div className="text-4xl font-bold mb-4 tracking-widest">
              {codeData.code}
            </div>
            <div className="text-sm text-gray-500 mb-6">
              This code will expire in 15 minutes
            </div>

            <h3 className="text-lg font-semibold mb-2">QR Code:</h3>
            <div className="flex justify-center mb-4">
              <QRCodeSVG
                value={
                  codeData.qrCodeUrl ||
                  `${window.location.origin}/login?code=${codeData.code}`
                }
                size={200}
                level="H"
              />
            </div>
            <p className="text-sm text-gray-500">
              Student: <span className="font-semibold">{studentEmail}</span>
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleGenerateNew}
              className="py-2 px-4 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors"
            >
              Generate Another Code
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}

          <div>
            <label
              htmlFor="student-email"
              className="block text-[#64748B] mb-1"
            >
              Student Email
            </label>
            <input
              type="email"
              id="student-email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F6BA18]"
              placeholder="Enter student email"
            />
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="flex items-center justify-center min-w-[14rem] px-6 py-3 
                font-semibold rounded-md transition-colors duration-300
                text-white bg-[#212529] hover:bg-[#F6BA18] hover:text-[#212529]
                disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Generating...</span>
                </div>
              ) : (
                "Generate Code"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default NumericCodeGenerator;
