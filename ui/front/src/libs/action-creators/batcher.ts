import { batch } from 'react-redux';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

type CustomDispatch<R, T extends Action> = ThunkDispatch<R, {}, T>;

function batcher<R, T extends Action>(
  dispatch: CustomDispatch<R, T>, chain: T[]
) {
  batch(() => {
    chain.forEach((el) => {
      dispatch(el);
    });
  });
}

export default batcher;
