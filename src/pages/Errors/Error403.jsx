import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "/src/assets/images/ARALKADEMYLOGO.png";
import { isAuthenticated } from "../../utils/auth";
import { getUserRole } from "../../utils/auth"; // Add this helper function to auth.js

function Error403() {
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    if (!isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }

    const userRole = getUserRole();
    switch (userRole?.toLowerCase()) {
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

  return (
    <>
      <div
        className="min-h-screen bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://upload.wikimedia.org/wikipedia/commons/7/7b/400_Year_old_Beauty.jpg)",
        }}
      >
        <header className="py-[3vw] px-[4vw] lg:py-[1.5vw] lg:px-[2vw] bg-[#121212] text-[#F6BA18] flex justify-between items-center shadow-xl">
          <div className="flex items-center">
            <img
              src={logo}
              alt="ARALKADEMY Logo"
              className="h-[5vw] lg:h-[2.5vw] mr-2"
            />
          </div>
        </header>

        <div className="flex items-center justify-center min-h-[calc(100vh-15vh)]">
          <div className="p-[4vw] max-lg:p-[7vw] w-[80vw] lg:w-[40vw] bg-white rounded-lg shadow-2xl relative">
            {/* Yellow accent border */}
            <div className="top-[0vw] left-[0vw] h-[1.5vw] lg:top-[0vw] lg:left-[0vw] lg:h-[0.5vw] absolute w-full bg-[#F6BA18] rounded-t-lg"></div>

            <div className="text-center">
              <h1 className="text-[15vw] lg:text-[8vw] font-bold text-[#212529]">
                403
              </h1>
              <h2 className="text-[4vw] lg:text-[2vw] font-semibold text-[#64748B] mb-[2vw]">
                Unauthorized Access
              </h2>
              <p className="text-[2.5vw] lg:text-[1vw] text-[#64748B] mb-[4vw]">
                You don't have permission to access this page.
              </p>
              <button
                onClick={handleGoBack}
                className="py-[1.5vw] px-[7vw] text-[3.5vw] max-lg:text-[2.5vw] lg:py-[0.4vw] lg:px-[3vw] lg:text-[1vw] bg-[#212529] text-[#FFFFFF] font-semibold rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 ease-in-out"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Error403;
