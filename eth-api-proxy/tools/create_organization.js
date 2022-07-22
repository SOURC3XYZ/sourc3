const dotenv = require("dotenv");

dotenv.config();

const eth_utils = require("../utils/eth_utils.js");
const Web3 = require("web3");
const Sourc3Contract = require("../utils/Sourc3.json");
const program = require("commander");

let web3_instance = new Web3(new Web3.providers.HttpProvider(process.env.ETH_HTTP_PROVIDER));
const sourc3Contract = new web3_instance.eth.Contract(
    Sourc3Contract.abi,
    process.env.ETH_SOURC3_CONTRACT
);

let createOrganization = async (name) => {
    const tx = sourc3Contract.methods.createOrganization(name);

    const txReceipt = await eth_utils.requestToContract(
        web3_instance,
        process.env.ETH_ADDRESS,
        process.env.ETH_SOURC3_CONTRACT,
        process.env.ETH_PRIVATE_KEY,
        tx.encodeABI(),
        process.env.ETH_TEST_GAS_LIMIT);

    return txReceipt;
}

(async () => {
    console.log("Calling 'createOrganization' of Sourc3 contract:")

    program.option('-n, --name <string>', 'Organization name', 'Test')
    program.parse(process.argv)

    const options = program.opts()
    const txReceipt = await createOrganization(options.name)

    console.log("txReceipt: ", txReceipt)
    console.log("'createOrganization' is finished.")
})();
