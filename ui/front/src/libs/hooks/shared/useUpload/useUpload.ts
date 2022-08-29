import { CONFIG } from '@libs/constants';
import { useCallApi } from '@libs/hooks/shared';
import { useCallback } from 'react';
import { parseToUrl, uploadArtwork } from './utils';

type IpfsResponse = {
  hash: string,
  pinned: boolean
};

export const useUpload = () => {
  const [, callIpfs] = useCallApi();

  const uploadToIpfs = useCallback(async (blob: Blob) => {
    const data = await uploadArtwork(blob);
    const body = {
      data,
      pin: true,
      timeout: 5000
    };

    const url = [CONFIG.IPFS_HOST, 'upload'].join('/');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const received = await response.json();
    return received as IpfsResponse;
  }, []);

  const getImgUrlFromIpfs = useCallback(async (hash: string) => {
    const hex = await callIpfs(hash);
    if (hex) return parseToUrl(hex);
    return null;
  }, []);

  return { uploadToIpfs, getImgUrlFromIpfs };
};
