import { ChevronFirst, ChevronLast, LogOut } from "lucide-react";
import logo from "/src/assets/ARALKADEMYLOGO.png";
import { createContext, useContext, useState } from "react";
import { Link } from "react-router-dom";

const SidebarContext = createContext();
export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <aside className="h-screen flex justify-center items-center bg-gray-100">
      <nav className="h-full flex flex-col bg-[#212529] border-r">
        <div className="p-5 pt-7 pb-1 flex justify-between items-center">
          <img
            src={logo} // Updated to use the imported logo variable
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
        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>
        <div className="mt-auto px-3 py-3">
          <Link
            to="/"
            className="flex py-3 px-4 my-5 font-medium items-center text-gray-50 hover:bg-[#F6BA18] hover:text-black rounded-md p-2 transition-colors group"
          >
            <LogOut className="mr-1" size={20} />
            {expanded && <span>Logout</span>}
            <div className="absolute right-2 top-2 w-2 h-2 rounded-full bg-indigo-400 invisible opacity-20 group-hover:visible group-hover:opacity-100"></div>
          </Link>
        </div>
      </nav>
    </aside>
  );
}

export function SidebarItem({ icon, text, active, alert, route }) {
  const { expanded } = useContext(SidebarContext);

  return (
    <li
      className={`relative flex items-center py-3 px-4 my-4 font-medium rounded-md cursor-pointer transition-all group ${
        active
          ? "text-black"
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
        {alert && (
          <div
            className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
              expanded ? "" : "top-2"
            }`}
          ></div>
        )}
      </Link>
      {!expanded && (
        <div
          className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
        >
          {text}
        </div>
      )}
    </li>
  );
}