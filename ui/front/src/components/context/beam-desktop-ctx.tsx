import {
  AC, apiManagerHelper, contractCall, RC
} from '@libs/action-creators';
import { CONFIG, EVENTS } from '@libs/constants';
import { BeamApiDesktop } from '@libs/core';
import { AppThunkDispatch } from '@libs/redux';
import wasm from '@assets/app.wasm';
import {
  ContractsResp, IProfile, OrganizationsResp, PKeyRes, ProjectsResp, ReposResp
} from '@types';
import { useCallback, useMemo, useRef } from 'react';
import { useCustomEvent } from '@libs/hooks/shared';
import batcher from '@libs/action-creators/batcher';
import { parseToBeam } from '@libs/utils';
import { BeamWebApiContext } from './shared-context';

type BeamWebCtxProps = {
  children: JSX.Element
};
export function BeamDesktopApi({ children } : BeamWebCtxProps) {
  const { current: api } = useRef(new BeamApiDesktop(CONFIG.CID));

  const messageToRepo = useCustomEvent(EVENTS.SUBUNSUB);

  const inProcess = useRef(false);

  const [query] = contractCall(api.callApi);

  const apiEventManager = useCallback((dispatch: AppThunkDispatch) => apiManagerHelper(
    async () => {
      if (!inProcess.current) {
        inProcess.current = true;
        const getOrgs = query(
          dispatch,
          RC.getOrganizations(),
          (output:OrganizationsResp) => ({ orgs: output.organizations })
        );

        const getProject = query(
          dispatch,
          RC.getProjects(),
          (output:ProjectsResp) => ({ projects: output.projects })
        );

        const getRepos = query(
          dispatch,
          RC.getAllRepos('all'),
          (output:ReposResp) => ({ repos: output.repos })
        );

        const getWalletStatus = (async () => {
          const res = await api.callApi(RC.getWalletStatus());
          if (res && !res.error) {
            return { beams: parseToBeam(res.result.available) };
          } throw new Error('unable to get wallet status');
        })();

        const getViewUser = query<PKeyRes>(
          dispatch,
          RC.getPublicKey(),
          (output) => query<IProfile>(
            dispatch,
            RC.getUser(output.key),
            (profile) => ({ profile })
          )
        );
        messageToRepo();
        const [{ orgs }, { projects }, { repos }, { profile }, { beams }] = await Promise
          .all([getOrgs, getProject, getRepos, getViewUser, getWalletStatus]);

        inProcess.current = false;
        batcher(dispatch, [
          AC.setOrganizationsList(orgs),
          AC.setProjectsList(projects),
          AC.setRepos(repos),
          AC.setViewUser(profile),
          AC.setWalletStatus(beams)
        ]);
      }
    }
  ), [api]);

  const setIsConnected = async (dispatch: AppThunkDispatch) => {
    await api.loadAPI();
    await api.initContract(wasm);
    api.loadApiEventManager(apiEventManager(dispatch));
    await query<ContractsResp>(dispatch, RC.viewContracts(), (output) => {
      const found = output.contracts.find((el) => el.cid === api.cid) || 1;
      if (!found) throw new Error(`no specified cid (${api.cid})`);
      query<PKeyRes>(
        dispatch,
        // RC.getPublicKey(),
        // (pKeyOutput) => [AC.setPublicKey(pKeyOutput.key), AC.setIsConnected(!!found)]
        RC.getPublicKey(),
        (pKeyOutput) => {
          query<IProfile>(
            dispatch,
            RC.getUser(pKeyOutput.key),
            (profile) => [
              AC.setPublicKey(pKeyOutput.key),
              AC.setViewUser(profile),
              AC.setIsConnected(!!found)]
          );
        }
      );
    }, true);
  };

  const contextObj = useMemo(() => ({
    setIsConnected,
    callApi: api.callApi,
    callIPC: api.callIPC
  }
  ), [api]);

  return (
    <BeamWebApiContext.Provider value={contextObj}>
      {children}
    </BeamWebApiContext.Provider>
  );
}
