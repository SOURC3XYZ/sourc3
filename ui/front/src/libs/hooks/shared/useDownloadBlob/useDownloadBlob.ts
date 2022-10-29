import { RC, RepoObjIdType } from '@libs/action-creators';
import { CONFIG } from '@libs/constants';
import { hexParser } from '@libs/utils';
import { NotificationPlacement, ObjectDataResp } from '@types';
import { useCallback, useState } from 'react';
import useCallApi from '@libs/hooks/shared/useCallApi';
import { notification } from 'antd';
import { forceDownload } from './util';

type UseDownloadBlob = {
  name: string;
  params: RepoObjIdType;
};

export const useDownloadBlob = ({
  name, params
}:UseDownloadBlob) => {
  const [isOnDownload, setIsDownload] = useState(false);

  const [callApi] = useCallApi();

  const downloadResource = useCallback(async () => {
    setIsDownload(true);
    try {
      const commitData = await callApi<ObjectDataResp>(RC.getData(params));
      if (!commitData) throw new Error('commit data error');

      const ipfsHash = hexParser(commitData.object_data);

      const filePath = [
        CONFIG.DOWNLOAD_LINK, `${ipfsHash}?filename=${name}&download=true`
      ].join('/');
      forceDownload(filePath, name);
    } catch (error: any) {
      notification.error({
        message: error.message,
        placement: 'bottomRight' as NotificationPlacement
      });
    } finally {
      setIsDownload(false);
    }
  }, [isOnDownload]);

  const handleDownloadResource = useCallback(() => { downloadResource(); }, [downloadResource]);

  return [isOnDownload, handleDownloadResource] as const;
};
