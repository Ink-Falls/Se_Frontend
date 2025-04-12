import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

const LoadingSpinner = ({ text = "Loading", showOverlay = true }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div
      data-testid="loading-spinner"
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      {showOverlay && (
        <div className="absolute inset-0 bg-gray-900/20 dark:bg-gray-900/40 backdrop-blur-[1px]"></div>
      )}

      <div className={`relative flex flex-col items-center gap-4 ${isDarkMode ? 'bg-gray-800/90' : 'bg-white/80'} backdrop-blur-sm p-8 rounded-lg shadow-lg`}>
        <div className="relative w-16 h-16">
          {/* Main rings */}
          <div className="absolute inset-0 rounded-full border-4 border-[#F6BA18] opacity-20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#F6BA18] border-t-[#212529] dark:border-t-gray-300 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-[#F6BA18] opacity-40"></div>
          <div className="absolute inset-2 rounded-full border-4 border-[#F6BA18] border-t-[#212529] dark:border-t-gray-300 animate-spin [animation-delay:0.2s]"></div>

          {/* Additional decorative elements */}
          <div className="absolute inset-0 rounded-full border-[2px] border-[#F6BA18]/20 scale-150 animate-ping"></div>
          <div className="absolute inset-[-8px] rounded-full border border-[#F6BA18]/10"></div>
        </div>

        {/* Loading text with dot animation */}
        <div className="flex items-center gap-1">
          <p className="relative text-[#212529] dark:text-gray-100 font-medium text-lg tracking-wide">
            {text}
          </p>
          <span className="animate-bounce dark:text-gray-100">.</span>
          <span className="animate-bounce [animation-delay:0.2s] dark:text-gray-100">.</span>
          <span className="animate-bounce [animation-delay:0.4s] dark:text-gray-100">.</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
