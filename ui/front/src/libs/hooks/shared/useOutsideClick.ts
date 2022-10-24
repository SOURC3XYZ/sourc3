import { useEffect } from 'react';

export function useOutsideClick<T extends HTMLElement>(
  ref:React.RefObject<T>,
  callback: () => void
) {
  useEffect(() => {
    function handleClickOutside(e:Event) {
      const target = e.target as HTMLElement;
      if (ref.current && !ref.current.contains(target)) {
        callback();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
}
