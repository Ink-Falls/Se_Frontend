import { ChevronFirst, ChevronLast, LogOut } from "lucide-react";
import PropTypes from 'prop-types';
import React, { createContext, useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "/src/assets/images/ARALKADEMYLOGO.png";
import { useAuth } from '../../../contexts/AuthContext';

const SidebarContext = createContext();

/**
 * Sidebar component for navigation.
 */
export default function Sidebar({ navItems, isSidebarOpen, setIsSidebarOpen }) {
  const [expanded, setExpanded] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      window.location.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.replace('/login'); 
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside
      className={`fixed lg:relative h-screen z-50 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      <nav className={`h-full flex flex-col ${expanded ? 'w-60' : 'w-[70px]'} transition-all duration-300 bg-gradient-to-b from-[#1c1f23] to-[#212529] shadow-xl border-r border-gray-800/30 overflow-hidden`}>
        {/* Header with logo and toggle button - removed decorative accent bar */}
        <div className="p-4 flex flex-col items-center border-b border-gray-800/40">
          <div className="flex w-full justify-between items-center">
            <div className={`transition-all duration-300 ease-out overflow-hidden ${expanded ? "w-36" : "w-0"}`}>
              <img
                src={logo}
                className="max-h-9 object-contain"
                alt="ARALKADEMY Logo"
              />
            </div>
            <button
              onClick={() => setExpanded((curr) => !curr)}
              className="p-1.5 rounded-lg bg-gray-800/40 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all border border-gray-700/50"
            >
              {expanded ? <ChevronFirst size={18} /> : <ChevronLast size={18} />}
            </button>
          </div>
        </div>

        <SidebarContext.Provider value={{ expanded, currentPath: location.pathname }}>
          {/* Navigation section with consistent spacing */}
          <ul className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
            {navItems.map((item, index) => (
              <SidebarItem
                key={item.text}
                icon={item.icon}
                text={item.text}
                route={item.route}
                isFirst={index === 0}
                isLast={index === navItems.length - 1}
              />
            ))}
          </ul>
        </SidebarContext.Provider>

        {/* Enhanced logout section - removed branding footer */}
        <div className="mt-auto border-t border-gray-800/40 px-3 py-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`flex w-full py-2.5 px-3 items-center text-gray-400 hover:bg-gray-800/50 hover:text-white rounded-md transition-all ${
              expanded ? "justify-start" : "justify-center"
            } focus:outline-none focus:ring-2 focus:ring-[#F6BA18]/50 focus:ring-offset-1 focus:ring-offset-gray-800/10`}
          >
            {isLoggingOut ? (
              <div className={`flex items-center justify-center ${expanded ? "w-full" : ""} gap-2`}>
                <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-white rounded-full"></div>
                {expanded && <span>Logging out...</span>}
              </div>
            ) : (
              <>
                <LogOut size={20} className={expanded ? "mr-2.5" : ""} />
                <span className={`transition-all duration-300 overflow-hidden ${
                  expanded ? "w-24 opacity-100" : "w-0 opacity-0"
                }`}>Logout</span>
              </>
            )}
          </button>
        </div>
      </nav>
    </aside>
  );
}

// Add prop types validation
Sidebar.propTypes = {
  navItems: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired,
    icon: PropTypes.element.isRequired, 
    route: PropTypes.string.isRequired
  })).isRequired,
  isSidebarOpen: PropTypes.bool,
  setIsSidebarOpen: PropTypes.func
};

/**
 * SidebarItem component for individual navigation items.
 */
export function SidebarItem({ icon, text, route, isFirst, isLast }) {
  const { expanded, currentPath } = useContext(SidebarContext);
  const isActive = currentPath === route;

  return (
    <li className="relative">
      <Link 
        to={route} 
        className={`flex items-center py-2.5 px-3 rounded-md cursor-pointer transition-all hover:bg-opacity-80 ${
          isActive
            ? "bg-[#F6BA18] text-[#212529] font-medium"
            : "text-gray-400 hover:bg-gray-800/40 hover:text-white"
        } focus:outline-none focus:ring-2 ${isActive ? 'focus:ring-[#F6BA18]/70' : 'focus:ring-gray-700'}`}
      >
        <div className="flex items-center">
          <span className={`flex-shrink-0 ${isActive ? 'animate-subtle-pulse' : ''}`}>
            {React.cloneElement(icon, { size: 20 })}
          </span>
          <span
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-out ${
              expanded ? "ml-3 w-40 opacity-100" : "w-0 opacity-0"
            }`}
          >
            {text}
          </span>
        </div>
      </Link>

      {/* Add subtle connector lines between menu items when expanded */}
      {expanded && !isLast && !isActive && (
        <div className="absolute left-[18px] top-[44px] w-px h-3 bg-gray-800/30"></div>
      )}
      
      {/* Enhanced tooltip with arrow for collapsed state */}
      {!expanded && (
        <div className="absolute left-full rounded-md px-2.5 py-1.5 ml-2 bg-gray-900 text-white text-xs invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap z-50 shadow-lg">
          {text}
          <div className="absolute top-1/2 -left-1 w-2 h-2 bg-gray-900 transform rotate-45 -translate-y-1/2"></div>
        </div>
      )}
    </li>
  );
}

SidebarItem.propTypes = {
  icon: PropTypes.element.isRequired,
  text: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool
};

// Add this CSS to your global styles file or add inline styles with a <style> tag somewhere in your app
// This will hide the scrollbar for the navigation menu