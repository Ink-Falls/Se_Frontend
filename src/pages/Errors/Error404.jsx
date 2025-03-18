import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "/src/assets/images/ARALKADEMYLOGO.png";
import { useAuth } from '../../contexts/AuthContext';

function Error404() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const isLearnerRoute = location.pathname.includes('/Learner/');
  const isTeacherRoute = location.pathname.includes('/Teacher/');
  const isAdminRoute = location.pathname.includes('/Admin/');

  const handleGoHome = () => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    const role = user?.role?.toLowerCase();
    switch (role) {
      case 'teacher':
      case 'student_teacher':
        navigate("/Teacher/Dashboard", { replace: true });
        break;
      case 'learner':
        navigate("/Learner/Dashboard", { replace: true });
        break;
      case 'admin':
        navigate("/Admin/Dashboard", { replace: true });
        break;
      default:
        navigate("/login", { replace: true });
    }
  };

  const getErrorMessage = () => {
    if (isLearnerRoute) {
      return "This learning resource or feature is currently under development. Please return to your dashboard.";
    }
    if (isTeacherRoute) {
      return "This teaching resource or feature is currently under development. Please return to your dashboard.";
    }
    if (isAdminRoute) {
      return "This administrative feature is currently under development. Please return to your dashboard.";
    }
    return "The page you are looking for doesn't exist or has been moved.";
  };

  const getTitle = () => {
    if (isLearnerRoute) return "Learner Page Not Available";
    if (isTeacherRoute) return "Teacher Page Not Available";
    if (isAdminRoute) return "Admin Page Not Available";
    return "Page Not Found";
  };

  const getButtonText = () => {
    if (isLearnerRoute) return "Back to Learner Dashboard";
    if (isTeacherRoute) return "Back to Teacher Dashboard";
    if (isAdminRoute) return "Back to Admin Dashboard";
    return "Back to Home";
  };

  return (
    <>
      <div
        className="min-h-screen bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://upload.wikimedia.org/wikipedia/commons/7/7b/400_Year_old_Beauty.jpg)",
        }}
      >
        {/* Header with logo */}
        <header className="py-[3vw] px-[4vw] lg:py-[1.5vw] lg:px-[2vw] bg-[#121212] text-[#F6BA18] flex justify-between items-center shadow-xl">
          <div className="flex items-center">
            <img
              src={logo}
              alt="ARALKADEMY Logo"
              className="h-[5vw] lg:h-[2.5vw] mr-2"
            />
          </div>
        </header>

        {/* Main content area */}
        <div className="flex items-center justify-center min-h-[calc(100vh-15vh)]">
          <div className="p-[4vw] max-lg:p-[7vw] w-[80vw] lg:w-[40vw] bg-white rounded-lg shadow-2xl relative">
            {/* Yellow accent border */}
            <div className="top-[0vw] left-[0vw] h-[1.5vw] lg:top-[0vw] lg:left-[0vw] lg:h-[0.5vw] absolute w-full bg-[#F6BA18] rounded-t-lg"></div>

            {/* Error content */}
            <div className="text-center">
              <h1 className="text-[15vw] lg:text-[8vw] font-bold text-[#212529]">
                404
              </h1>
              <h2 className="text-[4vw] lg:text-[2vw] font-semibold text-[#64748B] mb-[2vw]">
                {getTitle()}
              </h2>
              <p className="text-[2.5vw] lg:text-[1vw] text-[#64748B] mb-[4vw]">
                {getErrorMessage()}
              </p>
              <button
                onClick={handleGoHome}
                className="py-[1.5vw] px-[7vw] text-[3.5vw] max-lg:text-[2.5vw] lg:py-[0.4vw] lg:px-[3vw] lg:text-[1vw] bg-[#212529] text-[#FFFFFF] font-semibold rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 ease-in-out"
              >
                {getButtonText()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Error404;