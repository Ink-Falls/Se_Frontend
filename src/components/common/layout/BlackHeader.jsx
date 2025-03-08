import React from "react";

const BlackHeader = ({ title, count, children }) => {
  return (
    <div className="flex justify-between items-center py-3 px-6 bg-[#212529] text-white rounded-t-lg">
      <span className="font-semibold text-md">
        {title} {count !== undefined && <span>({count})</span>}
      </span>
      <div className="flex space-x-2">{children}</div>
    </div>
  );
};

export default BlackHeader;
