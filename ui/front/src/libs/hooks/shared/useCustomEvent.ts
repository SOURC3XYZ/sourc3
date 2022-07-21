import { useCallback, useEffect } from 'react';

export const useCustomEvent = (event:string, eventHandler?: EventListener) => {
  useEffect(() => {
    if (eventHandler) {
      document.addEventListener(event, eventHandler);
      return () => document.removeEventListener(event, eventHandler);
    } return undefined;
  }, []);

  const dispatchEvent = useCallback(() => {
    const customEvent = new Event(event);
    document.dispatchEvent(customEvent);
  }, []);

  return dispatchEvent;
};
