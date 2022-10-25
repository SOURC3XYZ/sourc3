import { useEffect, useState } from 'react';
import {
  matchPath,
  useLocation
} from 'react-router-dom';

export function usePathPattern(routes: string[]) {
  const [path, setPath] = useState<typeof routes[number] | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const currentPath = routes.find((el) => matchPath({ path: el }, pathname));
    if (currentPath) setPath(currentPath);
  }, [pathname]);

  return path;
}
