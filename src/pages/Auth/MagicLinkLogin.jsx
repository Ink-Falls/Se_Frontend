import React, { useState } from "react";
import { requestMagicLink } from "../../services/authService";
import { validateEmail } from "../../utils/validationUtils";

function MagicLinkLogin() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (touched) {
      const error = validateEmail(newEmail);
      setValidationError(error);
      setError(error);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    const error = validateEmail(email);
    setValidationError(error);
    setError(error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);

    if (emailError) {
      setValidationError(emailError);
      setError(emailError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await requestMagicLink(email);
      setSuccess(true);
    } catch (err) {
      console.error("Magic link request failed:", err);
      setError(err.message || "Failed to send magic link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center p-4">
        <h3 className="text-[6vw] lg:text-[1.5vw] max-lg:text-[4vw] font-bold mb-4 text-[#212529]">
          Check your email
        </h3>
        <p className="text-[3vw] mb-4 lg:text-[0.9vw] max-lg:text-[2.5vw] text-[#64748B]">
          We've sent a magic link to <strong>{email}</strong>.<br />
          Click the link in your email to sign in.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 py-[1vw] px-[3vw] text-[3vw] lg:text-[0.9vw] max-lg:text-[2.5vw] bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors"
          aria-label="Back"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-[1vw] w-full flex flex-col justify-center flex-1"
    >
      <div className="w-full">
        <label
          htmlFor="email"
          className="text-[3vw] block text-[#64748B] lg:text-[1.2vw] xl:text-[0.9vw] max-lg:text-[2.5vw]"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={handleEmailChange}
          onBlur={handleBlur}
          required
          className={`mt-[1vw] text-[3vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] lg:text-[1vw] xl:text-[0.8vw] max-lg:text-[2.5vw] lg:px-[1vw] lg:py-[1vw] xl:px-[0.8vw] xl:py-[0.8vw] w-full border ${
            touched && validationError
              ? "border-red-500 ring-1 ring-red-500"
              : "border-[#64748B]"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]`}
          placeholder="Enter your email"
        />
        {touched && validationError && (
          <p className="text-red-500 text-left text-[0.8vw] max-lg:text-[2.5vw] mt-1">
            {validationError}
          </p>
        )}
      </div>

      {/* Spacer div that appears on mobile and medium screens */}
      <div className="h-[3vw] md:h-[5vw] lg:h-[0vw]"></div>

      <div className="flex justify-center">
        <button
          type="submit"
          className={`flex items-center justify-center min-w-[8rem] md:min-w-[15rem] lg:min-w-[10rem] max-w-[12rem] md:max-w-[15rem] lg:max-w-[10rem] px-6 py-2 md:py-4 lg:py-3
          font-semibold rounded-md transition-colors duration-300 flex-shrink-0
          text-white bg-[#212529] hover:bg-[#F6BA18] hover:text-[#212529] dark:bg-gray-900 dark:hover:bg-yellow-400
          disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-300`}
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
              <span className="animate-pulse text-sm md:text-base">
                Sending...
              </span>
            </div>
          ) : (
            <span className="text-xs sm:text-sm md:text-2xl lg:text-base whitespace-nowrap">
              Send Magic Link
            </span>
          )}
        </button>
      </div>
    </form>
  );
}

export default MagicLinkLogin;
