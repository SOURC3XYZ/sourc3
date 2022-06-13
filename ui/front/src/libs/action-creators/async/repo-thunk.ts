import { CONFIG } from '@libs/constants';
import { CommitMapParser, TreeBlobParser, TreeListParser } from '@libs/core';
import CommitListParser from '@libs/core/git-parser/commit-data-parser';
import { CustomAction } from '@libs/redux';
import {
  BeamApiContext,
  MetaHash,
  RepoId,
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

export const getRepoThunk = ({ callApi }: NonNullable<BeamApiContext>) => {
  const [,,getOutput] = contractCall(callApi);

  const getRepo = (
    id: RepoId,
    errHandler: (err: Error) => void,
    resolve?: () => void
  ):CustomAction => async (dispatch) => {
    try {
      dispatch(AC.setCommits(null));
      const cache = await caches.open([CONFIG.CID, id].join('-'));
      const { pathname } = window.location;
      const metas = new Map<MetaHash, RepoMeta>();
      const metaArray = await getOutput<RepoMetaResp>(RC.repoGetMeta(id), dispatch);
      if (metaArray) {
        metaArray.objects.forEach((el) => {
          metas.set(el.object_hash, el);
        });
      }
      dispatch(AC.setRepoMeta(metas));
      const branches = await getOutput<RepoRefsResp>(RC.repoGetRefs(id), dispatch);
      if (branches) {
        if (branches?.refs) dispatch(AC.setBranchRefList(branches.refs));
        if (resolve) resolve();

        const commitsArray = await getOutput<RepoMetaResp>(RC.getCommitList(id), dispatch);
        if (commitsArray) {
          const commitMap = await new CommitListParser({
            id, metas, pathname, expect: 'commit', cache, callApi, commits: commitsArray.objects
          }).getCommitMap();

          const commitTree = await new CommitMapParser({
            id,
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
            AC.setRepoId(id),
            AC.setRepoMap(commitTree)
          ]);
        }
      }
    } catch (error) { errHandler(error as Error); }
  };

  const getTree = ({
    id, oid, key, resolve
  }: UpdateProps, errHandler: (err: Error) => void):CustomAction => async (dispatch, getState) => {
    try {
      const cache = await caches.open([CONFIG.CID, id].join('-'));
      const { pathname } = window.location;
      const { repo: { tree, repoMetas: metas } } = getState();
      const parserProps = {
        id, metas, callApi, key, pathname, cache
      };
      const updated = await new TreeListParser(
        { ...parserProps, expect: 'tree' }
      ).getTree(oid, tree);
      dispatch(AC.setTreeData(updated));
      if (resolve) resolve();
    } catch (error) { errHandler(error as Error); }
  };

  const getTextData = (
    repoId: RepoId,
    oid: TreeElementOid,
    errHandler: (err: Error) => void,
    resolve?: () => void
  ):CustomAction => async (dispatch, getState) => {
    try {
      const cache = await caches.open([CONFIG.CID, repoId].join('-'));
      const { pathname } = window.location;
      const { repo: { repoMetas: metas } } = getState();
      const parserProps = {
        id: repoId, metas, callApi, pathname, cache
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
