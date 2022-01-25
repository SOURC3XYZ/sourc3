import React from 'react';

const useAsyncError = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setError] = React.useState();
  return React.useCallback(
    (e) => {
      setError(() => {
        throw e;
      });
    },
    [setError]
  );
};

export default useAsyncError;
