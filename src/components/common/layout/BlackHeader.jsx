import React from "react";

const BlackHeader = ({ title, count, children }) => {
  return (
    <div className="flex justify-between items-center py-4 px-6 bg-[#212529] text-white rounded-t-lg">
      <div className="flex items-center space-x-3">
        {typeof title === "string" ? (
          <>
            <h2 className="font-semibold text-lg">{title}</h2>
            {count !== undefined && (
              <span className="px-2.5 py-0.5 text-sm bg-gray-800 text-gray-300 rounded-full">
                {count}
              </span>
            )}
          </>
        ) : (
          title
        )}
      </div>
      <div className="flex items-center space-x-2">
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            className: `p-2 text-gray-300 hover:text-white rounded-md transition-colors duration-150 ${
              child.props.className || ""
            }`,
          })
        )}
      </div>
    </div>
  );
};

export default BlackHeader;
