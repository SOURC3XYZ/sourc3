import wasm from '@assets/app.wasm';
import {
  AC, apiManagerHelper, contractCall, RC
} from '@libs/action-creators';
import { entitiesThunk } from '@libs/action-creators/async';
import { CONFIG, EVENTS } from '@libs/constants';
import { BeamWebAPI } from '@libs/core';
import { useCustomEvent } from '@libs/hooks/shared';
import { AppThunkDispatch } from '@libs/redux';
import { ContractsResp, PKeyRes, User } from '@types';
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

  const [query] = contractCall(api.callApi);

  const apiEventManager = useCallback((dispatch: AppThunkDispatch) => {
    const [{ getOrganizations, getProjects, getRepos }] = entitiesThunk(api.callApi);
    return apiManagerHelper(
      () => {
        dispatch(getRepos('all'));
        dispatch(getOrganizations());
        dispatch(getProjects());
        messageToRepo();
      }
    );
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
    api.loadApiEventManager(apiEventManager(dispatch));
    api.loadSetPidEventManager(setPidEventManager(dispatch));
    await query<ContractsResp>(dispatch, RC.viewContracts(), (output) => {
      const finded = output.contracts.find((el) => el.cid === api.cid) || 1;
      if (!finded) throw new Error(`no specified cid (${api.cid})`);
      return [AC.setIsConnected(!!finded)];
    }, true);
  };

  const connectExtension = async (dispatch: AppThunkDispatch) => {
    const activeUser = await api.extensionConnect(messageBeam);
    dispatch(AC.setUsers(activeUser));
    if (!api.isHeadless()) {
      await api.initContract(wasm);
      await query<ContractsResp>(
        dispatch,
        RC.viewContracts(),
        (output) => {
          const finded = output.contracts.find((el) => el.cid === api.cid) || 1;
          if (!finded) throw new Error(`no specified cid (${api.cid})`);
          return [AC.setIsConnected(!!finded)];
        },
        true
      );
      api.loadApiEventManager(apiEventManager(dispatch));
    }
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
