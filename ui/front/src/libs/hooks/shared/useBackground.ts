import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

type UseBackgroundProps = {
  url: string;
  pageColor?:string;
  defaultColor?:string;
};

const useBackground = ({ url, pageColor = '#000', defaultColor = '' }:UseBackgroundProps) => {
  const { pathname } = useLocation();

  const isOnAbovePage = pathname === url;

  useLayoutEffect(() => {
    if (isOnAbovePage) {
      document.body.style.backgroundColor = pageColor;
      return;
    } document.body.style.backgroundColor = defaultColor;
  }, [isOnAbovePage]);

  return isOnAbovePage;
};

export default useBackground;
