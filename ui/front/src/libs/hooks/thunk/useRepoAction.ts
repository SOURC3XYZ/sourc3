import { useSourc3Api } from '@components/context';
import { AC, RepoReqType } from '@libs/action-creators';
import { getRepoThunk } from '@libs/action-creators/async';
import { useDispatch } from '@libs/redux';
import {
  ArgumentTypes, ErrorHandler, UpdateOmitProps
} from '@types';
import { batch } from 'react-redux';

const useRepoAction = () => {
  const dispatch = useDispatch();
  const api = useSourc3Api();
  const thunks = getRepoThunk(api);

  const getRepo = (params:RepoReqType, errHandler: ErrorHandler) => (resolve: () => void) => {
    dispatch(thunks.getRepo(params, errHandler, resolve));
  };

  const updateTree = (
    params: RepoReqType,
    errHandler: ErrorHandler
  ) => (props: UpdateOmitProps) => {
    dispatch(thunks.getTree({ ...props, params }, errHandler));
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
