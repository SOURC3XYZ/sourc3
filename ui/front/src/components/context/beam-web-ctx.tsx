import { CONFIG } from '@libs/constants';
import { BeamAPI } from '@libs/core';
import {
  BeamApiContext, BeamApiRes, ContractsResp, EventResult
} from '@types';
import wasm from '@assets/app.wasm';
import {
  createContext, useCallback, useContext, useMemo, useRef
} from 'react';
import { AppThunkDispatch } from '@libs/redux';
import { AC, contractCall, RC } from '@libs/action-creators';
import { entitiesThunk } from '@libs/action-creators/async';

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

const BeamWebApiContext = createContext<BeamApiContext>(null);

export function BeamWebApi({ children }:BeamWebCtxProps) {
  const { current: api } = useRef(new BeamAPI(CONFIG.CID));

  const [query] = contractCall(api.callApi);

  const apiEventManager = useCallback((dispatch: AppThunkDispatch) => {
    const [{ getOrganizations, getProjects, getRepos }] = entitiesThunk(api.callApi);
    return function ({ result }:BeamApiRes<EventResult>) {
      const isInSync = !result.is_in_sync
      || result.tip_height !== result.current_height;
      if (isInSync) return;
      // we're not in sync, wait

      dispatch(getRepos('all'));
      dispatch(getOrganizations());
      dispatch(getProjects());
      // dispatch(thunks.getWalletStatus());
      // dispatch(thunks.getTxList());
    };
  }, [api]);

  const isWebHeadless = () => api.isDapps() || api.isElectron();

  const setIsConnected = async (dispatch: AppThunkDispatch) => {
    await api.loadAPI();
    await api.initContract(wasm);
    // api.loadApiEventManager(apiEventManager(dispatch));
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
  ), [api]);

  return (
    <BeamWebApiContext.Provider value={contextObj}>
      {children}
    </BeamWebApiContext.Provider>
  );
}

export const useSourc3Web = () => {
  const api = useContext(BeamWebApiContext);
  if (!api) throw new Error('Api not initialized');
  return api as NonNullable<BeamApiContext>;
};
