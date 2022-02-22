/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';

const useAsyncError = () => {
  const [_, setError] = React.useState();
  return React.useCallback(
    (e:Error) => {
      setError(() => {
        throw e;
      });
    },
    [setError]
  );
};

export default useAsyncError;
