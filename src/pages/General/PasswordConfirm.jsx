import React, {useEffect} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "/src/assets/images/ARALKADEMYLOGO.png";

function PasswordConfirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const passwordReset = location.state?.passwordReset;

  useEffect(() => {
    if (!passwordReset) {
      navigate("/Login");
    }
  }, []);

  return (
    <>
      {/* Page container with a background image */}
      <div
        className="min-h-screen bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://upload.wikimedia.org/wikipedia/commons/7/7b/400_Year_old_Beauty.jpg)",
        }}
      >
        {/* Header with logo and navigation button */}
        <header className="py-[3vw] px-[4vw] lg:py-[1.5vw] lg:px-[2vw] bg-[#121212] text-[#F6BA18] flex justify-between items-center shadow-xl">
          <div className="flex items-center">
            <img
              src={logo}
              alt="ARALKADEMY Logo"
              className="h-[5vw] lg:h-[2.5vw] mr-2"
            />
          </div>

          {/* Log In button */}
          <button
            onClick={() => navigate("/Login", { replace: true })}
            className="text-[4vw] py-[1vw] px-[6vw] lg:text-[1vw] max-lg:text-[2.5vw] lg:py-[0.5vw] lg:px-[2vw] bg-[#F6BA18] text-[#212529] font-bold rounded-md hover:bg-[#64748B] hover:text-[#FFFFFF] transition-colors duration-300 ease-in-out"
          >
            Log In
          </button>
        </header>

        {/* Main content area */}
        <div className="flex items-center justify-center min-h-screen">
          {/* Success message box */}
          <div className="p-[4vw] max-lg:p-[7vw] w-[80vw] lg:w-[40vw] bg-white rounded-lg shadow-2xl relative">
            {/* Highlighted top border */}
            <div className="top-[0vw] left-[0vw] h-[1.5vw] lg:top-[0vw] lg:left-[0vw] lg:h-[0.5vw] absolute w-full bg-[#F6BA18] rounded-t-lg"></div>

            {/* Success headline */}
            <h2 className="text-[8vw] lg:text-[2.5vw] max-lg:text-[5vw] font-bold text-left text-[#212529]">
              Password Changed Successfully!
            </h2>

            {/* Description text */}
            <p className="text-[3vw] mb-[5vw] lg:mb-[2vw] max-lg:text-[2.5vw] lg:text-[1vw] text-[#64748B] text-left">
              You may now continue logging in.
            </p>

            {/* Back to Login button */}
            <div className="flex justify-end">
              <button
                onClick={() => navigate("/Login")}
                className="py-[1.5vw] px-[7vw] text-[3.5vw] max-lg:text-[2.5vw] lg:py-[0.4vw] lg:px-[3vw] lg:text-[1vw] bg-[#212529] text-[#FFFFFF] font-semibold rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 ease-in-out"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PasswordConfirm;
