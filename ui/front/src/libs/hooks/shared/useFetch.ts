import { EVENTS } from '@libs/constants';
import {
  useEffect, useReducer, useRef
} from 'react';
import { useCustomEvent } from './useCustomEvent';

interface State<T> {
  data?: T
  error?: Error,
  loading?:boolean
}

type Action<T> =
  | { type: 'loading'; payload: boolean }
  | { type: 'fetched'; payload: T }
  | { type: 'error'; payload: Error };

function useFetch<T = unknown>(url?: string, options?: RequestInit, loading?:boolean): State<T> {
  const cancelRequest = useRef<boolean>(false);

  const initialState: State<T> = {
    loading: false,
    error: undefined,
    data: undefined
  };

  const fetchReducer = (state: State<T>, action: Action<T>): State<T> => {
    switch (action.type) {
      case 'loading':
        return { ...state, loading: action.payload };
      case 'fetched':
        return { ...state, data: action.payload };
      case 'error':
        return { ...state, error: action.payload };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(fetchReducer, initialState);

  const fetchData = async () => {
    if (!url) return;

    cancelRequest.current = false;

    if (loading) dispatch({ type: 'loading', payload: true });

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = (await response.json()) as T;
      if (cancelRequest.current) return;

      dispatch({ type: 'fetched', payload: data });
    } catch (error) {
      if (cancelRequest.current) return;

      dispatch({ type: 'error', payload: error as Error });
    } dispatch({ type: 'loading', payload: false });
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  useCustomEvent(EVENTS.SUBUNSUB, fetchData);

  return state;
}

export default useFetch;
