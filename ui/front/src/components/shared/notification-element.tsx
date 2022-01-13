import { STATUS } from '@libs/constants';
import { SetPropertiesType, TxItem, TxResponse } from '@types';
import { notification } from 'antd';
import { NotificationPlacement } from 'antd/lib/notification';
import React from 'react';

type NotificationElementProps = {
  txItem: TxItem;
  removeTx: (txItem: TxItem) => void
  checkTxStatus: (
    txId: string, callback: SetPropertiesType<TxResponse>) => void;
  setNotifiedTrue: (txItem: TxItem) => void
};

const NotificationElement = ({
  txItem,
  checkTxStatus,
  removeTx,
  setNotifiedTrue
}: NotificationElementProps) => {
  const [properties, setProperties] = React.useState<TxResponse | null>(null);
  const timeoutIdRef = React.useRef<NodeJS.Timeout | null>(null);

  const checkTx = (time: number = 0) => {
    timeoutIdRef.current = setTimeout(() => {
      checkTxStatus(txItem.id, setProperties as SetPropertiesType<TxResponse>);
    }, time);
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  };

  const checkTxCall = ({ status_string }: TxResponse) => {
    if (status_string !== STATUS.FAILED
      && status_string !== STATUS.COMPLETED) {
      checkTx(2000);
    }
  };

  const notificationManager = () => {
    if (properties) {
      const notificationProps = {
        message: properties.message,
        description: txItem.id as React.ReactNode,
        placement: 'bottomRight' as NotificationPlacement
      };
      switch (properties.status_string) {
        case STATUS.IN_PROGRESS:
        case STATUS.PENDING:
          if (!txItem.notified) {
            notification.open(notificationProps);
            setNotifiedTrue(txItem);
          }
          checkTxCall(properties);
          break;
        case STATUS.FAILED:
          notification.error(notificationProps);
          removeTx(txItem);
          break;
        case STATUS.COMPLETED:
          notification.success(notificationProps);
          removeTx(txItem);
          break;
        default:
          break;
      }
    }
  };

  React.useEffect(checkTx, []);

  React.useEffect(notificationManager, [properties]);

  return <></>;
};

export default NotificationElement;
