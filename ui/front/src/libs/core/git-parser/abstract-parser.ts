import { RC, RequestSchema } from '@libs/action-creators';
import {
  RepoId, MetaHash, RepoMeta, DataResp, IpfsResult, CallBeamApi
} from '@types';
import { arrayBufferToString, buf2hex, hexParser } from '@libs/utils';

type IpfsRequestType = 'commit' | 'tree' | 'blob';

type IpfsRequestCreators = {
  commit: typeof RC['getCommitFromData'],
  tree: typeof RC['getTreeFromData'],
  blob: typeof RC['getData']
};

export type ParserProps = {
  id:RepoId,
  metas: Map<MetaHash, RepoMeta>,
  callApi: CallBeamApi,
  expect: IpfsRequestType,
  pathname: string;
};

export default abstract class AbstractParser {
  protected readonly id: RepoId;

  protected readonly metas: Map<MetaHash, RepoMeta>;

  protected readonly callApi: CallBeamApi;

  private readonly expect: IpfsRequestType;

  private readonly pathname: string;

  protected readonly ipfsRequest: IpfsRequestCreators = {
    commit: RC.getCommitFromData,
    tree: RC.getTreeFromData,
    blob: RC.getData
  };

  constructor({
    id, metas, callApi, expect, pathname
  }:ParserProps) {
    this.id = id;
    this.metas = metas;
    this.callApi = callApi;
    this.expect = expect;
    this.pathname = pathname;
  }

  protected readonly call = async <T>(req: RequestSchema):Promise<T> => {
    if (
      this.pathname !== window.location.pathname
    ) throw new Error('url has changed');
    const { result, error } = await this.callApi(req);
    if (error) throw new Error(error.message);
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
    const { data } = await this.call<IpfsResult>(RC.getIpfsData(ipfsHash));
    if (this.expect === 'blob') {
      return arrayBufferToString(data as number[]) as unknown as T;
    }
    const action = this.ipfsRequest[this.expect];
    const toParse = buf2hex(data as number[]);
    const getCommitFromIpfs = await this.call(action(gitHash, toParse));
    return getCommitFromIpfs as T;
  };
}
