import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Book, Bell, User } from "lucide-react";

const MobileNavBar = () => {
  const location = useLocation(); // Get current route

  // Define active link styles
  const getActiveStyle = (path) =>
    location.pathname === path
      ? "text-[#F6BA18]" // Active page color (highlight)
      : "text-white hover:text-[#F6BA18]"; // Default color

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#212529] shadow-lg border-t flex justify-around py-3 lg:hidden">
      <Link
        to="/Dashboard"
        className={`flex flex-col items-center ${getActiveStyle("/Dashboard")}`}
      >
        <Book size={24} />
        <span className="text-xs">Courses</span>
      </Link>

      <Link
        to="/Notifications"
        className={`flex flex-col items-center ${getActiveStyle(
          "/Notifications"
        )}`}
      >
        <Bell size={24} />
        <span className="text-xs">Notifications</span>
      </Link>

      <Link
        to="/Profile"
        className={`flex flex-col items-center ${getActiveStyle("/Profile")}`}
      >
        <User size={24} />
        <span className="text-xs">Account</span>
      </Link>
    </div>
  );
};

export default MobileNavBar;
