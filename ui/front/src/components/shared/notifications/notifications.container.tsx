import { useNotification } from '@libs/hooks/container/notifications';
import { NotificationElement } from './content';

function Notifications() {
  const {
    txs, removeTx, setNotifiedTrue, checkTxStatus
  } = useNotification();

  const maped = txs.map(
    (el) => (
      <NotificationElement
        key={el.id}
        txItem={el}
        checkTxStatus={checkTxStatus}
        removeTx={removeTx}
        setNotifiedTrue={setNotifiedTrue}
      />
    )
  );
  return <>{maped}</>;
}

export default Notifications;
