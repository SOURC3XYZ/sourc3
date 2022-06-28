import { useUserAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';

const useHeader = () => {
  const { pkey, users } = useSelector(
    (state) => ({ pkey: state.app.pkey, users: state.app.users })
  );

  const { connectExtension: onConnect } = useUserAction();

  return {
    pkey,
    users,
    onConnect
  };
};

export default useHeader;
