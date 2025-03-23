import React from "react";

const LoadingSpinner = () => {
  return (
    <div data-testid="loading-spinner" className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-[#F6BA18] border-t-[#212529] rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
