import { CONFIG } from '@libs/constants';
import { BeamAPI } from '@libs/core';
import { ContractsResp } from '@types';
import wasm from '@assets/app.wasm';
import {
  useCallback, useMemo, useRef
} from 'react';
import { AppThunkDispatch } from '@libs/redux';
import {
  AC, apiManagerHelper, contractCall, RC
} from '@libs/action-creators';
import { entitiesThunk } from '@libs/action-creators/async';
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
  const { current: api } = useRef(new BeamAPI(CONFIG.CID));

  const [query] = contractCall(api.callApi);

  const apiEventManager = useCallback((dispatch: AppThunkDispatch) => {
    const [{ getOrganizations, getProjects, getRepos }] = entitiesThunk(api.callApi);
    return apiManagerHelper(
      () => {
        dispatch(getRepos('all'));
        dispatch(getOrganizations());
        dispatch(getProjects());
      }
    );
  }, [api]);

  const isWebHeadless = () => api.isDapps() || api.isElectron();

  const setIsConnected = async (dispatch: AppThunkDispatch) => {
    await api.loadAPI();
    await api.initContract(wasm);
    api.loadApiEventManager(apiEventManager(dispatch));
    await query<ContractsResp>(dispatch, RC.viewContracts(), (output) => {
      const finded = output.contracts.find((el) => el.cid === api.cid) || 1;
      if (!finded) throw new Error(`no specified cid (${api.cid})`);
      return dispatch(AC.setIsConnected(!!finded));
    });
  };

  const connectExtension = async (dispatch: AppThunkDispatch) => {
    await api.extensionConnect(messageBeam);
    if (!api.isHeadless()) {
      await api.initContract(wasm);
      await query<ContractsResp>(
        dispatch,
        RC.viewContracts(),
        (output) => {
          const finded = output.contracts.find((el) => el.cid === api.cid) || 1;
          if (!finded) throw new Error(`no specified cid (${api.cid})`);
          return dispatch(AC.setIsConnected(!!finded));
        }
      );
      api.loadApiEventManager(apiEventManager(dispatch));
    }
  };

  const contextObj = useMemo(() => (
    {
      setIsConnected,
      callApi: api.callApi,
      isWebHeadless,
      connectExtension
    }
  ), [api.BEAM]);

  return (
    <BeamWebApiContext.Provider value={contextObj}>
      {children}
    </BeamWebApiContext.Provider>
  );
}
