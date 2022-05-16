import { BeamButton } from '@components/shared';
import { ToastMessages } from '@libs/constants';
import { NotificationPlacement } from '@types';
import { notification } from 'antd';
import { useEffect, useMemo } from 'react';
import styles from './connect-btn.module.scss';

type ConnectBtnProps = {
  isLogined: boolean;
  onConnect: () => void;
};

function ConnectBtn({ isLogined, onConnect }:ConnectBtnProps) {
  const connectInner = useMemo(() => (
    isLogined
      ? 'wallet'
      : 'connect'), [isLogined]);

  const onConnectHandler = () => {
    if (!isLogined)onConnect();
  };

  const btnClassname = isLogined ? styles.connectBtnLogined : styles.connectBtn;

  useEffect(() => {
    if (isLogined) {
      notification.open({
        message: ToastMessages.WALLET_CONNECTED,
        placement: 'bottomRight' as NotificationPlacement
      });
    }
  }, [isLogined]);

  return (
    <BeamButton classes={btnClassname} callback={onConnectHandler}>
      {connectInner}
    </BeamButton>
  );
}

export default ConnectBtn;
