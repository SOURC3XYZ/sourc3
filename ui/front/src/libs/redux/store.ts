import { createStore, applyMiddleware } from 'redux';
import thunk, { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import {
  TypedUseSelectorHook,
  useDispatch as useReduxDispatch,
  useSelector as useReduxSelector
} from 'react-redux';
import rootReducer from './reducers';

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)));

export type RootState = ReturnType<typeof store.getState>;

export type CustomDispatchReturnType = ReturnType<typeof store.dispatch>;

export type AppThunkDispatch = ThunkDispatch<RootState, {}, CustomDispatchReturnType>;

export type CustomAction = ThunkAction<void, RootState, {}, CustomDispatchReturnType>;

export const useSelector:TypedUseSelectorHook<RootState> = useReduxSelector;

export const useDispatch = () => useReduxDispatch<AppThunkDispatch>();

export default store;
