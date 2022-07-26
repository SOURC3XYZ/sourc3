import { PromiseArg } from '@types';
import { useEffect, useRef } from 'react';
import useObjectState from './useObjectState';

function useTimeoutFetch<T extends object>(statusFetcher: (arg: PromiseArg<Partial<T>>
) => void, initialState: T, errorCatcher: (e:Error) => void) {
  const [status, setStatus] = useObjectState(initialState);
  const refTimeoutId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => () => {
    if (refTimeoutId.current) clearTimeout(refTimeoutId.current);
  }, []);

  useEffect(() => {
    new Promise((resolve) => {
      refTimeoutId.current = setTimeout(() => statusFetcher(resolve), 1000);
    }).then((data) => setStatus(data as Partial<T>))
      .catch((err) => errorCatcher(err));
  }, [status]);

  return status;
}

export default useTimeoutFetch;
