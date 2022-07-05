import { RC } from '@libs/action-creators';
import { CONFIG } from '@libs/constants';
import { hexParser } from '@libs/utils';
import { ObjectDataResp } from '@types';
import { useCallback, useState } from 'react';
import { useCallApi } from '..';
import { forceDownload } from './util';

type UseDownloadBlob = {
  gitHash: string;
  name: string;
  id: number;
};

export const useDownloadBlob = ({ gitHash, name, id }:UseDownloadBlob) => {
  const [isOnLoad, setIsOnLoad] = useState(false);

  const [callApi] = useCallApi();

  // Current blob size limit is around 500MB for browsers
  const downloadResource = useCallback(async () => {
    if (isOnLoad) return;
    setIsOnLoad(true);

    try {
      const commitData = await callApi<ObjectDataResp>(RC.getData(id, gitHash));
      if (!commitData) throw new Error('commit data error');

      const ipfsHash = hexParser(commitData.object_data);

      const url = [CONFIG.IPFS_HOST, 'ipfs', CONFIG.NETWORK, ipfsHash].join('/');
      let filename = name;
      if (!filename) {
        filename = ipfsHash;
      }
      const res = await fetch(url, {
        headers: new Headers({
          Origin: window.location.origin,
          'Content-Disposition': 'attachment;filename="filename"'
        }),
        mode: 'cors'
      });
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      forceDownload(blobUrl, filename);
    } catch (error) {
      console.error(error);
    } finally {
      setIsOnLoad(false);
    }
  }, [isOnLoad]);

  return [downloadResource, isOnLoad] as const;
};
