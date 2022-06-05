import { useWalletAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';
import { useEffect } from 'react';

export const useAuth = () => {
  const {
    killWalletApi,
    mountWallet,
    startWalletApi,
    statusFetcher
  } = useWalletAction();
  const isWalletConnected = useSelector((state) => state.wallet.isWalletConnected);
  const isApiConnected = useSelector((state) => state.app.isApiConnected);
  const isConnected = isWalletConnected && !isApiConnected;

  useEffect(() => {
    if (isApiConnected) killWalletApi();
    if (!isWalletConnected) mountWallet();
  }, []);

  return {
    isConnected,
    startWalletApi,
    statusFetcher
  };
};
