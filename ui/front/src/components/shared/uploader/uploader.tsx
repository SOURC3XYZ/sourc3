import { CONFIG } from '@libs/constants';
import { parseToUrl } from '@libs/hooks/shared/useUpload/utils';
import { buf2hex } from '@libs/utils';
import { notification } from 'antd';
import Upload, { RcFile, UploadChangeParam } from 'antd/lib/upload';
import { NavButton } from '../nav-button';

type UploaderProps = {
  returnImg: (link: string, blob: Blob) => void
};

export function Uploader({ returnImg }: UploaderProps) {
  const props = {
    withCredentials: false,
    showUploadList: false,
    beforeUpload: async (file:RcFile) => {
      if (file.type !== 'image/png') {
        notification.error({ message: `${file.name} is not a png file`, placement: 'bottomRight' });
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    customRequest: () => {},
    onChange: async (info: UploadChangeParam) => {
      const blob = info.fileList[0].originFileObj;
      if (blob) {
        try {
          if (blob.size > CONFIG.MAX_PIC_SIZE) throw new Error('file size > 700kb');
          const bytes = await blob.arrayBuffer();
          const hex = buf2hex(bytes);
          if (hex) returnImg(parseToUrl(hex), blob);
        } catch (err) {
          notification.error({ message: 'file size > 700kb', placement: 'bottomRight' });
        } finally {
          info.fileList.splice(0, 1);
        }
      }
    }
  };

  return (
    <Upload {...props}>
      <NavButton name="Upload logo" />
    </Upload>
  );
}
