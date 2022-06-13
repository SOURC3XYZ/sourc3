import { RC, RequestSchema } from '@libs/action-creators';
import { useAsyncError, useCallApi } from '@libs/hooks/shared';
import { useSelector } from '@libs/redux';
import { buf2hex, hexParser } from '@libs/utils';
import {
  Branch,
  BranchCommit,
  CallBeamApi, ContractResp, DataNode, ErrorHandler, ObjectDataResp, RepoCommitResp, UpdateProps
} from '@types';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

type LocationState = {
  branchName: string;
  type: 'tree' | 'blob'
};

const getCommit = async (
  id:number,
  commit_hash: string,
  callContract: <T extends ContractResp>(arg: RequestSchema) => Promise<void | T>,
  callApi:CallBeamApi
) => {
  try {
    const commitData = await callContract<ObjectDataResp>(RC.getData(id, commit_hash));
    if (commitData) {
      const ipfsHash = hexParser(commitData.object_data);
      const ipfsData = await callApi(RC.getIpfsData(ipfsHash));
      if (ipfsData) {
        const toParse = buf2hex(ipfsData.result.data as number[]);
        const getCommitFromIpfs = await callContract<RepoCommitResp>(
          RC.getCommitFromData(commit_hash, toParse)
        );
        if (getCommitFromIpfs) {
          return getCommitFromIpfs.commit;
        }
      }
    } throw new Error('error');
  } catch (error) {
    return null;
  }
};

const useRepoContent = (
  id: number,
  branches: Branch[],
  tree: DataNode[] | null,
  goTo: (path: string) => void,
  updateTree: (
    props: Omit<UpdateProps, 'id'>, errorHandler: ErrorHandler) => void,
  killTree: () => void
) => {
  const commitsMap = useSelector((state) => state.repo.commitsMap);
  const setError = useAsyncError();
  const location = useLocation();
  const { pathname } = location;
  const [contractCall, callApi, loading, err] = useCallApi();
  const { branchName, type } = useParams<'branchName' | 'type'>() as LocationState;

  // const regex = new RegExp(`(${branchName})`);
  // const [branch, setBranch] = useState(branches
  //   .find((el) => el.name.match(regex)) || branches[0]);

  const [commit, setCommit] = useState<BranchCommit | null>(null);

  const fetchCommit = async (name: string) => {
    const regex = new RegExp(`(${name})`);
    const findedBranch = branches.find((el) => el.name.match(regex)) || branches[0];
    if (!findedBranch) return setError(new Error('no branch'));
    const lastCommit = await getCommit(id, findedBranch.commit_hash, contractCall, callApi);
    if (lastCommit) {
      setCommit(lastCommit);
      return updateTree({ oid: lastCommit.tree_oid }, setError);
    } return setError(new Error('no commit'));
  };

  const goToBranch = (newBranch: string) => goTo(`branch/${type}/${newBranch}`);

  const goToCommitTree = (branch: string) => goTo(`commits/${branch}`);

  useEffect(() => {
    fetchCommit(branchName);
  }, [branchName]);

  const isLoading = loading || !commit;

  useEffect(() => {
    if (tree) killTree();
    if (commit) updateTree({ oid: commit.tree_oid }, setError);
  }, [pathname]);

  return {
    goToBranch,
    goToCommitTree,
    branchName,
    commit,
    type,
    loading: isLoading,
    err,
    setError,
    pathname,
    commitsMap
  };
};

export default useRepoContent;
