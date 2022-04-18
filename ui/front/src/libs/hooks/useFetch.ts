import { useEffect } from 'react';
import useObjectState from './useObjectState';

function useFetch<T extends object>(
  statusFetcher: (arg: PromiseArg<Partial<T>>) => void, initialState: T, errorCatcher: (e:Error) => void
) {
  const [status, setStatus] = useObjectState(initialState);

  useEffect(() => {
    new Promise((resolve) => {
      setTimeout(() => statusFetcher(resolve), 1000);
    }).then((data) => setStatus(data as Partial<T>))
    .catch((err) => errorCatcher(err));
  }, [status]);

  return status;
}

export default useFetch;
