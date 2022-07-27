import { useExcludeRoute } from '@libs/hooks/shared';
import { useUserAction } from '@libs/hooks/thunk';
import { useSelector } from '@libs/redux';

const useHeader = () => {
  const { pkey, users } = useSelector(
    (state) => ({ pkey: state.app.pkey, users: state.app.users })
  );

  const isVisible = useExcludeRoute('/download', '/404');

  const { connectExtension: onConnect } = useUserAction();

  return {
    pkey,
    users,
    isVisible,
    onConnect
  };
};

export default useHeader;
