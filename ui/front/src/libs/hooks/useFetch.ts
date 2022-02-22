import axios from 'axios';
import { useEffect } from 'react';
import useObjectState from './useObjectState';

function useFetch<T extends object>(
  url: string, initialState: T, errorCatcher: (e:Error) => void
) {
  const [status, setStatus] = useObjectState(initialState);

  useEffect(() => {
    setTimeout(() => {
      axios.get(url)
        .then((res) => res.data)
        .then((data) => setStatus(data))
        .catch((err) => errorCatcher(err));
    }, 1000);
  });

  return status;
}

export default useFetch;
