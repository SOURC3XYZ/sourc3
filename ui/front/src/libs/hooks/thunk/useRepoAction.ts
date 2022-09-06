import { useSourc3Api } from '@components/context';
import { AC } from '@libs/action-creators';
import { getRepoThunk } from '@libs/action-creators/async';
import { useDispatch } from '@libs/redux';
import {
  ArgumentTypes, ErrorHandler, RepoId, UpdateProps
} from '@types';
import { batch } from 'react-redux';

const useRepoAction = () => {
  const dispatch = useDispatch();
  const api = useSourc3Api();
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

  const clearRepo = () => {
    batch(() => {
      dispatch(AC.setFileText(null));
      dispatch(AC.setTreeData(null));
      dispatch(AC.setCommits(null));
      dispatch(AC.setCommitList([]));
      dispatch(AC.setRepoMap(null));
      dispatch(AC.setRepoId(null));
      // dispatch(AC.setPreviousReposPage(null));
    });
  };

  return {
    killTree,
    getRepo,
    updateTree,
    getFileData,
    clearRepo
  };
};
export default useRepoAction;
