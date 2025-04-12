// src/pages/Login/Login.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { loginUser } from "../../services/authService";
import { RECAPTCHA_SITE_KEY } from "../../utils/constants";
import logo from "../../assets/images/ARALKADEMYLOGO.png";
import icon from "../../assets/images/ARALKADEMYICON.png";
import nstpLogo from "../../assets/images/NSTPLOGO.png";
import { Eye, EyeOff, Key, Mail, Hash, Image } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext"; // Import useTheme hook
import MagicLinkLogin from "../Auth/MagicLinkLogin";
import NumericCodeLogin from "../Auth/NumericCodeLogin";
import PictureCodeLogin from "../Auth/PictureCodeLogin";

/**
 * Login component for user authentication.
 *
 * @component
 * @returns {JSX.Element} The Login page JSX.
 */
function Login() {
  // Get theme state
  const { isDarkMode } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaResponse, setCaptchaResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState("password"); // 'password', 'magic-link', 'numeric-code', or 'picture-code'
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({ email: false, password: false });
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const { checkAuth } = useAuth();

  // Validate when form values change
  useEffect(() => {
    if (touched.email) {
      const emailError = validateEmail(email);
      setValidationErrors((prev) => ({ ...prev, email: emailError }));
    }

    if (touched.password) {
      const passwordError = validatePassword(password);
      setValidationErrors((prev) => ({ ...prev, password: passwordError }));
    }
  }, [email, password, touched]);

  /**
   * Resets the reCAPTCHA component.
   * @function
   */
  const resetRecaptcha = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
    setCaptchaResponse(null);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }
    return null;
  };

  // Handle input blur to mark fields as touched
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  /**
   * Handles form submission for user login.
   *
   * @async
   * @function handleSubmit
   * @param {Event} e - The form submission event.
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    // Validate inputs before proceeding
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    const newValidationErrors = {
      email: emailError,
      password: passwordError,
    };

    setValidationErrors(newValidationErrors);

    if (emailError || passwordError) {
      return;
    }

    // In a testing environment, we can bypass captcha validation
    if (
      process.env.NODE_ENV !== "test" &&
      !captchaResponse &&
      !window.captchaResponse
    ) {
      setError("Please verify the CAPTCHA");
      return;
    }

    setLoading(true);

    try {
      // First attempt login
      const loginData = await loginUser(
        email,
        password,
        captchaResponse ||
          (window.captchaResponse
            ? window.captchaResponse
            : "test-captcha-response")
      );

      if (!loginData.token || !loginData.user) {
        throw new Error("Invalid login response");
      }

      // Wait a moment for token to be saved
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update auth context
      const authResult = await checkAuth();

      // Check if we have a valid user object
      if (!authResult.user) {
        throw new Error("No user data received");
      }

      const userRole = loginData.user.role?.toLowerCase();
      const dashboardRoutes = {
        admin: "/Admin/Dashboard",
        teacher: "/Teacher/Dashboard",
        student_teacher: "/Teacher/Dashboard",
        learner: "/Learner/Dashboard",
      };

      const route = dashboardRoutes[userRole];
      if (!route) {
        throw new Error(`Invalid user role: ${userRole}`);
      }
      navigate(route, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed. Please try again.");
      resetRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles changes to the reCAPTCHA response.
   *
   * @function handleCaptchaChange
   * @param {string} value - The reCAPTCHA response value.
   */
  const handleCaptchaChange = (value) => {
    setCaptchaResponse(value);
  };

  /**
   * Handles the "Forgot Password" button click.
   *  Placeholder function, now navigates to /forgot-password route.
   * @function handleForgotPassword
   */
  const handleForgotPassword = () => {
    navigate("/ForgotPassword"); // Navigate to the forgot password page.
  };

  /**
   * Handles the "Enroll" button click.
   *
   * @function handleEnroll
   */
  const handleEnroll = () => {
    navigate("/Enrollment");
  };

  /**
   * Handles the password visibility toggle.
   *
   * @function handleTogglePassword
   */
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
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
              className="h-[8vw] md:h-[5vw] lg:h-[2.5vw] mr-2"
            />
          </div>

          {/* Enroll button */}
          <button
            onClick={handleEnroll}
            className="text-[4vw] py-[1.5vw] px-[6vw] md:text-[3vw] md:py-[1vw] md:px-[4vw] lg:text-[1vw] lg:py-[0.5vw] lg:px-[2vw] bg-[#F6BA18] text-[#212529] font-bold rounded-md hover:bg-[#64748B] hover:text-[#FFFFFF] transition-colors duration-300 ease-in-out"
          >
            Enroll
          </button>
        </header>

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          {/* Wrapper for left and right sections */}
          <div className="mt-[2vw] lg:mt-[2vw] flex flex-col lg:flex-row items-center p-[2vw] rounded-lg gap-[15vw]">
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
              <h1 className="text-[5vw] font-extrabold drop-shadow-[3px_3px_3px_rgba(0,0,0,0.8)]">
                <span className="text-[#F6BA18]">Aral</span>
                <span className="text-[#FFFFFF]">Kademy</span>
              </h1>
              <p className="text-[#FFFFFF] mt-[0vw] max-w-md drop-shadow-[3px_3px_3px_rgba(0,0,0,0.8)] text-[1.2vw]">
                Learning Management System for UST NSTP-LTS and Partner
                Communities
              </p>
            </div>

            {/* Right side: Login form - Add dark mode styles */}
            <div className="p-[5vw] max-lg:p-[7vw] w-[80vw] lg:p-[3vw] lg:w-[30vw] bg-white dark:bg-gray-800 rounded-lg shadow-2xl dark:shadow-dark-xl relative transition-colors">
              {/* Yellow top border */}
              <div className="top-[0vw] left-[0vw] h-[1.5vw] lg:top-[0vw] lg:left-[0vw] lg:h-[0.5vw] absolute w-full bg-[#F6BA18] rounded-t-lg"></div>

              {/* Login form header - Add dark mode text */}
              <h2 className="text-[2vw] lg:text-[2vw] max-lg:text-[6vw] font-bold text-left text-[#212529] dark:text-gray-100 transition-colors">
                Log In
              </h2>
              <p className="text-[3vw] mb-[5vw] lg:mb-[2vw] lg:text-[0.8vw] max-lg:text-[2.5vw] text-[#64748B] dark:text-gray-300 text-left transition-colors">
                {loginMethod === "password" &&
                  "Please enter your email and password to proceed"}
                {loginMethod === "magic-link" &&
                  "Please enter your email to receive a magic link"}
                {loginMethod === "numeric-code" &&
                  "Please enter the 6-digit code provided by your teacher"}
                {loginMethod === "picture-code" &&
                  "Please select your picture sequence in the correct order"}
              </p>

              {/* Render active login method */}
              {loginMethod === "password" && (
                // Password Login Form
                <form onSubmit={handleSubmit} className="space-y-[1vw]">
                  {/* Display error message */}
                  {error && (
                    <p
                      className="text-red-500 dark:text-red-400 text-left text-[0.8vw] max-lg:text-[2.5vw] transition-colors"
                      data-testid="error-message"
                    >
                      {error}
                    </p>
                  )}
                  {/* Email input - Add dark mode styles */}
                  <div>
                    <label
                      htmlFor="email"
                      className="text-[3vw] block text-[#64748B] dark:text-gray-300 lg:text-[0.8vw] max-lg:text-[2.5vw] transition-colors"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => handleBlur("email")}
                      required
                      className="mt-[1vw] text-[3vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] lg:text-[0.8vw] max-lg:text-[2.5vw] lg:px-[1vw] lg:py-[0.6vw] w-full border border-[#64748B] dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] dark:focus:ring-yellow-500 placeholder-[#64748B] dark:placeholder-gray-400 text-[#212529] dark:text-gray-100 bg-white dark:bg-gray-700 transition-colors"
                      placeholder="Enter your email"
                      data-testid="email-input"
                    />
                    {validationErrors.email && (
                      <p
                        className="text-red-500 dark:text-red-400 text-left text-[0.8vw] max-lg:text-[2.5vw] mt-1 transition-colors"
                        data-testid="email-error"
                      >
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Password input - Add dark mode styles */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mt-[5vw] text-[3vw] lg:text-[0.8vw] max-lg:text-[2.5vw] lg:mt-[0vw] block text-[#64748B] dark:text-gray-300 transition-colors"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => handleBlur("password")}
                        required
                        className="mt-[1vw] text-[3vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] lg:text-[0.8vw] max-lg:text-[2.5vw] lg:px-[1vw] lg:py-[0.6vw] w-full border border-[#64748B] dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] dark:focus:ring-yellow-500 placeholder-[#64748B] dark:placeholder-gray-400 text-[#212529] dark:text-gray-100 bg-white dark:bg-gray-700 pr-[10vw] lg:pr-[3vw] transition-colors"
                        placeholder="Enter your password"
                        data-testid="password-input"
                      />
                      {/* Dark mode styles for password toggle */}
                      <button
                        type="button"
                        onClick={handleTogglePassword}
                        className="absolute right-[3vw] lg:right-[1vw] top-[55%] transform -translate-y-1/2 text-gray-500 dark:text-gray-300 transition-colors"
                        aria-label="Toggle password visibility"
                        data-testid="password-toggle"
                      >
                        {showPassword ? (
                          <EyeOff className="w-[4vw] h-[4vw] lg:w-[1.2vw] lg:h-[1.2vw]" />
                        ) : (
                          <Eye className="w-[4vw] h-[4vw] lg:w-[1.2vw] lg:h-[1.2vw]" />
                        )}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p
                        className="text-red-500 dark:text-red-400 text-left text-[0.8vw] max-lg:text-[2.5vw] mt-1 transition-colors"
                        data-testid="password-error"
                      >
                        {validationErrors.password}
                      </p>
                    )}
                  </div>

                  {/* Forgot password button - Add dark mode styles */}
                  <div className="text-right mt-[0.5vw]">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[3vw] lg:text-[0.8vw] max-lg:text-[2.5vw] text-[#64748B] dark:text-gray-300 hover:underline focus:outline-none transition-colors"
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
                        ref={recaptchaRef}
                        sitekey={RECAPTCHA_SITE_KEY}
                        onChange={handleCaptchaChange}
                        theme={isDarkMode ? "dark" : "light"} // Add theme prop that changes based on current theme state
                      />
                    </div>
                  </div>

                  {/* Submit button - Already has dark mode styles */}
                  <div className="flex justify-center mt-[0.5vw]">
                    <button
                      type="submit"
                      className={`flex items-center justify-center min-w-[8rem] md:min-w-[15rem] lg:min-w-[10rem] max-w-[12rem] md:max-w-[15rem] lg:max-w-[10rem] px-6 py-2 md:py-4 lg:py-3
          font-semibold rounded-md transition-colors duration-300 ease-in-out flex-shrink-0
          text-white bg-[#212529] hover:bg-[#F6BA18] hover:text-[#212529] dark:bg-gray-900 dark:hover:bg-yellow-400
          disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-300`}
                      disabled={loading}
                      data-testid="login-button"
                    >
                      {loading ? (
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
                          <span className="animate-pulse text-sm md:text-lg lg:text-base">
                            Loading...
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm md:text-2xl lg:text-base">
                          Log In
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {loginMethod === "magic-link" && (
                // Magic Link Login Form
                <MagicLinkLogin />
              )}

              {loginMethod === "numeric-code" && (
                // Numeric Code Login Form
                <NumericCodeLogin />
              )}

              {loginMethod === "picture-code" && (
                // Picture Code Login Form
                <PictureCodeLogin />
              )}

              {/* Login method options at bottom - Add dark mode styles */}
              <div className="mt-8 pt-4 border-t dark:border-gray-700 transition-colors">
                <p className="text-[2.5vw] lg:text-[0.8vw] text-gray-500 dark:text-gray-400 text-center mb-4 transition-colors">
                  Or choose another way to log in:
                </p>
                <div className="grid grid-cols-4 gap-4">
                  {/* Password login option - Add dark mode styles */}
                  <button
                    onClick={() => setLoginMethod("password")}
                    className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-all ${
                      loginMethod === "password"
                        ? "bg-yellow-50 dark:bg-yellow-900/20 text-[#F6BA18]"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <Key className="w-[6vw] h-[6vw] lg:w-[2vw] lg:h-[2vw]" />
                    <span className="text-[2vw] lg:text-[0.7vw] text-center">
                      Password
                    </span>
                  </button>

                  {/* Magic Link login option - Add dark mode styles */}
                  <button
                    onClick={() => setLoginMethod("magic-link")}
                    className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-all ${
                      loginMethod === "magic-link"
                        ? "bg-yellow-50 dark:bg-yellow-900/20 text-[#F6BA18]"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <Mail className="w-[6vw] h-[6vw] lg:w-[2vw] lg:h-[2vw]" />
                    <span className="text-[2vw] lg:text-[0.7vw] text-center">
                      Magic Link
                    </span>
                  </button>

                  {/* Numeric Code login option - Add dark mode styles */}
                  <button
                    onClick={() => setLoginMethod("numeric-code")}
                    className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-all ${
                      loginMethod === "numeric-code"
                        ? "bg-yellow-50 dark:bg-yellow-900/20 text-[#F6BA18]"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <Hash className="w-[6vw] h-[6vw] lg:w-[2vw] lg:h-[2vw]" />
                    <span className="text-[2vw] lg:text-[0.7vw] text-center">
                      Number Code
                    </span>
                  </button>

                  {/* Picture Code login option - Add dark mode styles */}
                  <button
                    onClick={() => setLoginMethod("picture-code")}
                    className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-all ${
                      loginMethod === "picture-code"
                        ? "bg-yellow-50 dark:bg-yellow-900/20 text-[#F6BA18]"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <Image className="w-[6vw] h-[6vw] lg:w-[2vw] lg:h-[2vw]" />
                    <span className="text-[2vw] lg:text-[0.7vw] text-center">
                      Picture Code
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
