import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import { ChevronDown, SortAsc, SortDesc } from "lucide-react";

const Notifications = ({ notifications = [] }) => {
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Sort the notifications based on sortOrder
  const sortedNotifications = [...notifications].sort((a, b) => {
    return sortOrder === "newest" ? b.id - a.id : a.id - b.id;
  });

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const setOldest = () => {
    setSortOrder("oldest");
    setDropdownOpen(false);
  };
  const setNewest = () => {
    setSortOrder("newest");
    setDropdownOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-white py-4 px-6 flex items-center justify-between border-b">
        <h2 className="text-lg font-semibold text-gray-700">
          All notifications ({notifications.length})
        </h2>

        {/* Sort Dropdown */}
        <div className="relative inline-block text-left">
          <button
            type="button"
            onClick={toggleDropdown}
            className="inline-flex justify-center items-center bg-white border border-gray-300 text-gray-600 hover:text-gray-800 rounded-md py-2 px-3 text-sm font-medium focus:outline-none"
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
          <div
            className={`${
              dropdownOpen ? "block" : "hidden"
            } absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5`}
          >
            <button
              onClick={setNewest}
              className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              Newest
            </button>
            <button
              onClick={setOldest}
              className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              Oldest
            </button>
          </div>
        </div>
      </div>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <p className="p-6 text-gray-500">No notifications available.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {sortedNotifications.map((notification) => (
            <li
              key={notification.id}
              className="flex items-center py-6 px-6 hover:bg-gray-50 transition-colors duration-150"
            >
              <img
                src={notification.userImage}
                alt="User Avatar"
                className="w-10 h-10 rounded-full mr-4"
              />
              <div className="flex-1">
                {/* Link to individual notification page */}
                <Link
                  to={`/NotificationPage/${notification.id}`}
                  state={{ notification }}
                  className="text-md font-semibold mb-[0.5vw text-[#334155] hover:text-blue-500 transition"
                >
                  {notification.type}
                </Link>
                <p className="text-sm text-gray-600">
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
