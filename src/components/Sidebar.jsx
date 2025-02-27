import { ChevronFirst, ChevronLast, LogOut } from "lucide-react";
import logo from "/src/assets/ARALKADEMYLOGO.png";
import { createContext, useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const SidebarContext = createContext();

export default function Sidebar({ navItems }) {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Logout Function
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        const response = await fetch("http://localhost:4000/api/users/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // Clear auth data from localStorage
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          // Redirect to login page
          navigate("/");
        } else {
          console.error("Logout failed");
        }
      } else {
        // No token found, just redirect
        navigate("/");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      // Still redirect even if there's an error
      navigate("/");
    }
  };

  return (
    <aside className="h-screen flex justify-center items-center bg-gray-100">
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

        {/* Sidebar Items */}
        <SidebarContext.Provider
          value={{ expanded, currentPath: location.pathname }}
        >
          <ul className="flex-1 px-3">
            {navItems.map((item) => (
              <SidebarItem
                key={item.text}
                icon={item.icon}
                text={item.text}
                route={item.route}
              />
            ))}
          </ul>
        </SidebarContext.Provider>

        {/* Logout Button */}
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

export function SidebarItem({ icon, text, route }) {
  const { expanded, currentPath } = useContext(SidebarContext);
  const isActive = currentPath === route;

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
