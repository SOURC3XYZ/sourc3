const jayson = require('jayson/promise');
const dotenv = require('dotenv');
const ethers = require('ethers');

dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_HTTP_PROVIDER);
const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC, process.env.HD_PATH);
const walletSigner = wallet.connect(provider);
const abi = [
  'function getRepo(uint64 id) public view returns (string memory, address, uint64, uint64, uint64, string memory)',
  'function loadState(uint64 repoId) public view returns (string memory state, uint64 curObjects, uint64 curMetas)',
  'function getRepoId(address owner, string memory name) public view returns (uint64)',
  'function pushState(uint64 repoId, uint64 objsCount, uint64 metasCount, string memory expectedState, string memory state) public'
];
const sourc3Contract = new ethers.Contract(process.env.ETH_SOURC3_CONTRACT, abi, walletSigner);

export const ethApi = async () => {
  // create a server
  const server = new jayson.Server({
    async get_netid() {
      try {
        const network = await provider.getNetwork();

        return network.chainId;
      } catch (err) {
        console.error('net.getId is failed');
        throw err;
      }
    },
    async getRepoId(args) {
      try {
        const repoId = await sourc3Contract.getRepoId(args.owner, args.name);
        return repoId.toString();
      } catch (err) {
        console.error('getRepoId is failed - ', err);
        throw err;
      }
    },
    async getRepo(args) {
      try {
        return await sourc3Contract.getRepo(args.repoId);
      } catch (err) {
        console.error('getRepo is failed - ', err);
        throw err;
      }
    },
    async loadState(args) {
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
    },
    async pushState(args) {
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
  });

  // run API HTTP server
  server.http().listen(process.env.PORT);
};
