import { useSourc3Api } from '@components/context';
import { outputParser, RC, RequestSchema } from '@libs/action-creators';
import { buf2hex } from '@libs/utils';
import { BeamApiRes, ContractResp, IpfsResult } from '@types';
import { useCallback, useState } from 'react';

const useCallApi = () => {
  const api = useSourc3Api();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  const callApi = useCallback(async <T extends ContractResp>(arg: RequestSchema) => {
    try {
      setLoading(true);
      const data = await api.callApi(arg);
      setLoading(false);
      return outputParser<T>(data);
    } catch (err) {
      return setError((err as Error).message);
    }
  }, [api.callApi]);

  const callIpfs = useCallback(async (hash:string) => {
    try {
      setLoading(true);
      const ipfsData = await api.callApi(RC.getIpfsData(hash)) as BeamApiRes<IpfsResult>;
      setLoading(false);
      return buf2hex(ipfsData.result.data as number[]);
    } catch (err) {
      return setError((err as Error).message);
    }
  }, [api.callApi]);

  return [callApi, callIpfs, isLoading, error] as const;
};

export default useCallApi;
