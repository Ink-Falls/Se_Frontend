import React from 'react';
import { Wrench, Clock } from 'lucide-react';
import logo from '/src/assets/images/ARALKADEMYLOGO.png';

const MaintenanceMode = () => {
  const duration = import.meta.env.VITE_MAINTENANCE_DURATION || 2; // Default to 2 hours if not set

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-[#121212] py-4 px-6">
        <img src={logo} alt="ARALKADEMY Logo" className="h-10" />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 relative overflow-hidden">
          {/* Yellow accent bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-[#F6BA18]" />

          {/* Content */}
          <div className="space-y-6 text-center">
            {/* Animated Icon */}
            <div className="flex justify-center">
              <div className="relative inline-block">
                <Wrench size={64} className="text-[#F6BA18] animate-spin-slow" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-[#212529]">
              System Maintenance
            </h1>

            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Clock className="animate-pulse" />
              <p>Expected Duration: {duration} hours</p>
            </div>

            <p className="text-gray-600 max-w-md mx-auto">
              We're currently performing scheduled maintenance to improve your
              learning experience. Please check back later.
            </p>

            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-[#F6BA18] rounded-full animate-progress" />
            </div>

            {/* Contact Information */}
            <div className="mt-8 text-sm text-gray-500">
              <p>Need assistance? Contact us at:</p>
              <p className="font-medium">support@aralkademy.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceMode;
