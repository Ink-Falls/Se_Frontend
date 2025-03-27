import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyMagicLinkToken } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function VerifyMagicLink() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [status, setStatus] = useState("verifying"); // 'verifying', 'error', 'success'
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setErrorMessage("Invalid or missing token");
        return;
      }

      try {
        // Verify the token with the backend
        const authData = await verifyMagicLinkToken(token);

        // Update auth context
        await checkAuth();

        // Set success status
        setStatus("success");

        // Determine redirection route based on user role
        const userRole = authData.user.role?.toLowerCase();

        const dashboardRoutes = {
          admin: "/Admin/Dashboard",
          teacher: "/Teacher/Dashboard",
          student_teacher: "/Teacher/Dashboard",
        };

        // Navigate to appropriate dashboard
        setTimeout(() => {
          const route = dashboardRoutes[userRole];
          if (route) {
            navigate(route, { replace: true });
          } else {
            // Fallback if role doesn't match expected values
            navigate("/login", { replace: true });
          }
        }, 2000);
      } catch (error) {
        console.error("Token verification failed:", error);
        setStatus("error");
        setErrorMessage(
          error.message || "Verification failed. Please try logging in again."
        );
      }
    };

    verifyToken();
  }, [searchParams, navigate, checkAuth]);

  // Rendering based on status
  if (status === "verifying") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md text-center">
          <LoadingSpinner />
          <h2 className="mt-4 text-xl font-semibold text-gray-800">
            Verifying your login...
          </h2>
          <p className="mt-2 text-gray-600">
            Please wait while we complete your sign-in.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-800">
            Verification Failed
          </h2>
          <p className="mt-2 text-gray-600">{errorMessage}</p>
          <button
            className="mt-4 px-4 py-2 bg-[#212529] text-white rounded hover:bg-[#F6BA18] hover:text-[#212529]"
            onClick={() => navigate("/login")}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-800">
            Login Successful!
          </h2>
          <p className="mt-2 text-gray-600">
            Redirecting you to your dashboard...
          </p>
          <div className="mt-4">
            <LoadingSpinner size="small" />
          </div>
        </div>
      </div>
    );
  }
}

export default VerifyMagicLink;
