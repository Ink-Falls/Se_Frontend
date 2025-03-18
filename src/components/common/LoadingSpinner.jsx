import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="relative">
        {/* Primary outer spinner */}
        <div className="w-12 h-12 rounded-full border-4 border-[#F6BA18] border-t-transparent animate-spin"></div>
        {/* Secondary inner spinner */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-4 border-[#212529] border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
