import { useMemo } from 'react';
import { searchFilter } from './useSearchSelector';

const useSearch = <T>(searchText:string, items:T[], keys:(keyof T)[], ...args:any[]) => {
  const elements = useMemo(
    () => searchFilter(searchText, items, keys),
    [searchText, items, ...args]
  );
  return elements;
};

export default useSearch;
