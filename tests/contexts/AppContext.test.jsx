import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useAppState } from '../../src/contexts/AppContext';

describe('AppContext', () => {
  it('initializes with default values', () => {
    const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
    const { result } = renderHook(() => useAppState(), { wrapper });

    expect(result.current.state.user).toBeNull();
    expect(result.current.state.notifications).toEqual([]);
    expect(result.current.state.settings).toEqual({});
    expect(result.current.state.cachedData).toEqual({});
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.modals).toEqual({
      isOpen: false,
      type: null,
      data: null,
    });
    expect(result.current.state.pagination).toEqual({
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
    });
  });

  it('updates user state correctly', () => {
    const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => {
      result.current.actions.setUser({ id: 1, name: 'John Doe' });
    });

    expect(result.current.state.user).toEqual({ id: 1, name: 'John Doe' });
  });

  it('clears cached data correctly', () => {
    const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => {
      result.current.actions.clearCache();
    });

    expect(result.current.state.cachedData).toEqual({});
  });

  it('sets modal state correctly', () => {
    const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => {
      result.current.actions.setModal({ isOpen: true, type: 'info', data: { message: 'Test modal' } });
    });

    expect(result.current.state.modals).toEqual({
      isOpen: true,
      type: 'info',
      data: { message: 'Test modal' },
    });
  });

  it('updates pagination state correctly', () => {
    const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => {
      result.current.actions.setPagination({ currentPage: 2, totalPages: 5 });
    });

    expect(result.current.state.pagination).toEqual({
      currentPage: 2,
      totalPages: 5,
      pageSize: 10,
    });
  });

  it('clears error state correctly', () => {
    const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => {
      result.current.actions.clearError();
    });

    expect(result.current.state.error).toBeNull();
  });

  it('throws an error if useAppState is used outside AppProvider', () => {
    const { result } = renderHook(() => {
      try {
        return useAppState();
      } catch (error) {
        return error;
      }
    });

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('useAppState must be used within AppProvider');
  });
});