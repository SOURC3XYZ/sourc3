import { AC } from '@libs/action-creators';
import { useDispatch } from '@libs/redux';

const useGitProfile = () => {
  const dispatch = useDispatch();

  const setGitUserLogout = () => {
    dispatch(AC.gitUserLogout());
  };

  return {
    setGitUserLogout
  };
};

export default useGitProfile;
