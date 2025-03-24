import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

const MobileNavBar = ({ navItems }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const getActiveStyle = (path) =>
    location.pathname === path
      ? "text-[#F6BA18]"
      : "text-white hover:text-[#F6BA18]";

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      const errorMessage = error.message || "Logout failed. Please try again.";
      alert(errorMessage);
    } finally {
      setIsLoggingOut(false);
    }
  };

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
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex flex-col items-center text-white hover:text-[#F6BA18]"
      >
        {isLoggingOut ? (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            <span className="text-xs">...</span>
          </>
        ) : (
          <>
            <LogOut size={20} />
            <span className="text-xs">Logout</span>
          </>
        )}
      </button>
    </div>
  );
};

export default MobileNavBar;
