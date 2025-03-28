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
      // Use navigate and force reload
      window.location.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect to login even if logout fails
      window.location.replace('/login');
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
          </>
        ) : (
          <>
            <LogOut size={20} />
          </>
        )}
      </button>
    </div>
  );
};

export default MobileNavBar;
