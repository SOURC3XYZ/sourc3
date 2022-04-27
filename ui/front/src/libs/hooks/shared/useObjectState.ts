import React from 'react';

function useObjectState<T extends object>(obj: T) {
  const [state, setState] = React.useState<T>(obj);
  const setObjectState = (incomingData:Partial<T>) => {
    setState((prev) => ({ ...prev, ...incomingData }));
  };
  return [state, setObjectState] as const;
}

export default useObjectState;
