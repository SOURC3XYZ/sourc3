import { RC, RequestSchema } from '@libs/action-creators';
import { hexParser } from '@libs/utils';
import { ContractResp, ObjectDataResp, RepoCommitResp } from '@types';

export const splitUrl = (branch: string, fullUrl: string) => {
  const [baseUrl, params] = fullUrl.split(branch);
  return {
    baseUrl: `${baseUrl}${branch}`,
    params: params.split('/').filter((el) => el)
  };
};

export const getCommit = async (
  id:number,
  commit_hash: string,
  callContract: <T extends ContractResp>(arg: RequestSchema) => Promise<void | T>,
  callIpfs:(hash: string) => Promise<string | void>
) => {
  try {
    const commitData = await callContract<ObjectDataResp>(RC.getData(id, commit_hash));
    if (!commitData) throw new Error('commit data error');

    const ipfsHash = hexParser(commitData.object_data);
    const ipfsData = await callIpfs(ipfsHash);
    if (!ipfsData) throw new Error('ipfs data error');

    const getCommitFromIpfs = await callContract<RepoCommitResp>(
      RC.getCommitFromData(commit_hash, ipfsData)
    );
    if (!getCommitFromIpfs) throw new Error('error commit parsing');
    return getCommitFromIpfs.commit;
  } catch (error) {
    return null;
  }
};
