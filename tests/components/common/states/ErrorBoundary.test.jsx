import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorBoundary from 'Se_Frontend/src/components/common/ErrorBoundary.jsx';

describe('ErrorBoundary Component', () => {
  const ProblematicComponent = () => {
    throw new Error('Test error');
  };

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Child Component</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('catches errors and displays the error message', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText("We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.")).toBeInTheDocument();
  });

  it('displays error details in development mode', () => {
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error Details:')).toBeInTheDocument();
    expect(screen.getByText((content, element) => content.includes('Error: Test error'))).toBeInTheDocument();
  });

  it('does not display error details in production mode', () => {
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Error Details:')).not.toBeInTheDocument();
  });

  it('reloads the page when the refresh button is clicked', () => {
    const originalLocation = window.location;
    delete window.location;
    window.location = { reload: vi.fn() };

    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('Refresh Page'));
    expect(window.location.reload).toHaveBeenCalled();

    window.location = originalLocation;
  });
});