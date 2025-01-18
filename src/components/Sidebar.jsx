import { ChevronFirst, ChevronLast, MoreVertical } from "lucide-react"
import logo from "/src/assets/logoblack.png"
import Announcement from "./Announcement";
import { createContext, useContext, useState } from "react"
const SidebarContext = createContext();
export const SidebarExpand = createContext(); //create a new context when the other context is being used - don't forget to put export.
import { Link } from "react-router-dom";

export default function Sidebar({ children }) {
    const [expanded, setExpanded] = useState(true)
    return (
        <>
            {/* border-solid border-black */}
            <aside className="h-full my-1 flex justify-center items-center"> {/* Add border styles here */}
                <nav className="h-sidebar-size flex flex-col bg-white border-r-4 border-t border-b shadow-sm rounded-3xl my-6"> 
                    {/* my-2 in nav is the margin of sidebar against the black box */}
                    <div className="p-4 pb-2 flex justify-between items-center">
                        <img src={logo} className={`overflow-hidden transition-all duration-1000 ease-in-out delay-150 ${expanded ? "w-40" : "w-0"}`} />
                        <button onClick={() => setExpanded((curr) => !curr)} className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border-2 border-solid border-gray-300">
                            {expanded ? <ChevronFirst /> : <ChevronLast />}
                        </button>
                    </div>
                    <SidebarContext.Provider value={{ expanded }}>
                        <ul className="flex-1 px-3">{children}</ul>
                    </SidebarContext.Provider>
                </nav>
            </aside>
            {/* The SidebarExpand is like a package, that holds a value, in this case expanded that will be shipped out to whatever is inside the .provider */}
        </>
    )
}

//Dont forget the route in the param, since we need to navigate 
export function SidebarItem({ icon, text, active, alert, route }) {
    const { expanded } = useContext(SidebarContext)//We used SidebarContext.Provider for <ul> {children} - that is why the expanded was brought here.
    return (
        <li className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${active ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800" : "hover:bg-indigo-50 text-gray-600"}`}>
            <Link to={route} className="flex items-center w-full">
            {icon}
            <span className={`overflow-hidden transition-all duration-1000 ease-in-out delay-100 ${expanded ? "w-52 ml-3" : "w-0"}`}>{text}</span>
            {alert && (
                <div className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${expanded ? "" : "top-2"}`}>

                </div>
            )}
            </Link>
            {!expanded && (
                <div className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}>
                    {text}
                </div>
            )}
        </li>
    )
}