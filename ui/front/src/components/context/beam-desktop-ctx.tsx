import {
  AC, apiManagerHelper, contractCall, RC
} from '@libs/action-creators';
import { entitiesThunk } from '@libs/action-creators/async';
import { CONFIG } from '@libs/constants';
import { BeamApiDesktop } from '@libs/core';
import { AppThunkDispatch } from '@libs/redux';
import wasm from '@assets/app.wasm';
import {
  BeamApiContext, ContractsResp
} from '@types';
import {
  createContext, useCallback, useMemo, useRef
} from 'react';

const BeamWebApiContext = createContext<BeamApiContext>(null);

type BeamWebCtxProps = {
  children: JSX.Element
};

export function BeamDesktopApi({ children } : BeamWebCtxProps) {
  const { current: api } = useRef(new BeamApiDesktop(CONFIG.CID));

  const [query] = contractCall(api.callApi);

  const apiEventManager = useCallback((dispatch: AppThunkDispatch) => {
    const [{ getOrganizations, getProjects, getRepos }] = entitiesThunk(api.callApi);

    return apiManagerHelper(() => {
      dispatch(getRepos('all'));
      dispatch(getOrganizations());
      dispatch(getProjects());
    });
    // dispatch(thunks.getWalletStatus());
    // dispatch(thunks.getTxList());
  }, [api]);

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

  const contextObj = useMemo(() => (
    {
      setIsConnected,
      callApi: api.callApi
      callIPC: api.callIPC
    }
  ), [api.BEAM]);

  return (
    <BeamWebApiContext.Provider value={contextObj}>
      {children}
    </BeamWebApiContext.Provider>
  );
}
