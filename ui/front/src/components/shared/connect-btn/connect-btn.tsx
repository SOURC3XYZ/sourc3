import { LoadingOutlined } from '@ant-design/icons';
import { BeamButton } from '@components/shared';
import { ToastMessages } from '@libs/constants';
import { loadingData } from '@libs/utils';
import { PromiseArg } from '@types';
import { notification } from 'antd';
import { NotificationPlacement } from 'antd/lib/notification';
import { useMemo, useState } from 'react';
import styles from './connect-btn.module.scss';

type ConnectBtnProps = {
  isLogined: boolean;
  onConnect: (resolve:PromiseArg<void>, reject?: PromiseArg<Error>) => void;
};

function ConnectBtn({ isLogined, onConnect }:ConnectBtnProps) {
  const [isOnConnect, setOnConnect] = useState(false);

  const connectBtnClassName = isOnConnect ? styles.connectBtnOnConnect : styles.connectBtn;

  const setOnConnectHandler = () => {
    if (isOnConnect || isLogined) return;
    setOnConnect(true);
    loadingData(onConnect)
      .then(() => {
        notification.open({
          message: ToastMessages.WALLET_CONNECTED,
          placement: 'bottomRight' as NotificationPlacement,
          style: { fontWeight: 600 }
        });
      })
      .catch((err:Error) => {
        setOnConnect(false);
        notification.error({
          message: err.message,
          placement: 'bottomRight' as NotificationPlacement,
          style: { fontWeight: 600 }
        });
      });
  };

  const notLoadedInner = useMemo(() => (isOnConnect
    ? <LoadingOutlined spin />
    : 'connect'), [isOnConnect]);

  const connectInner = useMemo(() => (
    isLogined
      ? 'wallet'
      : notLoadedInner), [isLogined, notLoadedInner]);

  return (
    <BeamButton classes={connectBtnClassName} callback={setOnConnectHandler}>
      {connectInner}
    </BeamButton>
  );
}

export default ConnectBtn;
