import { RC } from '@libs/action-creators';
import { useCallApi, useObjectState } from '@libs/hooks/shared';
import { useSelector } from '@libs/redux';
import { hexParser } from '@libs/utils';
import {
  Branch,
  BranchCommit,
  ObjectDataResp, RepoCommitResp, RepoRefsResp, RepoType
} from '@types';
import {
  useCallback, useEffect, useMemo
} from 'react';

type Meta = {
  commit: BranchCommit | null,
  masterBranch: Branch | null,
  loading: boolean
};

const initial = {
  commit: null,
  masterBranch: null,
  loading: false
};

export const useRepoItem = (item: RepoType) => {
  const [callApi, callIpfs] = useCallApi();

  const pkey = useSelector((state) => state.app.pkey);

  const [meta, setMeta] = useObjectState<Meta>(initial);

  const { repo_name, repo_id, repo_owner } = item;

  const repoLink = useMemo(() => `sourc3://${repo_owner}/${repo_name}`, []);

  const getLastMasterCommit = useCallback(async () => {
    if (initial.loading) return undefined;
    const refsResp = await callApi<RepoRefsResp>(RC.repoGetRefs(repo_id));
    try {
      if (refsResp) {
        const { refs } = refsResp;
        if (!refs.length) throw new Error(`No branches in repo №${repo_id}`);
        let master = refs.find((ref) => ref.name.match(/(master|main)/));

        if (!master) {
          const [first] = refs;
          master = first;
        }
        const commitData = await callApi<ObjectDataResp>(
          RC.getData(item.repo_id, master.commit_hash)
        );
        if (commitData) {
          const ipfsHash = hexParser(commitData.object_data);
          const ipfsData = await callIpfs(ipfsHash);
          if (ipfsData) {
            const getCommitFromIpfs = await callApi<RepoCommitResp>(
              RC.getCommitFromData(master.commit_hash, ipfsData)
            );
            if (getCommitFromIpfs) {
              return setMeta({
                commit: getCommitFromIpfs.commit,
                masterBranch: master,
                loading: false
              });
            }
          }
        }
      } throw new Error();
    } catch (error) {
      console.error((error as Error).message);
      return setMeta(initial);
    }
  }, [item.repo_id, initial.loading]);

  useEffect(() => {
    setMeta({ ...initial, loading: true });
    getLastMasterCommit();
  }, [item.repo_id]);

  return {
    pkey,
    meta,
    repoLink,
    getLastMasterCommit
  };
};
