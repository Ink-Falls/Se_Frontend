import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";

const MobileNavBar = ({ navItems, onLogout }) => {
  const location = useLocation();

  const getActiveStyle = (path) =>
    location.pathname === path
      ? "text-[#F6BA18]"
      : "text-white hover:text-[#F6BA18]";

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#212529] shadow-lg border-t flex justify-around py-3 lg:hidden">
      {navItems?.map((item, index) => (
        <Link
          key={index}
          to={item.route}
          className={`flex flex-col items-center ${getActiveStyle(item.route)}`}
        >
          {item.icon}
          <span className="text-xs">{item.text}</span>
        </Link>
      ))}
      <button
        onClick={onLogout}
        className="flex flex-col items-center text-white hover:text-[#F6BA18]"
      >
        <LogOut size={20} />
        <span className="text-xs">Logout</span>
      </button>
    </div>
  );
};

export default MobileNavBar;
