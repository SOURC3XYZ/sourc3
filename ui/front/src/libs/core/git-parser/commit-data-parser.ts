import { RC } from '@libs/action-creators';
import { BranchCommit, RepoCommitResp, RepoMeta } from '@types';
import AbstractParser, { ParserProps } from './abstract-parser';

const MAX_CALL = 50;

type CommitList = {
  commits: RepoMeta[];
};

export default class CommitListParser extends AbstractParser {
  private readonly commits: RepoMeta[];

  private readonly commitMap = new Map<string, BranchCommit>();

  private readonly callQueue = [] as (string[])[];

  private stopPending = false;

  constructor(parserProps: ParserProps & CommitList) {
    super(parserProps);
    this.commits = parserProps.commits;
    window.addEventListener('stop-commit-pending', this.handleStopPending, { once: true });
  }

  private readonly handleStopPending = () => {
    console.log('cancel!!');
    this.stopPending = true;
  };

  readonly getCommitMap = async () => {
    const commits = await this.buildQueue();
    window.removeEventListener('stop-commit-pending', this.handleStopPending);
    return commits;
  };

  private readonly buildQueue = async () => {
    this.commits.forEach((el) => this.addToQueue(el.object_hash));
    const commits = await this.startPin();
    return commits as NonNullable<typeof commits>;
  };

  addToQueue = (hash:string) => {
    const { length } = this.callQueue;
    if (!length || this.callQueue[length - 1].length === MAX_CALL) this.callQueue.push([]);
    this.callQueue[this.callQueue.length - 1].push(hash);
  };

  startPin = async ():Promise<Map<string, BranchCommit>> => {
    if (this.stopPending) {
      window.removeEventListener('stop-commit-pending', this.handleStopPending);
      throw new Error('pending stopped');
    }
    const commitPack = this.callQueue.shift();
    if (!commitPack) return this.commitMap;
    const commits = commitPack.map(this.getCommit);
    await Promise.all(commits);
    const next = await this.startPin();
    return next;
  };

  getCommit = async (hash:string):Promise<void> => {
    const key = new Request(`/commit/${hash}`);

    const cachedCommit = await caches.match(key);
    if (cachedCommit) {
      const blob = await cachedCommit.blob();
      const json = await blob.text();
      this.commitMap.set(hash, JSON.parse(json) as BranchCommit);
    } else {
      const res = this.isIpfsHash(hash)
        ? await this.getIpfsData<RepoCommitResp>(hash)
        : await this.call<RepoCommitResp>(RC.repoGetCommit({ ...this.params, obj_id: hash }));
      const commit = new Blob([JSON.stringify(res.commit)], { type: 'application/json' });
      const init = { status: 200, statusText: 'OK!' };
      const response = new Response(commit, init);
      this.cache.put(key, response);
      this.commitMap.set(hash, res.commit);
    }
  };
}
