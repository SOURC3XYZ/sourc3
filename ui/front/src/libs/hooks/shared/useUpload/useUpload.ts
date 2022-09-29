import { CONFIG } from '@libs/constants';
import { useCallApi } from '@libs/hooks/shared';
import { useCallback } from 'react';
import { parseToUrl } from './utils';

type IpfsResponse = {
  hash: string,
  pinned: boolean
};

export const useUpload = () => {
  const [, callIpfs] = useCallApi();

  const uploadToIpfs = useCallback(async (blob: Blob) => {
    if (blob.size > CONFIG.MAX_PIC_SIZE) throw new Error('file size > 700kb');
    const formdata = new FormData();
    formdata.append('ipfs', blob);
    const body = formdata;

    const url = [CONFIG.IPFS_HOST, 'upload'].join('/');
    const response = await fetch(url, {
      method: 'POST',
      body
    });
    if (!response.ok) throw new Error(response.statusText);
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
