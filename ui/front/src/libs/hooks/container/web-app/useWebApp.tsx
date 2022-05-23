import { useUserAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useWebApp = () => {
  const isApiConnected = useSelector((state) => state.app.isApiConnected);
  const { connectBeamApi } = useUserAction();

  const { pathname } = useLocation();

  const isOnLending = pathname === '/';

  useLayoutEffect(() => {
    if (isOnLending) {
      document.body.style.backgroundColor = '#000';
      return;
    } document.body.style.backgroundColor = '';
  }, [isOnLending]);

  return {
    isApiConnected, isOnLending, connectBeamApi
  };
};

export default useWebApp;
