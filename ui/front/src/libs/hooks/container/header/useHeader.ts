import { useUserAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';

const useHeader = () => {
  const pkey = useSelector((state) => state.app.pkey);

  const { connectExtension: onConnect } = useUserAction();

  return {
    pkey,
    onConnect
  };
};

export default useHeader;
