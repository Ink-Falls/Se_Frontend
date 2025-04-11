import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { useTheme } from './ThemeContext'; // Import useTheme

const NetworkContext = createContext();

const RECONNECT_INTERVAL = 5000; // 5 seconds between reconnection attempts

// Custom alert component with updated colors and close button
const NetworkAlert = ({ message, type, onClose }) => {
  const { isDarkMode } = useTheme(); // Get theme state

  // Define styles with dark mode variants
  const alertStyles = {
    success: 'bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-600 text-green-800 dark:text-green-300',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-600 text-red-800 dark:text-red-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-300',
    info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-300',
    offline: 'bg-[#212529] dark:bg-gray-800 border-[#F6BA18] dark:border-yellow-500 text-white dark:text-gray-100' // Adjusted offline for dark
  };

  return (
    <div className={`
      fixed top-4 right-4 max-w-sm w-full shadow-lg dark:shadow-dark-lg rounded-lg pointer-events-auto
      border-l-4 p-4 z-50 transition-all duration-500 ease-in-out
      ${alertStyles[type] || alertStyles.info}`
    }>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {type === 'offline' && '📡'}
            {type === 'success' && '🟢'}
            {type === 'error' && '🔴'} 
            {type === 'warning' && '🟡'}
            {type === 'info' && '🔵'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium mb-2">{message}</p>
            {type === 'offline' && (
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#F6BA18] text-[#212529] rounded-md text-sm font-medium 
                         hover:bg-[#64748B] hover:text-white dark:bg-yellow-500 dark:text-black dark:hover:bg-yellow-400 transition-colors duration-300"
              >
                Retry Connection
              </button>
            )}
          </div>
        </div>
        {/* Close button */}
        <button
          onClick={onClose}
          className={`p-1 rounded-full transition-colors duration-200 ${
            type === 'offline' 
              ? 'text-white dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-600' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export function NetworkProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionStrength, setConnectionStrength] = useState('unknown');
  const [lastOnlineTime, setLastOnlineTime] = useState(Date.now());
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [networkAlert, setNetworkAlert] = useState(null);

  // Update showNetworkAlert to include onClose handler
  const showNetworkAlert = useCallback((message, type) => {
    setNetworkAlert({ 
      message, 
      type, 
      onClose: () => setNetworkAlert(null)
    });
    
    // Only auto-dismiss success alerts
    if (type === 'success') {
      setTimeout(() => setNetworkAlert(null), 3000);
    }
  }, []);

  // Update connection strength using Network Information API if available
  const updateConnectionStrength = useCallback(() => {
    if (!navigator.onLine) {
      setConnectionStrength('offline');
      setIsOnline(false);
      showNetworkAlert('You are currently offline. Please check your internet connection.', 'offline');
      return;
    }

    // Only proceed with connection strength check if online
    if ('connection' in navigator && navigator.onLine) {
      const connection = navigator.connection;
      const newStrength = connection.effectiveType || 'unknown';
      setConnectionStrength(newStrength);
      
      // Show connection restore message first
      if (!isOnline) {
        showNetworkAlert('Network connection restored - You are back online', 'success');
        // Add delay before showing connection quality alert
        setTimeout(() => {
          // Check connection quality after restore
          if (newStrength === 'slow-2g' || newStrength === '2g') {
            showNetworkAlert(`Very slow connection detected (${newStrength})`, 'error');
          } else if (newStrength === '3g') {
            showNetworkAlert(`Slow connection detected (${newStrength})`, 'warning');
          } else if (newStrength === '4g') {
            showNetworkAlert(`Good connection detected (${newStrength})`, 'success');
          } else if (newStrength === 'unknown') {
            showNetworkAlert('Connection speed fluctuating', 'info');
          }
        }, 3000); // Wait 3 seconds after restore message
        return;
      }

      // Handle normal connection quality updates when already online
      if (newStrength === 'slow-2g' || newStrength === '2g') {
        showNetworkAlert(`Very slow connection detected (${newStrength})`, 'error');
      } else if (newStrength === '3g') {
        showNetworkAlert(`Slow connection detected (${newStrength})`, 'warning');
      } else if (newStrength === '4g') {
        showNetworkAlert(`Good connection detected (${newStrength})`, 'success');
      } else if (newStrength === 'unknown') {
        showNetworkAlert('Connection speed fluctuating', 'info');
      }
    }
  }, [showNetworkAlert, isOnline]);

  // Handle going online with improved status check
  const handleOnline = useCallback(() => {
    // Double check online status
    if (!navigator.onLine) return;

    // console.log('🌐 Network Status: Online');
    setIsOnline(true);
    setLastOnlineTime(Date.now());
    setReconnectAttempts(0);
    
    // Delay updating connection strength to ensure accurate reading
    setTimeout(updateConnectionStrength, 1000);

    showNetworkAlert('Network connection restored - You are back online', 'success');

    // Show success notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Connection Restored', {
        body: 'Your internet connection has been restored.',
        icon: '/network-icon.png'
      });
    }
  }, [updateConnectionStrength, showNetworkAlert]);

  // Handle offline state immediately
  const handleOffline = useCallback(() => {
    // Only show message and update state if we're not already offline
    if (isOnline) {
      // console.log('🌐 Network Status: Offline');
      setIsOnline(false);
      setConnectionStrength('offline');
      
      showNetworkAlert(
        'You are currently offline. Please check your internet connection.',
        'offline'
      );

      // Start reconnection attempts
      const interval = setInterval(() => {
        if (navigator.onLine) {
          clearInterval(interval);
          handleOnline();
        }
      }, RECONNECT_INTERVAL);

      // Cleanup interval on component unmount
      return () => clearInterval(interval);
    }
  }, [isOnline, handleOnline, showNetworkAlert]);

  // Listen for online/offline events
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  // Separate effect for connection monitoring
  useEffect(() => {
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', updateConnectionStrength);
    }

    return () => {
      if ('connection' in navigator) {
        navigator.connection.removeEventListener('change', updateConnectionStrength);
      }
    };
  }, [updateConnectionStrength]);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Initial online status check
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      handleOffline();
    }

    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up connection monitoring if available
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', updateConnectionStrength);
    }

    // Initial connection strength check
    updateConnectionStrength();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('connection' in navigator) {
        navigator.connection.removeEventListener('change', updateConnectionStrength);
      }
    };
  }, [handleOnline, handleOffline, updateConnectionStrength]);

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        connectionStrength,
        lastOnlineTime,
        reconnectAttempts,
      }}
    >
      {/* Network Alert */}
      {networkAlert && (
        <NetworkAlert 
          message={networkAlert.message} 
          type={networkAlert.type}
          onClose={networkAlert.onClose}
        />
      )}
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}

// Optional: Export a hook for checking before making API calls
export function useNetworkAwareRequest() {
  const { isOnline, connectionStrength } = useNetwork();

  const makeRequest = useCallback(async (requestFn, failureCallback) => {
    if (!isOnline) {
      failureCallback?.('No internet connection');
      throw new Error('No internet connection');
    }

    try {
      const result = await requestFn();
      return result;
    } catch (error) {
      failureCallback?.(error.message);
      throw error;
    }
  }, [isOnline]);

  return {
    makeRequest,
    isOnline,
    connectionStrength,
  };
}
