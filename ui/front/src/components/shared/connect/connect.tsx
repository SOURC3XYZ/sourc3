import { useWebSocket } from '@components/context';
import { EVENTS } from '@libs/constants';
import { useCustomEvent, useMetaMask } from '@libs/hooks/shared';
import { useEffect, useState } from 'react';
import {
  providers, Contract
} from 'ethers';
import { Button } from 'antd';

const abi = [
  'function getRepo(uint64 id) public view returns (string memory, address, uint64, uint64, uint64, string memory)',
  'function loadState(uint64 repoId) public view returns (string memory state, uint64 curObjects, uint64 curMetas)',
  'function getRepoId(address owner, string memory name) public view returns (uint64)',
  'function pushState(uint64 repoId, uint64 objsCount, uint64 metasCount, string memory expectedState, string memory state) public'
];

interface Sourc3Contract extends Contract {
  getRepoId: (...args: any) => any;
  getRepo: (...args: any) => any;
  loadState: (...args: any) => any;
  pushState: (...args: any) => any;
}

function Connect() {
  const [isConnected, manageConnection, wsSend] = useWebSocket();
  const {
    status, connect, account, chainId, ethereum
  } = useMetaMask();

  const [contract, setContract] = useState<Sourc3Contract | null>(null);

  const smartContractCall = async (...args: any[]) => {
    if (contract) {
      const repoID = await contract.pushState(...args);
      console.log('repoID', repoID);
      return repoID as {};
    } return {};
  };

  const sendTx = async (data: any) => {
    const { id } = data;
    delete data.id;
    const txData = await smartContractCall(...Object.values(data));
    wsSend({ id, ...txData });
    // console.log(+summ / 1000000000000000000);
    console.log('txData', id);
  };

  useCustomEvent(EVENTS.WS_PING, ((event: CustomEvent) => {
    sendTx(event.detail);
  }) as EventListener);

  useEffect(() => {
    if (!isConnected) manageConnection();
  }, []);

  const setContractHanlder = async () => {
    if (!contract && status === 'connected') {
      const provider = new providers.Web3Provider(ethereum);
      const signer = await provider.getSigner();
      const sourc3Contract = new Contract(
        '0xDc552A8da76db75f9f2658906F34041CEE3fEC80',
        abi,
        signer
      ) as Sourc3Contract;
      setContract(sourc3Contract);
    }
  };

  useEffect(() => {
    setContractHanlder();
  }, [status]);

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

        <Button onClick={smartContractCall}> get accs</Button>
      </>

    );
  }

  return null;
}

export default Connect;
