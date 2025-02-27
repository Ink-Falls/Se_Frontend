import React from "react";
import profileImg from "/src/assets/profile2.jpeg"; // Adjust the path if necessary

const Header = ({ title }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-lg mb-4 p-5">
      {/* Mobile View (Small Screens) */}
      <div className="flex justify-between items-center sm:hidden">
        <div>
          <h1 className="text-xl font-semibold text-[#334155]">{title}</h1>
          <p className="text-xs text-[#334155]">{currentDate}</p>
        </div>
        <img src={profileImg} alt="Profile" className="w-8 h-8 rounded-full" />
      </div>

      {/* Desktop & Tablet View (Medium to Large Screens) */}
      <div className="hidden sm:flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl md:text-2xl font-semibold text-[#334155]">
            {title}
          </h1>
          <p className="text-xs text-[#334155]">{currentDate}</p>
        </div>
        <div className="flex items-center">
          <span className="ml-2 text-sm mr-5 font-semibold text-[#334155]">
            Account
          </span>
          <img
            src={profileImg}
            alt="Profile"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
