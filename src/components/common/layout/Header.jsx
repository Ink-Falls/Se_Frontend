import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import profileImg from "/src/assets/images/profile2.jpeg";

const Header = ({ title }) => {
  const [userData, setUserData] = useState(null);
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="bg-white rounded-lg mb-4 p-5">
      {/* Mobile View */}
      <div className="flex justify-between items-center sm:hidden">
        <div>
          <h1 className="text-xl font-semibold text-[#334155]">{title}</h1>
          <p className="text-xs text-[#334155]">{currentDate}</p>
        </div>
        <Link to="/profile" className="flex items-center">
          <span className="mr-2 text-sm font-medium text-[#334155]">
            {userData?.first_name} {userData?.last_name}
          </span>
          <img src={profileImg} alt="Profile" className="w-8 h-8 rounded-full" />
        </Link>
      </div>

      {/* Desktop & Tablet View */}
      <div className="hidden sm:flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl md:text-2xl font-semibold text-[#334155]">
            {title}
          </h1>
          <p className="text-xs text-[#334155]">{currentDate}</p>
        </div>
        <Link to="/profile" className="flex items-center">
          <span className="mr-4 text-sm font-medium text-[#334155]">
            {userData?.first_name} {userData?.last_name}
          </span>
          <img
            src={profileImg}
            alt="Profile"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full"
          />
        </Link>
      </div>
    </div>
  );
};

export default Header;
