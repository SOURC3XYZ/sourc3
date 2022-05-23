import { useUserAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';

const useHeader = () => {
  const pkey = useSelector((state) => state.app.pkey);

  const { connectExtension: onConnect } = useUserAction();

  const isPkey = Boolean(pkey);

  return {
    isPkey,
    onConnect
  };
};

export default useHeader;
