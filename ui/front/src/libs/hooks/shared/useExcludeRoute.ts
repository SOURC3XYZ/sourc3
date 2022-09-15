import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export const useExcludeRoute = (...args: string[]) => {
  const { pathname } = useLocation();

  const isVisible = useMemo(() => !args.some((el) => el === pathname), [pathname]);

  return isVisible;
};
