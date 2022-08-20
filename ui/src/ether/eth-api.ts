import { Wallet, providers, Contract } from 'ethers';
import jayson from 'jayson/promise';
import WebSocket from 'ws';
import {
  ETH_HTTP_PROVIDER, ETH_SOURC3_CONTRACT, HD_PATH, MNEMONIC, PORT
} from '../common';
/* eslint-disable no-case-declarations */

interface ContractCustom extends Contract {
  getRepoId: (...args: any) => any;
  getRepo: (...args: any) => any;
  loadState: (...args: any) => any;
  pushState: (...args: any) => any;
}

const provider = new providers.JsonRpcProvider(ETH_HTTP_PROVIDER);
const wallet = Wallet.fromMnemonic(MNEMONIC as string, HD_PATH);
const walletSigner = wallet.connect(provider);
const abi = [
  'function getRepo(uint64 id) public view returns (string memory, address, uint64, uint64, uint64, string memory)',
  'function loadState(uint64 repoId) public view returns (string memory state, uint64 curObjects, uint64 curMetas)',
  'function getRepoId(address owner, string memory name) public view returns (uint64)',
  'function pushState(uint64 repoId, uint64 objsCount, uint64 metasCount, string memory expectedState, string memory state) public'
];

let callIndex = 0;

let connectionResolve: (value: WebSocket) => void;

const calls: { [key: string]: any } = {};

let savedClient:WebSocket;

const wsServer = new WebSocket.Server({ port: 9000 });

const onConnect = async (message:Buffer) => {
  const answer = JSON.parse(message.toString());
  console.log(answer);
  const { id } = answer;
  const cback = calls[id];
  delete calls[id];
  if (!cback) console.log('unknown command');
  return cback(answer);
};

wsServer.on('connection', (wsClient:WebSocket) => {
  if (connectionResolve) connectionResolve(wsClient);
  wsClient.on('message', onConnect);
  wsClient.on('close', () => console.log('user disconnected'));
});

const connectToBrowser = (shell: Electron.Shell) => new Promise(
  (resolve) => {
    if (savedClient) return resolve(savedClient);
    shell.openExternal('http://localhost:3000/connect');
    connectionResolve = (wsClient:WebSocket) => resolve(wsClient);
    return undefined;
  }
);

const sourc3Contract = new Contract(
  ETH_SOURC3_CONTRACT as string,
  abi,
  walletSigner
) as ContractCustom;

// export const connectToBrowser = () => new Promise<void>((resolve) => {
//     socket.on('close', () => {
//       loggerLevel('info', 'tcp connection closed');
//     });

//     socket.on('error', (data: Buffer) => {
//       const str = data.toString('utf-8');
//       loggerLevel('error', `socket error: ${str}`);
//     });

//     socket.on('data', (data) => {
//       acc += data.toString();

//       while (true) {
//         const br = acc.indexOf('\n');
//         if (br === -1) return;

//         const split = acc.split('\n');
//         const response = split[0];
//         acc = split.slice(1).join('\n');
//         if (response) onResponce(response);
//       }
//     });
//     resolve();
//   });
// });

// export const ethApi = () => {
//   const wsServer = new WebSocket.Server({ port: 9000 });
//   wsServer.on('connection', onConnect);
// };

const sendParams = (socket: WebSocket, req: any) => new Promise((resolve) => {
  console.log('sent');
  const id = ['call', callIndex++].join('-');
  const json = JSON.stringify({
    action: 'TX_SEND',
    data: { id, ...req }
  });
  socket.send(json);
  calls[id] = resolve;
});

export function createContractMethods(shell: Electron.Shell) {
  async function get_netid() {
    try {
      const network = await provider.getNetwork();

      return network.chainId;
    } catch (err) {
      console.error('net.getId is failed');
      throw err;
    }
  }

  async function getRepoId(args:any) {
    try {
      const repoId = await sourc3Contract.getRepoId(args.owner, args.name);
      return repoId.toString();
    } catch (err) {
      console.error('getRepoId is failed - ', err);
      throw err;
    }
  }

  async function getRepo(args:any) {
    try {
      const res = await sourc3Contract.getRepo(args.repoId);
      return res;
    } catch (err) {
      console.error('getRepo is failed - ', err);
      throw err;
    }
  }

  async function loadState(args:any) {
    try {
      const result = await sourc3Contract.loadState(args.repoId);
      const state = {
        state: result[0],
        curObjects: result[1].toString(),
        curMetas: result[2].toString()
      };
      return state;
    } catch (err) {
      console.error('loadState is failed - ', err);
      throw err;
    }
  }

  async function pushState(args: any) {
    try {
      const socket = await connectToBrowser(shell) as WebSocket;
      if (!savedClient) savedClient = socket;
      console.log('args', args);
      const tx = await sendParams(socket, args);
      // const tx = await sourc3Contract.pushState(
      //   args.repoId,
      //   args.objsCount,
      //   args.metasCount,
      //   args.expectedState,
      //   args.state
      // );

      // const txReceipt = await tx.wait();

      // if (txReceipt.status) {
      //   return { transactionHash: txReceipt.transactionHash };
      // }
      // throw txReceipt;
      return tx;
    } catch (err) {
      console.error('pushState is failed - ', err);
      throw err;
    }
  }

  return new jayson.Server({
    get_netid,
    getRepoId,
    getRepo,
    loadState,
    pushState
  });
}

export const startEtherApi = (server: jayson.Server) => {
  const api = server.http().listen(PORT);
  api.on('listening', () => {
    console.log('started ether api');
  });
};
