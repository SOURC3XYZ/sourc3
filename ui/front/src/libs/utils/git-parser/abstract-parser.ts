import { RC, RequestCreators } from '@libs/action-creators';
import { BeamAPI } from '@libs/beam';
import {
  RepoId, MetaHash, RepoMeta, DataResp, BeamApiResult
} from '@types';
import {
  buf2hex, hexParser, readFile, str2bytes
} from '@libs/utils';

type TypedBeamApi = BeamAPI<RequestCreators['params']>;

type IpfsRequestType = 'commit' | 'tree';

type IpfsRequestCreators = {
  commit: typeof RC['getCommitFromData'],
  tree: typeof RC['getTreeFromData']
};

export type ParserProps = {
  id:RepoId,
  metas: Map<MetaHash, RepoMeta>,
  api: TypedBeamApi,
  expect: IpfsRequestType
};

export default abstract class AbstractParser {
  protected readonly id: RepoId;

  protected readonly metas: Map<MetaHash, RepoMeta>;

  protected readonly api: TypedBeamApi;

  private readonly expect: IpfsRequestType;

  protected readonly ipfsRequest: IpfsRequestCreators = {
    commit: RC.getCommitFromData,
    tree: RC.getTreeFromData
  };

  constructor({
    id, metas, api, expect
  }:ParserProps) {
    this.id = id;
    this.metas = metas;
    this.api = api;
    this.expect = expect;
  }

  protected readonly call = async <T>(req: RequestCreators):Promise<T> => {
    const { result } = await this.api.callApi(req);
    if (result?.output) {
      return JSON.parse(result.output) as T;
    } return result as unknown as T; // TODO Danik: do without unknown
  };

  protected readonly isIpfsHash = (gitHash: MetaHash) => {
    const data = this.metas.get(gitHash);
    if (!data) {
      throw new Error(`meta ${gitHash} not found in current repository`);
    }
    return !!(data.object_type & 0x80);
  };

  protected readonly getIpfsData = async <T>(gitHash: string) => {
    const { object_data } = await this.call<DataResp>(
      RC.getData(this.id, gitHash)
    );
    const ipfsHash = hexParser(object_data);
    return this.getIpfsHash<T>(ipfsHash, gitHash);
  };

  protected readonly getIpfsHash = async <T>(
    ipfsHash: string, gitHash: string
  ) => {
    const { data } = await this.call<BeamApiResult>(RC.getIpfsData(ipfsHash));
    const action = this.ipfsRequest[this.expect];
    const toParse = this.expect === 'commit'
      ? buf2hex(str2bytes(data as string))
      : await readFile(data as string) as string;
    const getCommitFromIpfs = await this.call(action(gitHash, toParse));
    return getCommitFromIpfs as T;
  };
}
