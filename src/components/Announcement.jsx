import React, { useContext } from "react";
import { SidebarExpand } from "./Sidebar.jsx";
import profile from "../assets/profile2.jpeg";
import { Search } from "lucide-react";

function Announcement() {
  const { expanded } = useContext(SidebarExpand);

  return (
    <div className="mt-8 ml-5 mb-8 w-full overflow-x-hidden">
      {/* Header section with course information and search/profile controls */}
      <div
        className="flex flex-col md:flex-row justify-between items-center mr-4 p-4 rounded-lg"
        style={{ width: "100%" }}
      >
        {/* Course title and code */}
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-extrabold mb-1 font-['poppins']">
            Course Name
          </h1>
          <h2 className="text-xl font-semibold mb-2 font-['poppins']">
            Course Code
          </h2>
        </div>

        {/* Search bar and profile section */}
        <div className="flex flex-col lg:flex-row items-center justify-start sm:justify-end w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[43%] transition-all duration-300">
          {/* Search input field with button */}
          <div
            className={`flex items-center border border-gray-300 rounded-md shadow-md mb-4 md:mb-0 w-full sm:w-3/4 md:w-4/6 ${
              expanded ? "sm:mr-0" : "sm:mr-0"
            } ${expanded ? "md:mr-0" : "md:mr-4"} ${
              expanded ? "w-full" : "w-auto"
            }`}
            style={{ maxWidth: "400px" }}
          >
            <input
              type="text"
              placeholder="What are you looking for?"
              className="flex-grow flex-shrink p-2 rounded-md focus:outline-none font-['poppins']"
              style={{ minWidth: "150px", maxWidth: "100%" }}
            />
            <button className="flex items-center justify-center bg-indigo-400 rounded-md p-2">
              <Search className="text-white" />
            </button>
          </div>

          {/* Profile display with user name and role */}
          <div
            className={`flex items-center transition-all duration-1000 ease-in-out ${
              expanded ? "sm:ml-0" : "sm:ml-0"
            } ${
              expanded ? "md:ml-10" : "md:ml-2"
            } rounded-2xl border shadow-md border-gray-200 p-2 md:-mr-3 overflow-hidden`}
            style={{ maxWidth: "500px" }}
          >
            {!expanded && (
              <div
                className="flex flex-col sm:mr-0 md:mr-4 md:px-2 px-1 flex-grow "
                style={{ minWidth: "0" }}
              >
                <h4 className="font-semibold sm:text-sm md:text-lg truncate">
                  Satella Vivienne Evernight
                </h4>
                <span className="text-sm text-gray-600 truncate">Student</span>
              </div>
            )}
            <img
              src={profile}
              className="w-10 h-10 md:w-12 md:h-12 rounded-md flex-shrink-0"
              alt="Profile"
            />
          </div>
        </div>
      </div>

      {/* Announcements header */}
      <div
        className={`bg-gray-100 rounded-2xl shadow-md p-5 transition-all mr-4 ${
          expanded ? "w-full" : "w-full"
        }`}
      >
        <h3 className="text-xl font-bold ml-2 font-['poppins']">
          All Announcements
        </h3>
      </div>

      {/* Announcements content section */}
      <div
        className="bg-white rounded-2xl shadow-md p-5 transition-all mr-4 mb-5 border border-grey-600 h-content-height"
        style={{ flex: 1, marginTop: "20px", width: "100%" }}
      >
        <div className="overflow-y-auto max-h-scroll-height">
          {/* Individual announcement card */}
          <div
            className={`bg-gray-100 rounded-2xl shadow-md p-5 transition-all overflow-hidden mr-4 border border-grey-600 mb-5 has-[:checked]:bg-indigo-100 group`}
          >
            <div className="flex flex-col md:flex-row justify-start md:items-center">
              {/* Checkbox and profile image */}
              <div className="flex items-center mb-4 md:mb-0 md:mr-4">
                <input
                  type="checkbox"
                  className="w-8 h-8 text-grey-600 border-grey-300 rounded checked:ring-grey-500 mr-2 flex-none"
                />
                <div className="w-px bg-gray-300 mx-2 h-10 flex-none" />
                <img
                  src={profile}
                  className="w-12 h-12 rounded-md flex-shrink-0 ml-5"
                />
              </div>

              {/* Announcement text content */}
              <div className="flex flex-col w-full sm:w-auto md:w-2/5 lg:w-3/5 xl:w-4/5 lg:ml-3 md:ml-10 mb-4 md:mb-0">
                <h3 className="md:text-xl font-bold font-['poppins'] -mb-1">
                  All Announcements
                </h3>
                <span className="text-sm md:text-xs text-gray-600 w-full md:max-w-[60%] truncate overflow-hidden">
                  Lorem ipsum dolor sit amet. Vel facilis ipsum ab repudiandae
                  expedita ea galisum sequi At suscipit magnam ut unde quaerat
                  ut saepe ullam.
                </span>
              </div>

              {/* View button */}
              <div className="flex-shrink-0 lg:w-auto md:ml-4 lg:ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out">
                <a
                  href="#"
                  className="w-full px-9 py-2 bg-indigo-400 text-white font-['poppins'] rounded-md shadow hover:bg-indigo-450 transition duration-500 ease-in-out text-center block sm:inline-block transform hover:scale-105"
                >
                  View
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Announcement;
