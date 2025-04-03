import React, { useState, useRef, useEffect } from "react";
import { verifyMagicLinkToken } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function NumericCodeLogin() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRefs = useRef([]);

  // Create refs for the inputs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto advance to next input when a digit is entered
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && index > 0 && code[index] === "") {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join("");

    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits of the code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use the same verification endpoint as magic links
      const response = await verifyMagicLinkToken(fullCode);

      // Handle both response structures
      if (response) {
        // Store access token (handle both formats)
        if (response.tokens?.accessToken) {
          localStorage.setItem("accessToken", response.tokens.accessToken);
        } else if (response.token) {
          localStorage.setItem("accessToken", response.token);
        } else {
          throw new Error("No access token found in response");
        }

        // Store refresh token (handle both formats)
        if (response.tokens?.refreshToken) {
          localStorage.setItem("refreshToken", response.tokens.refreshToken);
        } else if (response.refreshToken) {
          localStorage.setItem("refreshToken", response.refreshToken);
        } else {
          throw new Error("No refresh token found in response");
        }

        // Store user data if available
        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));
        }

        await checkAuth();

        // Determine correct dashboard based on user role
        if (response.user) {
          const role = response.user.role?.toLowerCase();
          let dashboardRoute = "/Learner/Dashboard";

          if (role === "admin") {
            dashboardRoute = "/Admin/Dashboard";
          } else if (role === "teacher" || role === "student_teacher") {
            dashboardRoute = "/Teacher/Dashboard";
          }

          navigate(dashboardRoute, { replace: true });
        } else {
          // Default navigation if no user data
          navigate("/Learner/Dashboard", { replace: true });
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Code verification failed:", err);
      setError("Invalid code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-[1vw]">
      {error && (
        <p className="text-red-500 text-center text-[3vw] lg:text-[0.8vw] max-lg:text-[2.5vw]">
          {error}
        </p>
      )}

      <div>
        <div className="flex justify-center gap-2 lg:gap-4">
          {code.map((digit, index) => (
            <input
              key={index}
              type="text"
              ref={(el) => (inputRefs.current[index] = el)}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-[10vw] h-[12vw] lg:w-[3vw] lg:h-[4vw] xl:w-[2.5vw] xl:h-[3.5vw] text-[3vw] lg:text-[1vw] xl:text-[0.8vw] max-lg:text-[2.5vw] border-2 border-[#64748B] rounded-md text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#F6BA18] focus:border-[#F6BA18]"
            />
          ))}
        </div>
      </div>

      {/* Spacer div that only appears on mobile */}
      <div className="h-[3vw] md:h-[0vw]"></div>

      <div className="flex justify-center mt-[4vw] lg:mt-[2vw]">
        <button
          type="submit"
          className={`flex items-center justify-center min-w-[10rem] max-w-[10rem] px-6 py-3 mt-3 
          font-semibold rounded-md transition-colors duration-300 flex-shrink-0
          text-white bg-[#212529] hover:bg-[#F6BA18] hover:text-[#212529] dark:bg-gray-900 dark:hover:bg-yellow-400
          disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-300`}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white">
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
              <span className="animate-pulse text-sm md:text-base">
                Logging in...
              </span>
            </div>
          ) : (
            <span className="text-xs sm:text-sm md:text-base lg:text-base">
              Log In
            </span>
          )}
        </button>
      </div>
    </form>
  );
}

export default NumericCodeLogin;
