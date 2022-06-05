import { BeamApiContext } from '@types';
import { createContext, useContext } from 'react';

export const BeamWebApiContext = createContext<BeamApiContext | null>(null);

export const useSourc3Api = () => {
  const api = useContext(BeamWebApiContext);
  if (!api) throw new Error('Api not initialized');
  return api as NonNullable<BeamApiContext>;
};
