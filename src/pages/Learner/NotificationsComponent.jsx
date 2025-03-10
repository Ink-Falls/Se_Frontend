import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, SortAsc, SortDesc } from "lucide-react";

const NotificationsComponent = ({ notifications = [] }) => {
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Sort notifications
  const sortedNotifications = [...notifications].sort((a, b) => {
    return sortOrder === "newest" ? b.id - a.id : a.id - b.id;
  });

  const getNotificationStyles = (type) => {
    switch (type.toLowerCase()) {
      case "course update":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "assignment due":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className="bg-gray-50 py-4 px-6 flex items-center justify-between border-b">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
          <span className="px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-200 text-gray-700">
            {notifications.length}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            {sortOrder === "newest" ? (
              <SortAsc className="w-4 h-4 mr-2" />
            ) : (
              <SortDesc className="w-4 h-4 mr-2" />
            )}
            {sortOrder === "newest" ? "Newest first" : "Oldest first"}
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    setSortOrder("newest");
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Newest first
                </button>
                <button
                  onClick={() => {
                    setSortOrder("oldest");
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Oldest first
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500 text-sm">No new notifications</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {sortedNotifications.map((notification) => (
            <li
              key={notification.id}
              className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
            >
              <Link
                to={`/Learner/NotificationDetails/${notification.id}`}
                state={{ notification }}
                className="block p-6"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={notification.userImage}
                      alt=""
                      className="h-12 w-12 rounded-full border-2 border-gray-200"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getNotificationStyles(
                          notification.type
                        )}`}
                      >
                        {notification.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-900 font-medium">
                      {notification.description}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsComponent;
