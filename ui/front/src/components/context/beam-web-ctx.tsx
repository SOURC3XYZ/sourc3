import wasm from '@assets/app.wasm';
import {
  AC, apiManagerHelper, contractCall, RC
} from '@libs/action-creators';
import batcher from '@libs/action-creators/batcher';
import { CONFIG, EVENTS } from '@libs/constants';
import { BeamWebAPI } from '@libs/core';
import { useCustomEvent } from '@libs/hooks/shared';
import { AppThunkDispatch } from '@libs/redux';
import {
  IProfile,
  OrganizationsResp, PKeyRes, ProjectsResp, ReposResp, User
} from '@types';
import {
  useCallback, useMemo, useRef
} from 'react';
import { useNavigate } from 'react-router-dom';
import { BeamWebApiContext } from './shared-context';

type BeamWebCtxProps = {
  children: JSX.Element
};

const messageBeam = {
  type: 'create_sourc3_api',
  apiver: 'current',
  apivermin: '',
  appname: 'SOURC3',
  is_reconnect: false
};

export function BeamWebApi({ children }:BeamWebCtxProps) {
  const navigate = useNavigate();

  const messageToRepo = useCustomEvent(EVENTS.SUBUNSUB);

  const { current: api } = useRef(new BeamWebAPI(CONFIG.CID, navigate));

  const inProcess = useRef(false);

  const [query] = contractCall(api.callApi);

  const apiEventManager = useCallback((dispatch: AppThunkDispatch) => {
    if (!inProcess.current) {
      inProcess.current = true;

      return apiManagerHelper(
        async () => {
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
          const [{ orgs }, { projects }, { repos }, { profile }] = await Promise
            .all([getOrgs, getProject, getRepos, getViewUser]);

          inProcess.current = false;
          batcher(dispatch, [
            AC.setOrganizationsList(orgs),
            AC.setProjectsList(projects),
            AC.setRepos(repos),
            AC.setViewUser(profile)
          ]);
        }
      );
    } return null;
  }, [api]);

  const setPidEventManager = useCallback((dispatch: AppThunkDispatch) => (users: User[]) => {
    if (!api.isHeadless()) {
      const foundActive = users.find((el) => el.active);
      if (foundActive) {
        dispatch(AC.setUsers(users));
        query<PKeyRes>(
          dispatch,
          RC.getPublicKey(foundActive.id),
          (output) => ([AC.setPublicKey(output.key)])
        );
      }
    }
  }, [api]);

  const isWebHeadless = () => api.isDapps() || api.isElectron();

  const setIsConnected = async (dispatch: AppThunkDispatch) => {
    await api.loadAPI();
    await api.initContract(wasm);
    api.loadSetPidEventManager(setPidEventManager(dispatch));
    api.loadApiEventManager(apiEventManager(dispatch));
  };

  const connectExtension = async (dispatch: AppThunkDispatch) => {
    const activeUser = await api.extensionConnect(messageBeam);
    await api.initContract(wasm);
    api.loadApiEventManager(apiEventManager(dispatch));
    return activeUser;
  };

  const contextObj = useMemo(() => ({
    setIsConnected,
    callApi: api.callApi,
    isWebHeadless,
    connectExtension
  }
  ), [api]);

  return (
    <BeamWebApiContext.Provider value={contextObj}>
      {children}
    </BeamWebApiContext.Provider>
  );
}
