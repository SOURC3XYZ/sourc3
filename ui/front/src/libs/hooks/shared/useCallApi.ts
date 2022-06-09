import { useSourc3Api } from '@components/context';
import { outputParser, RequestSchema } from '@libs/action-creators';
import { ContractResp } from '@types';
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

  return [callApi, api.callApi, isLoading, error] as const;
};

export default useCallApi;
