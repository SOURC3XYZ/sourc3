import {
  AC, apiManagerHelper, contractCall, RC
} from '@libs/action-creators';
import { entitiesThunk, userThunk } from '@libs/action-creators/async';
import { CONFIG } from '@libs/constants';
import { BeamApiDesktop } from '@libs/core';
import { AppThunkDispatch } from '@libs/redux';
import wasm from '@assets/app.wasm';
import { ContractsResp } from '@types';
import { useCallback, useMemo, useRef } from 'react';
import { BeamWebApiContext } from './shared-context';

type BeamWebCtxProps = {
  children: JSX.Element
};

export function BeamDesktopApi({ children } : BeamWebCtxProps) {
  const { current: api } = useRef(new BeamApiDesktop(CONFIG.CID));

  const [query] = contractCall(api.callApi);

  const apiEventManager = useCallback((dispatch: AppThunkDispatch) => {
    const [{ getOrganizations, getProjects, getRepos }] = entitiesThunk(api.callApi);
    const { getWalletStatus } = userThunk(api);

    return apiManagerHelper(() => {
      dispatch(getRepos('all'));
      dispatch(getOrganizations());
      dispatch(getProjects());
      dispatch(getWalletStatus());
      // dispatch(thunks.getTxList());
    });
  }, [api]);

  const setIsConnected = async (dispatch: AppThunkDispatch) => {
    await api.loadAPI();
    await api.initContract(wasm);
    api.loadApiEventManager(apiEventManager(dispatch));
    await query<ContractsResp>(dispatch, RC.viewContracts(), (output) => {
      const finded = output.contracts.find((el) => el.cid === api.cid) || 1;
      if (!finded) throw new Error(`no specified cid (${api.cid})`);
      return dispatch(AC.setIsConnected(!!finded));
    }, true);
  };

  const contextObj = useMemo(() => (
    {
      setIsConnected,
      callApi: api.callApi,
      callIPC: api.callIPC
    }
  ), [api.BEAM]);

  return (
    <BeamWebApiContext.Provider value={contextObj}>
      {children}
    </BeamWebApiContext.Provider>
  );
}
