const jayson = require('jayson/promise');
const dotenv = require("dotenv");
const Web3 = require("web3");
const Sourc3Contract = require("./utils/Sourc3.json");
const eth_utils = require("./utils/eth_utils.js");

dotenv.config()

const web3ProviderOptions = {
    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false,
    },
}
let web3 = new Web3(
    new Web3.providers.HttpProvider(
        process.env.ETH_HTTP_PROVIDER,
        web3ProviderOptions
    )
)
const sourc3Contract = new web3.eth.Contract(
    Sourc3Contract.abi,
    process.env.ETH_SOURC3_CONTRACT
);

(async () => {
    // create a server
    const server = new jayson.Server({
        get_netid: async function() {
            try {
                return await web3.eth.net.getId()
                // return await web3.eth.net.getNetworkType() // This is not a 100% accurate
            } catch (err) {
                logger.error(`net.getId is failed`)
                throw err
            }
        },
        getRepoId: async function(args) {
            try {
                return await sourc3Contract.methods.getRepoId(args.owner, args.name).call()
            } catch (err) {
                console.error(`getRepoId is failed - `, err)
                throw err
            }
        },
        getRepo: async function(args) {
            try {
                return await sourc3Contract.methods.getRepo(args.repoId).call()
            } catch (err) {
                console.error(`getRepo is failed - `, err)
                throw err
            }
        },
        loadState: async function(args) {
            try {
                return await sourc3Contract.methods.loadState(args.repoId).call()
            } catch (err) {
                console.error(`loadState is failed - `, err)
                throw err
            }
        },
        pushState: async function(args) {
            try {
                const tx = sourc3Contract.methods.pushState(args.repoId, args.objsCount,
                     args.metasCount, args.expectedState, args.state)

                const txReceipt = await eth_utils.requestToContract(
                    web3,
                    process.env.ETH_ADDRESS,
                    process.env.ETH_SOURC3_CONTRACT,
                    process.env.ETH_PRIVATE_KEY,
                    tx.encodeABI(),
                    process.env.ETH_TEST_GAS_LIMIT);
                
                if (txReceipt.status) {
                    return {"transactionHash": txReceipt["transactionHash"]};
                }
                throw txReceipt
            } catch (err) {
                console.error(`pushState is failed - `, err)
                throw err
            }
        },
    })
    
    // run API HTTP server
    server.http().listen(process.env.PORT)
})()