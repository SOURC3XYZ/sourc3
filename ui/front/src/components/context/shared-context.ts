import { BeamApiContext } from '@types';
import { Context, createContext, useContext } from 'react';

const generalCtxHook = <T>(
  context: Context<T>,
  errMessage = 'Api not initialized') => () => {
  const api = useContext<T>(context);
  if (!api) throw new Error(errMessage);
  return api as NonNullable<T>;
};

export const BeamWebApiContext = createContext<BeamApiContext | null>(null);
export const ErrorBoundaryContext = createContext<((e: Error) => void) | null>(null);

export const useSourc3Api = generalCtxHook(BeamWebApiContext);

export const useErrorBoundary = generalCtxHook(ErrorBoundaryContext);
