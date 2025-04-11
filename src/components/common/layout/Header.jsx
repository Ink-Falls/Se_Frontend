import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserProfileImage } from "../../../utils/profileImages";

const Header = ({ title }) => {
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return getUserProfileImage(user.role);
  });

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Add event listener for user updates
  useEffect(() => {
    const handleUserUpdate = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserData(user);
        setProfileImage(getUserProfileImage(user.role));
      }
    };

    // Listen for user update events
    window.addEventListener("userUpdated", handleUserUpdate);
    handleUserUpdate(); // Initial load

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);
      setProfileImage(getUserProfileImage(user.role));
    }
  }, []);

  return (
    <div className="bg-white rounded-lg mb-4 p-5">
      {/* Mobile View */}
      <div className="flex justify-between items-center sm:hidden">
        <div>
          <h1 className="text-xl font-semibold text-[#334155] truncate max-w-[200px]">
            {title}
          </h1>
          <p className="text-xs text-[#334155]">{currentDate}</p>
        </div>
        <Link to="/profile">
          <img
            src={profileImage}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
        </Link>
      </div>

      {/* Desktop & Tablet View */}
      <div className="hidden sm:flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl md:text-2xl font-semibold text-[#334155] truncate max-w-[600px]">
            {title}
          </h1>
          <p className="text-xs text-[#334155]">{currentDate}</p>
        </div>
        <Link to="/profile" className="flex items-center">
          <span className="mr-4 text-lg font-bold text-[#334155] hidden md:block">
            {userData?.first_name} {userData?.last_name}
          </span>
          <img
            src={profileImage}
            alt="Profile"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full"
          />
        </Link>
      </div>
    </div>
  );
};

export default Header;
