import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFetch } from "../../src/hooks/useFetch";
import fetchWithInterceptor from "../../src/services/apiService";

// Create mock functions before mocking modules
const mockDispatch = vi.fn();
const mockClearError = vi.fn();
const mockUseAppState = vi.fn(() => ({
  state: { cachedData: {} },
  dispatch: mockDispatch,
  actions: { clearError: mockClearError },
}));

// Mock the entire modules
vi.mock("../../src/contexts/AppContext", () => ({
  useAppState: () => mockUseAppState(),
}));

vi.mock("../../src/services/apiService", () => ({
  default: vi.fn(),
}));

describe("useFetch Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset the mock implementation for each test
    mockUseAppState.mockImplementation(() => ({
      state: { cachedData: {} },
      dispatch: mockDispatch,
      actions: { clearError: mockClearError },
    }));
  });

  it("fetches data successfully", async () => {
    // Mock API response
    const mockResponse = { data: "mock data" };
    fetchWithInterceptor.mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockResponse),
    });

    const { result } = renderHook(() => useFetch("/test-url"));

    // Wait for the fetch to complete
    await act(async () => {
      await result.current.refetch();
    });

    // Verify the data and loading state
    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.isLoading).toBe(false);

    // Verify dispatch calls
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_LOADING",
      payload: true,
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "UPDATE_CACHE",
      payload: { key: "/test-url", data: mockResponse },
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_LOADING",
      payload: false,
    });
  });

  it("handles errors during fetch", async () => {
    // Mock API error
    const mockError = new Error("Fetch failed");
    fetchWithInterceptor.mockRejectedValue(mockError);

    const { result } = renderHook(() => useFetch("/test-url"));

    // Wait for the fetch to complete
    await act(async () => {
      try {
        await result.current.refetch();
      } catch (err) {
        // Expected error
      }
    });

    // Verify the error and loading state
    expect(result.current.error).toBe("Fetch failed");
    expect(result.current.isLoading).toBe(false);

    // Verify dispatch calls
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_LOADING",
      payload: true,
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_ERROR",
      payload: "Fetch failed",
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_LOADING",
      payload: false,
    });
  });

  it("uses cached data if available", async () => {
    // Mock cached data
    const cachedTimestamp = Date.now();
    mockUseAppState.mockImplementation(() => ({
      state: {
        cachedData: {
          "/test-url": {
            data: "cached data",
            timestamp: cachedTimestamp,
          },
        },
      },
      dispatch: mockDispatch,
      actions: { clearError: mockClearError },
    }));

    const { result } = renderHook(() => useFetch("/test-url"));

    // Verify that cached data is used
    expect(result.current.data).toBe("cached data");
    expect(result.current.isLoading).toBe(false);

    // Verify no fetch call is made
    expect(fetchWithInterceptor).not.toHaveBeenCalled();
  });

  it("refetches data successfully", async () => {
    // Mock API response
    const mockResponse = { data: "new data" };
    fetchWithInterceptor.mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockResponse),
    });

    const { result } = renderHook(() => useFetch("/test-url"));

    // Trigger refetch
    await act(async () => {
      await result.current.refetch();
    });

    // Verify the new data
    expect(result.current.data).toEqual(mockResponse);

    // Verify dispatch calls
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_LOADING",
      payload: true,
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "UPDATE_CACHE",
      payload: { key: "/test-url", data: mockResponse },
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_LOADING",
      payload: false,
    });
  });

  it("cleans up on unmount", async () => {
    const { result, unmount } = renderHook(() => useFetch("/test-url"));

    // Unmount the hook
    unmount();

    // Verify that data and error are reset
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
