import { BeamButton } from '@components/shared';
import { ToastMessages } from '@libs/constants';
import { textEllipsis } from '@libs/utils';
import { NotificationPlacement } from '@types';
import { notification } from 'antd';
import { useEffect, useMemo } from 'react';
import styles from './connect-btn.module.scss';

type ConnectBtnProps = {
  pkey: string;
  onConnect: () => void;
};

function ConnectBtn({ pkey, onConnect }:ConnectBtnProps) {
  const connectInner = useMemo(() => (
    pkey ? textEllipsis(pkey, 7, { ellipsis: '' }) : 'connect'
  ), [pkey]);

  const onConnectHandler = () => {
    if (!pkey)onConnect();
  };

  const btnClassname = pkey ? styles.connectBtnLogined : styles.connectBtn;

  useEffect(() => {
    if (pkey) {
      notification.open({
        message: ToastMessages.WALLET_CONNECTED,
        placement: 'bottomRight' as NotificationPlacement
      });
    }
  }, [pkey]);

  return (
    <BeamButton classes={btnClassname} callback={onConnectHandler}>
      {connectInner}
    </BeamButton>
  );
}

export default ConnectBtn;
