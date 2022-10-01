import { useCallback, useEffect, useState } from 'react';
import { useUpload } from './useUpload';

export const useGetIpfsImage = (ipfsHash?: string) => {
  const [src, setSrc] = useState<string | null>(null);

  const { getImgUrlFromIpfs } = useUpload();

  const handleLoadPic = useCallback(async () => {
    if (ipfsHash) {
      const link = await getImgUrlFromIpfs(ipfsHash);
      if (link) setSrc(link);
    }
  }, [ipfsHash]);

  useEffect(() => {
    handleLoadPic();
  }, [ipfsHash]);

  return src;
};
