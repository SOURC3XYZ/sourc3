import { useWebSocket } from '@components/context';
import { EVENTS } from '@libs/constants';
import { useCustomEvent } from '@libs/hooks/shared';
import { Button } from 'antd';
import { useMetaMask } from 'metamask-react';
import { useEffect } from 'react';

function Connect() {
  const [isConnected, manageConnection, wsSend] = useWebSocket();
  const {
    status, connect, account, chainId, ethereum
  } = useMetaMask();

  const senTx = async (data: any) => {
    const txid = await ethereum.request(data);
    wsSend(JSON.stringify({ txid }));
    // console.log(+summ / 1000000000000000000);
    console.log(txid);
  };

  useCustomEvent(EVENTS.WS_PING, ((event: CustomEvent) => {
    senTx(event.detail);
  }) as EventListener);

  useEffect(() => {
    if (!isConnected) manageConnection();
  }, []);

  if (status === 'initializing') return <div>Synchronisation with MetaMask ongoing...</div>;

  if (status === 'unavailable') return <div>MetaMask not available :(</div>;

  if (status === 'notConnected') {
    return (
      <button
        type="button"
        onClick={connect}
      >
        Connect to MetaMask
      </button>
    );
  }

  if (status === 'connecting') return <div>Connecting...</div>;

  if (status === 'connected') {
    return (
      <>
        <div>
          Connected account
          {' '}
          {account}
          {' '}
          on chain ID
          {' '}
          {chainId}
        </div>
        {/* <Button onClick={getAccs}> get accs</Button> */}
      </>

    );
  }

  return null;
}

export default Connect;
