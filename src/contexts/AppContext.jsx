import React, { createContext, useContext, useReducer, useCallback } from 'react';

const AppContext = createContext();

const initialState = {
  user: null,               // ✓ User management
  notifications: [],        // ✓ Notification handling
  settings: {},            // ✓ App settings
  cachedData: {},          // ✓ Data caching
  isLoading: false,        // ✓ Loading states
  error: null,             // ✓ Error handling
  modals: {                // ✓ Modal management
    isOpen: false,
    type: null,
    data: null
  },
  pagination: {            // ✓ Pagination handling
    currentPage: 1,
    totalPages: 1,
    pageSize: 10
  }
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_CACHE':
      return {
        ...state,
        cachedData: {
          ...state.cachedData,
          [action.payload.key]: {
            data: action.payload.data,
            timestamp: Date.now()
          }
        }
      };
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...action.payload
        }
      };
    case 'CLEAR_CACHE':
      return {
        ...state,
        cachedData: {}
      };
    case 'SET_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          ...action.payload
        }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Add action creators
  const actions = {
    setUser: useCallback((user) => {
      dispatch({ type: 'SET_USER', payload: user });
    }, []),

    clearCache: useCallback(() => {
      dispatch({ type: 'CLEAR_CACHE' });
    }, []),

    setModal: useCallback((modalState) => {
      dispatch({ type: 'SET_MODAL', payload: modalState });
    }, []),

    setPagination: useCallback((paginationData) => {
      dispatch({ type: 'SET_PAGINATION', payload: paginationData });
    }, []),

    clearError: useCallback(() => {
      dispatch({ type: 'CLEAR_ERROR' });
    }, [])
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
}
