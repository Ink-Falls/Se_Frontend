import React from "react";

const Header = ({ title }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex justify-between items-center p-5 bg-white rounded-lg mb-6">
      <div className="flex items-center space-x-7">
        <h1 className="text-2xl font-semibold text-[#334155]">{title}</h1>{" "}
        {/* Use the title prop */}
        <p className="text-xs text-[#334155]">{currentDate}</p>
      </div>

      <div className="flex items-center">
        <span className="ml-2 text-sm mr-5 font-semibold text-[#334155]">
          Account
        </span>
        <img
          src="./src/assets/profile2.jpeg"
          alt="Profile Image"
          className="w-10 h-10 rounded-full"
        />
      </div>
    </div>
  );
};

export default Header;
