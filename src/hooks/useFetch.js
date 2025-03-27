import { useState, useEffect, useCallback } from 'react';
import { useAppState } from '../contexts/AppContext';
import fetchWithInterceptor from '../services/apiService';

export function useFetch(url, options = {}) {
  const { state, dispatch, actions } = useAppState();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add refetch capability
  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      dispatch({ type: 'SET_LOADING', payload: true });
      actions.clearError();

      const response = await fetchWithInterceptor(url, options);
      const result = await response.json();

      setData(result);
      dispatch({
        type: 'UPDATE_CACHE',
        payload: { key: url, data: result }
      });

      return result;
    } catch (err) {
      setError(err.message);
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    } finally {
      setIsLoading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [url, options]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        dispatch({ type: 'SET_LOADING', payload: true });

        // Check cache first
        const cached = state.cachedData[url];
        if (cached && Date.now() - cached.timestamp < 300000) {
          setData(cached.data);
          return;
        }

        await refetch();
      } catch (err) {
        setError(err.message);
        dispatch({ type: 'SET_ERROR', payload: err.message });
      } finally {
        setIsLoading(false);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    if (url) {
      fetchData();
    }

    return () => {
      // Cleanup
      setData(null);
      setError(null);
    };
  }, [url]);

  return { data, error, isLoading, refetch };
}
