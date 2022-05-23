import { useSourc3Web } from '@components/context';
import { AC } from '@libs/action-creators';
import { getRepoThunk } from '@libs/action-creators/async';
import { useDispatch } from '@libs/redux';
import {
  ArgumentTypes, ErrorHandler, RepoId, UpdateProps
} from '@types';
import { batch } from 'react-redux';

const useRepoAction = () => {
  const dispatch = useDispatch();
  const api = useSourc3Web();
  const thunks = getRepoThunk(api);

  const getRepo = (id:RepoId, errHandler: ErrorHandler) => (resolve: () => void) => {
    dispatch(thunks.getRepo(id, errHandler, resolve));
  };

  const updateTree = (id: RepoId, errHandler: ErrorHandler) => (props: Omit<UpdateProps, 'id'>) => {
    dispatch(thunks.getTree({ ...props, id }, errHandler));
  };

  const getFileData = (
    ...args: ArgumentTypes<typeof thunks.getTextData>
  ) => dispatch(thunks.getTextData(...args));

  const killTree = () => {
    batch(() => {
      dispatch(AC.setFileText(null));
      dispatch(AC.setTreeData(null));
    });
  };

  return {
    killTree,
    getRepo,
    updateTree,
    getFileData
  };
};
export default useRepoAction;
