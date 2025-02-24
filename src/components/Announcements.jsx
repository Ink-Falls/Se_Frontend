import React from "react";

const Announcements = ({ announcements, onAnnouncementClick }) => {
  return (
    <div className="divide-y divide-gray-200">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-100"
          onClick={() => onAnnouncementClick(announcement.id)}
        >
          {/* Left - Profile Image */}
          <img
            src={announcement.userImage}
            alt="User"
            className="w-10 h-10 rounded-full"
          />

          {/* Middle - Announcement Details */}
          <div className="flex-1 px-4">
            <h3 className="font-semibold">{announcement.type}</h3>
            <p className="text-sm text-gray-600">{announcement.description}</p>
          </div>

          {/* Right - Timestamp */}
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {announcement.time}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Announcements;
