import { useReducer } from 'react';

function useReducerWithThunk(reducer:any, initialState:any) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const customDispatch = (action:any) => {
    if (typeof action === 'function') {
      action(customDispatch);
    } else {
      dispatch();
    }
  };
  return [state, customDispatch];
}

export default useReducerWithThunk;
