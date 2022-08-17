import { useCallback, useEffect } from 'react';

export const useCustomEvent = (event:string, eventHandler?: (EventListener)) => {
  useEffect(() => {
    if (eventHandler) {
      document.addEventListener(event, eventHandler);
      return () => document.removeEventListener(event, eventHandler);
    } return undefined;
  }, [event, eventHandler]);

  const dispatchEvent = useCallback((data?: any) => {
    const customEvent = new CustomEvent(event, { detail: data });
    document.dispatchEvent(customEvent);
  }, []);

  return dispatchEvent;
};
