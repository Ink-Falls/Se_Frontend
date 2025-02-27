import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, SortAsc, SortDesc } from "lucide-react";

const Notifications = ({ notifications = [] }) => {
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Sort notifications
  const sortedNotifications = [...notifications].sort((a, b) => {
    return sortOrder === "newest" ? b.id - a.id : a.id - b.id;
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-white py-3 px-4 sm:py-4 sm:px-6 flex items-center justify-between border-b">
        <h2 className="text-md sm:text-lg font-semibold text-gray-700">
          All notifications ({notifications.length})
        </h2>

        {/* Sort Dropdown */}
        <div className="relative inline-block text-left">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="inline-flex justify-center items-center bg-white border border-gray-300 text-gray-600 hover:text-gray-800 rounded-md py-1.5 px-2 sm:py-2 sm:px-3 text-xs sm:text-sm font-medium focus:outline-none"
          >
            {sortOrder === "newest" ? (
              <SortAsc className="w-4 h-4 mr-1" />
            ) : (
              <SortDesc className="w-4 h-4 mr-1" />
            )}
            Sort by
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-28 sm:w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <button
                onClick={() => setSortOrder("newest")}
                className="block w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-gray-100"
              >
                Newest
              </button>
              <button
                onClick={() => setSortOrder("oldest")}
                className="block w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-gray-100"
              >
                Oldest
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <p className="p-4 sm:p-6 text-gray-500 text-sm sm:text-md">
          No notifications available.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {sortedNotifications.map((notification) => (
            <li
              key={notification.id}
              className="flex items-center py-4 px-4 sm:py-6 sm:px-6 hover:bg-gray-50 transition"
            >
              <img
                src={notification.userImage}
                alt="User Avatar"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-3 sm:mr-4"
              />
              <div className="flex-1">
                <Link
                  to={`/NotificationPage/${notification.id}`}
                  state={{ notification }}
                  className="text-md max-md:text-sm font-semibold text-[#334155] hover:text-blue-500 transition"
                >
                  {notification.type}
                </Link>
                <p className="text-sm max-md:text-xs text-gray-600 mt-0.5 sm:mt-1">
                  {notification.description}
                </p>
              </div>
              <span className="text-xs text-gray-500 ml-2 flex items-center">
                {notification.time}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
