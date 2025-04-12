import React from 'react';
import { BookX } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const EmptyState = ({ title, message, icon: Icon = BookX }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center transition-colors">
        <Icon
          className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4"
          role="img"
          aria-hidden="true"
        />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
};

export default EmptyState;
