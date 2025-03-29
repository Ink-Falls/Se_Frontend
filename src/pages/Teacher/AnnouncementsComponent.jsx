import React from "react";
import {Clock } from "lucide-react";

const AnnouncementsComponent = ({
  announcements,
  onAnnouncementClick,
  courseId // Add courseId prop
}) => {
  const getAnnouncementStyles = (type) => {
    switch (type.toLowerCase()) {
      case "test reminder":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "project reminder":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "tutoring available":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleAnnouncementClick = (announcement) => {
    if (onAnnouncementClick) {
      onAnnouncementClick(announcement.id, courseId);
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      {announcements.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500 text-sm">No announcements available</p>
        </div>
      ) : (
        announcements.map((announcement) => (
          <div
            key={announcement.id}
            onClick={() => handleAnnouncementClick(announcement)}
            className="group p-6 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={announcement.userImage}
                  alt=""
                  className="h-12 w-12 rounded-full border-2 border-gray-200"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getAnnouncementStyles(
                        announcement.type
                      )}`}
                    >
                      {announcement.type}
                    </span>
                    <span className="flex items-center text-xs text-gray-500">
                      <Clock size={12} className="mr-1" />
                      {announcement.time}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-900 font-medium">
                  {announcement.description}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AnnouncementsComponent;
