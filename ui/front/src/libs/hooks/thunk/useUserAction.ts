import { useSourc3Web } from '@components/context';
import { userThunk } from '@libs/action-creators/async';
import { useDispatch } from '@libs/redux';

const useUserAsync = () => {
  const dispatch = useDispatch();
  const api = useSourc3Web();
  const thunks = userThunk(api);

  const connectBeamApi = () => dispatch(thunks.connectBeamApi());

  const connectExtension = () => dispatch(thunks.connectExtension());

  return {
    connectBeamApi,
    connectExtension
  };
};
export default useUserAsync;
