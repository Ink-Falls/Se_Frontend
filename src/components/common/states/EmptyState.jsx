import React from 'react';
import { BookX } from 'lucide-react';

const EmptyState = ({ title, message, icon: Icon = BookX }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <Icon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
};

export default EmptyState;
