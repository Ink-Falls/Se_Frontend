// src/components/common/Sidebar/Sidebar.jsx  (Assuming it's a common component)
import { ChevronFirst, ChevronLast, LogOut } from "lucide-react";
import logo from "/src/assets/images/ARALKADEMYLOGO.png"; // Correct relative path
import React, { createContext, useContext, useState } from "react";  // Import React
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "/src/services/authService.js"; // Import logout function

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
  const location = useLocation();  // Get the current route path
  const navigate = useNavigate();   // For programmatic navigation

  /**
   * Handles user logout.
   * @async
   * @function handleLogout
   */
  const handleLogout = async () => {
    try {
      await logoutUser(); // Call the logout service function
      localStorage.removeItem("token"); // Clear the token
      // localStorage.removeItem("user"); // Clear other user data, if you store it

      navigate("/login");  // Redirect to the login page
    } catch (error) {
      console.error("Logout failed:", error);
      // Display a user-friendly error message (e.g., using a toast or notification)
      alert(`Logout failed: ${error.message}`); //  A basic alert; use a better UI element in a real app.
        navigate("/login"); //even if logout fail, navigate to login
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
            className="flex w-full py-3 px-4 my-5 font-medium items-center text-gray-50 hover:bg-[#F6BA18] hover:text-black rounded-md p-2 transition-colors group"
          >
            <LogOut className="mr-1" size={20} />
            {expanded && <span>Logout</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
}

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