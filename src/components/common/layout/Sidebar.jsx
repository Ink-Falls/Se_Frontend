// src/components/common/Sidebar/Sidebar.jsx  (Assuming it's a common component)
import { ChevronFirst, ChevronLast, LogOut } from "lucide-react";
import PropTypes from 'prop-types'; // Add prop types
import React, { createContext, useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "/src/assets/images/ARALKADEMYLOGO.png";
import { useAuth } from '../../../contexts/AuthContext';

const SidebarContext = createContext();

/**
 * Sidebar component for navigation.
 *
 * @component
 * @param {object} props - The component's props.
 * @param {Array<object>} props.navItems - An array of navigation items.  Each item should have `icon`, `text`, and `route` properties.
 * @param {boolean} props.isSidebarOpen - Controls whether the sidebar is open (for mobile responsiveness).
 * @param {function} props.setIsSidebarOpen - Function to toggle the sidebar's open/closed state.
 * @returns {JSX.Element} The Sidebar component.
 */
export default function Sidebar({ navItems, isSidebarOpen, setIsSidebarOpen }) {
  const [expanded, setExpanded] = useState(true); // Controls the expanded/collapsed state of the sidebar (desktop)
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Add loading state
  const location = useLocation();  // Get the current route path
  const navigate = useNavigate();   // For programmatic navigation
  const { logout, user } = useAuth(); // Add useAuth hook

  /**
   * Handles user logout.
   * @async
   * @function handleLogout
   */
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
    <aside
      className={`fixed lg:relative h-screen flex justify-center items-center bg-gray-100 z-50 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      <nav className="h-full flex flex-col bg-[#212529] border-r">
        <div className="p-5 pt-7 pb-1 flex justify-between items-center">
          <img
            src={logo}
            className={`overflow-hidden transition-all duration-300 ease-out ${
              expanded ? "w-40" : "w-0"
            }`}
            alt="ARALKADEMY Logo"
          />
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1 rounded-lg bg-gray-50 hover:bg-gray-100 border-2 border-gray-300"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <SidebarContext.Provider
          value={{ expanded, currentPath: location.pathname }}
        >
          <ul className="flex-1 px-3">
            {navItems.map((item) => (
              <SidebarItem
                key={item.text}  // Use a unique key
                icon={item.icon}
                text={item.text}
                route={item.route}
              />
            ))}
          </ul>
        </SidebarContext.Provider>

        <div className="mt-auto px-3 py-3">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full py-3 px-4 my-5 font-medium items-center text-gray-50 hover:bg-[#F6BA18] hover:text-black rounded-md p-2 transition-colors group"
          >
            {isLoggingOut ? (
              <div className="flex items-center justify-center w-full gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Logging out...</span>
              </div>
            ) : (
              <>
                <LogOut className="mr-1" size={20} />
                {expanded && <span>Logout</span>}
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
 *
 * @component
 * @param {object} props - The component's props.
 * @param {JSX.Element} props.icon - The icon for the navigation item.
 * @param {string} props.text - The text label for the navigation item.
 * @param {string} props.route - The route path for the navigation item.
 * @returns {JSX.Element} A single sidebar item.
 */
export function SidebarItem({ icon, text, route }) {
  const { expanded, currentPath } = useContext(SidebarContext);
  const isActive = currentPath === route; // Check if the current route matches the item's route

  return (
    <li
      className={`relative flex items-center py-3 px-4 my-4 font-medium rounded-md cursor-pointer transition-all group ${
        isActive
          ? "bg-[#F6BA18] text-black"
          : "hover:bg-[#F6BA18] text-gray-50 hover:text-black"
      }`}
    >
      <Link to={route} className="flex items-center w-full">
        {icon}
        <span
          className={`overflow-hidden transition-all duration-300 ease-out ${
            expanded ? "w-52 ml-3" : "w-0"
          }`}
        >
          {text}
        </span>
      </Link>
    </li>
  );
}