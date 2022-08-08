import { Wallet, providers, Contract } from 'ethers';
import {
  ETH_HTTP_PROVIDER, ETH_SOURC3_CONTRACT, HD_PATH, MNEMONIC
} from '../common';

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
const sourc3Contract = new Contract(
  ETH_SOURC3_CONTRACT as string,
  abi,
  walletSigner
) as ContractCustom;

export async function get_netid() {
  try {
    const network = await provider.getNetwork();

    return network.chainId;
  } catch (err) {
    console.error('net.getId is failed');
    throw err;
  }
}

export async function getRepoId(args:any) {
  try {
    const repoId = await sourc3Contract.getRepoId(args.owner, args.name);
    return repoId.toString();
  } catch (err) {
    console.error('getRepoId is failed - ', err);
    throw err;
  }
}

export async function getRepo(args:any) {
  try {
    const res = await sourc3Contract.getRepo(args.repoId);
    return res;
  } catch (err) {
    console.error('getRepo is failed - ', err);
    throw err;
  }
}

export async function loadState(args:any) {
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

export async function pushState(args:any) {
  try {
    const tx = await sourc3Contract.pushState(
      args.repoId,
      args.objsCount,
      args.metasCount,
      args.expectedState,
      args.state
    );

    const txReceipt = await tx.wait();

    if (txReceipt.status) {
      return { transactionHash: txReceipt.transactionHash };
    }
    throw txReceipt;
  } catch (err) {
    console.error('pushState is failed - ', err);
    throw err;
  }
}
