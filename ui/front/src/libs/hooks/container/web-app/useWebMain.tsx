import { useBackground } from '@libs/hooks/shared';
import { useUserAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';

const useWebMain = () => {
  const isApiConnected = useSelector((state) => state.app.isApiConnected);
  const { connectBeamApi } = useUserAction();

  const isOnLending = useBackground({ url: '/' });

  const isLoading = window.location.pathname !== '/connect';

  return {
    isApiConnected, isOnLending, isLoading, connectBeamApi
  };
};

export default useWebMain;
