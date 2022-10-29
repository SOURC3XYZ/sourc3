import { CONFIG } from '@libs/constants';
import { CommitMapParser, TreeBlobParser, TreeListParser } from '@libs/core';
import CommitListParser from '@libs/core/git-parser/commit-data-parser';
import { CustomAction } from '@libs/redux';
import {
  BeamApiContext,
  MetaHash,
  RepoMeta,
  RepoMetaResp,
  RepoRefsResp,
  TreeElementOid,
  UpdateProps
} from '@types';
import { AC } from '../action-creators';
import batcher from '../batcher';
import { contractCall } from '../helpers';
import { RC } from '../request-schemas';
import { RepoReqType } from '../request-schemas-types';

const CASH_PREFIX = [CONFIG.NETWORK, CONFIG.CID].join('-');

export const getRepoThunk = ({ callApi }: NonNullable<BeamApiContext>) => {
  const [,,getOutput] = contractCall(callApi);

  const getRepo = (
    params: RepoReqType,
    errHandler: (err: Error) => void,
    resolve?: () => void
  ):CustomAction => async (dispatch) => {
    try {
      let stopPending = false;
      const stopPendingHandler = () => { stopPending = true; };
      window.addEventListener('stop-commit-pending', stopPendingHandler, { once: true });
      batcher(dispatch, [
        AC.setCommits(null),
        AC.setTreeData(null)
      ]);
      const cache = await caches.open([CASH_PREFIX, ...Object.values(params)].join('-'));
      const { pathname } = window.location;
      const metas = new Map<MetaHash, RepoMeta>();
      const metaArray = await getOutput<RepoMetaResp>(RC.repoGetMeta(params), dispatch);
      if (metaArray) metaArray.objects.forEach((el) => metas.set(el.object_hash, el));

      dispatch(AC.setRepoMeta(metas));
      const branches = await getOutput<RepoRefsResp>(RC.repoGetRefs(params), dispatch);
      if (branches && !stopPending) {
        if (branches?.refs) dispatch(AC.setBranchRefList(branches.refs));
        if (resolve) resolve();

        const commitsArray = await getOutput<RepoMetaResp>(RC.getCommitList(params), dispatch);
        if (commitsArray) {
          const commitMap = await new CommitListParser({
            params, metas, pathname, expect: 'commit', cache, callApi, commits: commitsArray.objects
          }).getCommitMap();

          const commitTree = await new CommitMapParser({
            params,
            metas,
            pathname,
            expect: 'commit',
            cache,
            callApi,
            commitMap,
            branches: branches.refs
          }).buildCommitTree();

          batcher(dispatch, [
            AC.setCommits(commitMap),
            AC.setRepoMeta(metas),
            AC.setRepoId(params),
            AC.setRepoMap(commitTree)
          ]);
        }
      }
      if (stopPending) throw new Error('commit pending stopped');
      window.removeEventListener('stop-commit-pending', stopPendingHandler);
    } catch (error) {
      console.error(error);
      errHandler(error as Error);
    }
  };

  const getTree = ({
    params, oid, key, resolve
  }: UpdateProps, errHandler: (err: Error) => void):CustomAction => async (dispatch, getState) => {
    try {
      const cache = await caches.open([CASH_PREFIX, ...Object.values(params)].join('-'));
      const { pathname } = window.location;
      const { repo: { tree, repoMetas: metas } } = getState();
      const parserProps = {
        params, metas, callApi, key, pathname, cache
      };
      const updated = await new TreeListParser(
        { ...parserProps, expect: 'tree' }
      ).getTree(oid, tree);
      dispatch(AC.setTreeData(updated));
      if (resolve) resolve();
    } catch (error) { errHandler(error as Error); }
  };

  const getTextData = (
    params: RepoReqType,
    oid: TreeElementOid,
    errHandler: (err: Error) => void,
    resolve?: () => void
  ):CustomAction => async (dispatch, getState) => {
    try {
      const cache = await caches.open([CASH_PREFIX, ...Object.values(params)].join('-'));
      const { pathname } = window.location;
      const { repo: { repoMetas: metas } } = getState();
      const parserProps = {
        params, metas, callApi, pathname, cache
      };
      const output = await new TreeBlobParser(
        { ...parserProps, expect: 'blob' }
      ).parseBlob(oid);
      if (output) dispatch(AC.addFileToMap([oid, output]));
      if (resolve) resolve();
    } catch (error) { errHandler(error as Error); }
  };

  return {
    getRepo,
    getTree,
    getTextData
  };
};
