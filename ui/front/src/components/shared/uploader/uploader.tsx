import { useUpload } from '@libs/hooks/shared';
import { Button, message } from 'antd';
import Upload, { RcFile, UploadChangeParam } from 'antd/lib/upload';
import { useState } from 'react';

export function Uploader() {
  const [src, setSrc] = useState<string | null>(null);

  const { uploadToIpfs, getImgUrlFromIpfs } = useUpload();

  const props = {
    withCredentials: false,
    showUploadList: false,
    beforeUpload: async (file:RcFile) => {
      if (file.type !== 'image/png') {
        message.error(`${file.name} is not a png file`);
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    customRequest: () => {},
    onChange: async (info: UploadChangeParam) => {
      if (info.fileList[0].originFileObj) {
        const data = await uploadToIpfs(info.fileList[0].originFileObj);
        const image = await getImgUrlFromIpfs(data.hash);
        if (image) {
          setSrc(image);
        }
        console.log(data);
        info.fileList.splice(0, 1);
      }
    }
  };

  const image = src && <img src={src} alt={src} />;

  return (
    <>
      <Upload {...props}>
        <Button>
          Upload png only
        </Button>
      </Upload>
      {image}
    </>
  );
}
