import { RC } from '@libs/action-creators';
import { CONFIG } from '@libs/constants';
import { hexParser } from '@libs/utils';
import { NotificationPlacement, ObjectDataResp } from '@types';
import { useCallback, useState } from 'react';
import useCallApi from '@libs/hooks/shared/useCallApi';
import { notification } from 'antd';
import { forceDownload } from './util';

type UseDownloadBlob = {
  gitHash: string;
  name: string;
  id: number;
};

export const useDownloadBlob = ({
  gitHash, name, id
}:UseDownloadBlob) => {
  const [isOnDownload, setIsDownload] = useState(false);

  const [callApi] = useCallApi();

  const downloadResource = useCallback(async () => {
    setIsDownload(true);
    try {
      const commitData = await callApi<ObjectDataResp>(RC.getData(id, gitHash));
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
