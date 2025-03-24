import React, { createContext, useContext, useState, useEffect } from 'react';

const MaintenanceContext = createContext();

export function MaintenanceProvider({ children }) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  useEffect(() => {
    // Check if maintenance mode is enabled via environment variable
    const maintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';
    setIsMaintenanceMode(maintenanceMode);
  }, []);

  return (
    <MaintenanceContext.Provider value={{ isMaintenanceMode }}>
      {children}
    </MaintenanceContext.Provider>
  );
}

export function useMaintenance() {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
}
