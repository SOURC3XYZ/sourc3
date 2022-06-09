import { RC, RequestSchema } from '@libs/action-creators';
import { useCallApi } from '@libs/hooks/shared';
import { buf2hex, hexParser } from '@libs/utils';
import {
  Branch,
  BranchCommit,
  CallBeamApi, ContractResp, ObjectDataResp, RepoCommitResp
} from '@types';
import { useEffect, useState } from 'react';

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

const useRepoContent = (id: number, branches: Branch[]) => {
  const [contractCall, callApi, loading, err] = useCallApi();
  const [branch, setBranch] = useState(branches
    .find((el) => el.name.match(/(master|main)/)) || branches[0]);

  const [commit, setCommit] = useState<BranchCommit | null>(null);

  const fetchCommit = async () => {
    const lastCommit = await getCommit(id, branch.commit_hash, contractCall, callApi);
    setCommit(lastCommit);
  };

  useEffect(() => { fetchCommit(); }, [branch]);

  const isLoading = loading || !commit;

  return {
    branch,
    commit,
    loading: isLoading,
    err,
    setBranch
  };
};

export default useRepoContent;
