import { useCallback, useRef } from 'react';

export const useDebounce = <T extends Array<any>>(callback: (...args:T) => void, delay: number) => {
  const timeout = useRef<NodeJS.Timeout | null>(null);

  const debounce = useCallback((...args: T) => {
    if (timeout.current) clearTimeout(timeout.current);

    timeout.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);

  return debounce;
};
