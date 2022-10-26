import { BeamButton } from '@components/shared';
import { ToastMessages } from '@libs/constants';
import { textEllipsis } from '@libs/utils';
import { NotificationPlacement, User } from '@types';
import { notification } from 'antd';
import { useEffect, useMemo } from 'react';
import styles from './connect-btn.module.scss';
import { badConnectPopup } from './hocs';

const WORD_COUNT = 7;

const CONNECT = 'Connect wallet';

type ConnectBtnProps = {
  pkey: string;
  users: User[];
  onConnect: () => void;
};

function ConnectBtn({ pkey, users, onConnect }:ConnectBtnProps) {
  const connectInner = useMemo(() => {
    const foundActive = users.find((el) => el.active);
    if (pkey) return textEllipsis(foundActive?.name || pkey, WORD_COUNT, { ellipsis: '' });
    return CONNECT;
  }, [pkey, users]);

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

export default badConnectPopup(ConnectBtn);
