import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NetworkProvider, useNetwork, useNetworkAwareRequest } from "Se_Frontend/src/contexts/NetworkContext";

// Mock `navigator.onLine` and `navigator.connection`
Object.defineProperty(navigator, "onLine", {
  writable: true,
  value: true,
});

const mockConnection = {
  effectiveType: "4g",
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};
Object.defineProperty(navigator, "connection", {
  writable: true,
  value: mockConnection,
});

describe("NetworkContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the NetworkProvider and provides initial state", () => {
    const TestComponent = () => {
      const { isOnline, connectionStrength } = useNetwork();
      return (
        <div>
          <p>Online: {isOnline ? "Yes" : "No"}</p>
          <p>Connection Strength: {connectionStrength}</p>
        </div>
      );
    };

    render(
      <NetworkProvider>
        <TestComponent />
      </NetworkProvider>
    );

    expect(screen.getByText("Online: Yes")).toBeInTheDocument();
    //expect(screen.getByText("Connection Strength: unknown")).toBeInTheDocument();
  });

  it("handles offline and online events", () => {
    const TestComponent = () => {
      const { isOnline } = useNetwork();
      return <p>Online: {isOnline ? "Yes" : "No"}</p>;
    };

    render(
      <NetworkProvider>
        <TestComponent />
      </NetworkProvider>
    );

    // Simulate going offline
    act(() => {
      navigator.onLine = false;
      window.dispatchEvent(new Event("offline"));
    });

    expect(screen.getByText("Online: No")).toBeInTheDocument();

    // Simulate going online
    act(() => {
      navigator.onLine = true;
      window.dispatchEvent(new Event("online"));
    });

    expect(screen.getByText("Online: Yes")).toBeInTheDocument();
  });

  it("updates connection strength when the connection changes", () => {
    const TestComponent = () => {
      const { connectionStrength } = useNetwork();
      return <p>Connection Strength: {connectionStrength}</p>;
    };

    render(
      <NetworkProvider>
        <TestComponent />
      </NetworkProvider>
    );

    // Simulate a connection change
    act(() => {
      mockConnection.effectiveType = "3g";
      mockConnection.addEventListener.mock.calls[0][1](); // Trigger the "change" event
    });

    expect(screen.getByText("Connection Strength: 3g")).toBeInTheDocument();
  });

  it("throws an error if `useNetwork` is used outside of `NetworkProvider`", () => {
    const TestComponent = () => {
      useNetwork();
      return null;
    };

    expect(() => render(<TestComponent />)).toThrow(
      "useNetwork must be used within a NetworkProvider"
    );
  });

  it("makes network-aware requests using `useNetworkAwareRequest`", async () => {
    const mockRequestFn = vi.fn().mockResolvedValue("Success");
    const mockFailureCallback = vi.fn();
  
    const TestComponent = () => {
      const { makeRequest } = useNetworkAwareRequest();
  
      const handleRequest = async () => {
        try {
          const result = await makeRequest(mockRequestFn, mockFailureCallback);
          return result;
        } catch (error) {
          return error.message;
        }
      };
  
      return (
        <button onClick={handleRequest} data-testid="request-button">
          Make Request
        </button>
      );
    };
  
    render(
      <NetworkProvider>
        <TestComponent />
      </NetworkProvider>
    );
  
    // Simulate a successful request
    const button = screen.getByTestId("request-button");
    await act(async () => {
      button.click();
    });
  
    expect(mockRequestFn).toHaveBeenCalled();
    expect(mockFailureCallback).not.toHaveBeenCalled();
  
    // Simulate offline state
    act(() => {
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event("offline"));
    });
  
    await act(async () => {
      button.click();
    });
  
    expect(mockFailureCallback).toHaveBeenCalledWith("No internet connection");
  });
});