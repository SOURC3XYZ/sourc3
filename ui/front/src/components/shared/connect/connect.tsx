import { Button } from 'antd';
import { useMetaMask } from 'metamask-react';
import { useConnectFromDesktop } from './useConnectFromDesktop';

function Connect() {
  const [, ping] = useConnectFromDesktop();
  const {
    status, connect, account, chainId, ethereum
  } = useMetaMask();

  console.log('ethereum', ethereum.selectedAddress);

  const transactionParameters = {
    gasPrice: '0x09184e72a000', // customizable by user during MetaMask confirmation.
    // gas: '0x2710', // customizable by user during MetaMask confirmation.
    to: '0x7CB5ba674b8167A032855E1DcC033c405bE17918', // Required except during contract publications.
    from: ethereum.selectedAddress, // must match user's active address.
    value: '0x1aa535d3d0c0000' // Only required to send ether to the recipient from the initiating external account.
  };

  const getAccs = async () => {
    const summ = await ethereum.request(
      { method: 'eth_sendTransaction', params: [transactionParameters] }
    );
    // console.log(+summ / 1000000000000000000);
    console.log(summ);
  };

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
        <Button onClick={getAccs}> get accs</Button>
      </>

    );
  }

  return null;
}

export default Connect;
