
import React from "react";
import { Clock } from "lucide-react";
import booksIcon from "/src/assets/images/icons/books_icon.png"; 
import schoolIcon from "/src/assets/images/icons/school_icon.png";

const AnnouncementsComponent = ({
  announcements,
  onAnnouncementClick,
  courseId // Add courseId prop
}) => {
  const getAnnouncementStyles = (announcement) => {
    // First check if announcement type exists
    if (!announcement || !announcement.type) {
      return "bg-gray-100 text-gray-800 border-gray-200"; // Default style
    }
    
    // Now safely use toLowerCase()
    const type = announcement.type.toLowerCase();
    
    switch (type) {
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
      onAnnouncementClick(announcement.announcement_id || announcement.id, courseId);
    }
  };
  
  // Function to get formatted date or fallback to placeholder
  const getFormattedDate = (timestamp) => {
    if (!timestamp) return "No date available";
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
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
            key={announcement.announcement_id || announcement.id || Math.random().toString()}
            onClick={() => handleAnnouncementClick(announcement)}
            className="group p-6 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={announcement.userImage || (announcement.course_id ? booksIcon : schoolIcon)}
                  alt=""
                  className="h-12 w-12 rounded-full border-2 border-gray-200"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200">
                      {announcement.title || "Untitled"}
                    </span>
                    <span className="flex items-center text-xs text-gray-500">
                      <Clock size={12} className="mr-1" />
                      {announcement.time || getFormattedDate(announcement.createdAt) || "Unknown date"}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-900 font-medium">
                  {announcement.description || announcement.message || "No content"}
                </p>
                {announcement.user && (
                  <div className="mt-1 text-xs text-gray-500">
                    By: {announcement.user.first_name || ''} {announcement.user.last_name || ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AnnouncementsComponent;