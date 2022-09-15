import { ReloadOutlined, SyncOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import style from '../repo.module.scss';

type Props = {
  loadingHandler: () => void;
  isLoaded: boolean;
};

function ReloadBtn({ loadingHandler, isLoaded }: Props) {
  const onClicK = () => isLoaded && loadingHandler();

  const btn = useMemo(() => (isLoaded
    ? <ReloadOutlined onClick={onClicK} className={style.reloadBtn} />
    : <SyncOutlined className={style.reloadBtn} spin />), [isLoaded]);
  return btn;
}

export default ReloadBtn;
