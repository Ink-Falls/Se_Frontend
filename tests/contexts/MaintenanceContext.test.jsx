import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MaintenanceProvider, useMaintenance } from 'Se_Frontend/src/contexts/MaintenanceContext';

// Test component to use the context
const TestComponent = () => {
  const { isMaintenanceMode } = useMaintenance();
  return <div>{isMaintenanceMode ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled'}</div>;
};

describe('MaintenanceContext', () => {
  beforeEach(() => {
    vi.resetModules(); // Reset modules to ensure environment variable changes are applied
  });

  it('should enable maintenance mode when the environment variable is set to true', () => {
    import.meta.env.VITE_MAINTENANCE_MODE = 'true';

    render(
      <MaintenanceProvider>
        <TestComponent />
      </MaintenanceProvider>
    );

    expect(screen.getByText('Maintenance Mode Enabled')).toBeInTheDocument();
  });

  it('should disable maintenance mode when the environment variable is set to false', () => {
    import.meta.env.VITE_MAINTENANCE_MODE = 'false';

    render(
      <MaintenanceProvider>
        <TestComponent />
      </MaintenanceProvider>
    );

    expect(screen.getByText('Maintenance Mode Disabled')).toBeInTheDocument();
  });

  it('should throw an error if useMaintenance is used outside of MaintenanceProvider', () => {
    const renderOutsideProvider = () => render(<TestComponent />);

    expect(renderOutsideProvider).toThrow('useMaintenance must be used within a MaintenanceProvider');
  });
});