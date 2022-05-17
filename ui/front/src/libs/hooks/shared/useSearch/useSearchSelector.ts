import { equalKeyIndex } from '@libs/utils';

export function searchFilter<T>(
  searchInputTxt: string,
  elements: T[],
  keysToEqual: (keyof T)[]
) {
  if (searchInputTxt) {
    return elements.filter((el) => {
      const entries = Object.entries(el) as [keyof T, T[keyof T]][];
      const filtered = entries
        .filter((field) => keysToEqual.find((key) => key === field[0]))
        .find((field) => (
          typeof field[1] === 'string' || typeof field[1] === 'number')
              && ~(equalKeyIndex(String(field[1]), searchInputTxt)));
      if (filtered) return el;
      return null;
    });
  }
  return elements;
}
